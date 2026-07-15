import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, CheckCircle, XCircle, Edit, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useHospitalStore } from '@/store/hospitalStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ParsedOrder {
  oxygen: string;
  bedType: string;
  priority: string;
  medication?: string;
}

export default function VoiceOrders() {
  const { addVoiceOrder, patients } = useHospitalStore();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedOrder, setParsedOrder] = useState<ParsedOrder | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrder, setEditedOrder] = useState<ParsedOrder | null>(null);

  const parseTranscript = (text: string): ParsedOrder => {
    const order: ParsedOrder = {
      oxygen: '5 L/min',
      bedType: 'ICU',
      priority: 'High',
    };

    // Parse oxygen
    const oxygenMatch = text.match(/oxygen\s*(?:at)?\s*(\d+)\s*(?:liters?|l)/i);
    if (oxygenMatch) {
      order.oxygen = `${oxygenMatch[1]} L/min`;
    }

    // Parse bed type
    if (text.toLowerCase().includes('icu')) {
      order.bedType = 'ICU';
    } else if (text.toLowerCase().includes('ward')) {
      order.bedType = 'Ward';
    }

    // Parse priority
    if (text.toLowerCase().includes('urgent') || text.toLowerCase().includes('critical')) {
      order.priority = 'Critical';
    } else if (text.toLowerCase().includes('high')) {
      order.priority = 'High';
    } else if (text.toLowerCase().includes('medium')) {
      order.priority = 'Medium';
    }

    // Parse medication
    const medicationMatch = text.match(/(?:give|administer)\s+(\w+(?:\s+\w+)?)/i);
    if (medicationMatch && !medicationMatch[1].toLowerCase().includes('patient') && !medicationMatch[1].toLowerCase().includes('oxygen')) {
      order.medication = medicationMatch[1];
    }

    return order;
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate recording and speech-to-text
      setTimeout(() => {
        const sampleTranscript = 'Give patient oxygen at 5 liters per minute and assign ICU bed';
        setTranscript(sampleTranscript);
        const parsed = parseTranscript(sampleTranscript);
        setParsedOrder(parsed);
        setEditedOrder(parsed);
        setIsRecording(false);
      }, 3000);
    }
  };

  const handleConfirm = () => {
    const orderToSave = isEditing ? editedOrder : parsedOrder;
    if (!orderToSave) return;

    const voiceOrder = {
      id: `VO-${Date.now().toString(36).toUpperCase()}`,
      doctorId: 'DR-001',
      patientId: patients[0]?.id || 'PT-001',
      transcript,
      structuredOrder: {
        action: 'treatment',
        parameters: {
          oxygen: orderToSave.oxygen,
          bedType: orderToSave.bedType,
          medication: orderToSave.medication || 'None',
        },
        priority: orderToSave.priority.toLowerCase() as 'high' | 'medium' | 'low',
      },
      status: 'confirmed' as const,
      timestamp: new Date(),
    };

    addVoiceOrder(voiceOrder);
    toast.success('Voice order confirmed and applied', {
      description: `Order saved: ${orderToSave.bedType} bed, ${orderToSave.oxygen} oxygen`,
    });

    // Reset state
    setTranscript('');
    setParsedOrder(null);
    setEditedOrder(null);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedOrder(parsedOrder);
  };

  const handleCancel = () => {
    toast.info('Voice order cancelled');
    setTranscript('');
    setParsedOrder(null);
    setEditedOrder(null);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    setParsedOrder(editedOrder);
    setIsEditing(false);
    toast.success('Order updated');
  };

  const currentOrder = isEditing ? editedOrder : parsedOrder;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
          <Mic className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Voice Orders</h1>
          <p className="text-muted-foreground">Voice-based doctor order automation</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-8 text-center"
      >
        <button
          onClick={handleToggleRecording}
          className={cn(
            "w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 transition-all",
            isRecording ? "bg-critical animate-pulse" : "bg-primary hover:bg-primary/90"
          )}
        >
          {isRecording ? (
            <MicOff className="h-12 w-12 text-white" />
          ) : (
            <Mic className="h-12 w-12 text-white" />
          )}
        </button>
        <p className="text-lg text-muted-foreground mb-4">
          {isRecording ? 'Listening...' : 'Tap to start recording'}
        </p>

        {/* Recording Animation */}
        {isRecording && (
          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-critical rounded-full"
                animate={{ height: [16, 32, 16] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        )}

        {transcript && (
          <div className="mt-8 text-left max-w-xl mx-auto space-y-4">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Transcript</h4>
              <p className="text-foreground">"{transcript}"</p>
            </div>

            {currentOrder && (
              <div className="p-4 bg-primary/10 rounded-lg">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Structured Order {isEditing && <span className="text-primary">(Editing)</span>}
                </h4>
                
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Oxygen</Label>
                        <Input
                          value={editedOrder?.oxygen || ''}
                          onChange={(e) => setEditedOrder({ ...editedOrder!, oxygen: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Bed Type</Label>
                        <Input
                          value={editedOrder?.bedType || ''}
                          onChange={(e) => setEditedOrder({ ...editedOrder!, bedType: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Priority</Label>
                        <Input
                          value={editedOrder?.priority || ''}
                          onChange={(e) => setEditedOrder({ ...editedOrder!, priority: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Medication</Label>
                        <Input
                          value={editedOrder?.medication || ''}
                          onChange={(e) => setEditedOrder({ ...editedOrder!, medication: e.target.value })}
                          className="h-8 text-sm"
                          placeholder="None"
                        />
                      </div>
                    </div>
                    <Button onClick={handleSaveEdit} size="sm" className="w-full">
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-1 text-sm text-foreground">
                    <li>• Oxygen: {currentOrder.oxygen}</li>
                    <li>• Bed Type: {currentOrder.bedType}</li>
                    <li>• Priority: {currentOrder.priority}</li>
                    {currentOrder.medication && <li>• Medication: {currentOrder.medication}</li>}
                  </ul>
                )}
              </div>
            )}

            {!isEditing && (
              <div className="flex gap-3 justify-center">
                <Button onClick={handleConfirm} className="gap-2">
                  <CheckCircle className="h-4 w-4" /> Confirm
                </Button>
                <Button variant="outline" onClick={handleEdit} className="gap-2">
                  <Edit className="h-4 w-4" /> Edit
                </Button>
                <Button variant="destructive" onClick={handleCancel} className="gap-2">
                  <XCircle className="h-4 w-4" /> Cancel
                </Button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          Voice Order Tips
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Speak clearly: "Give patient oxygen at 5 liters per minute"</li>
          <li>• Specify bed type: "Assign ICU bed" or "Move to ward bed"</li>
          <li>• Set priority: "Urgent" or "Critical" for high priority cases</li>
          <li>• Medication orders: "Administer paracetamol 500mg"</li>
        </ul>
      </motion.div>
    </div>
  );
}
