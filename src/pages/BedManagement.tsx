import { motion } from 'framer-motion';
import { BedDouble, CheckCircle, XCircle, Clock, Wrench, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import type { BedStatus, Bed } from '@/types/hospital';
import type { Patient } from '@/types/hospital';

const statusConfig: Record<BedStatus, { icon: React.ElementType; color: string; bg: string }> = {
  available: { icon: CheckCircle, color: 'text-non-urgent', bg: 'bg-non-urgent/10 border-non-urgent/30' },
  occupied: { icon: XCircle, color: 'text-critical', bg: 'bg-critical/10 border-critical/30' },
  reserved: { icon: Clock, color: 'text-serious', bg: 'bg-serious/10 border-serious/30' },
  maintenance: { icon: Wrench, color: 'text-muted-foreground', bg: 'bg-muted border-muted' },
};

export default function BedManagement() {
  const { beds, patients, updateBed } = useSupabaseData();

  const icuBeds = beds.filter(b => b.type === 'ICU');
  const wardBeds = beds.filter(b => b.type === 'Ward');

  const stats = {
    available: beds.filter(b => b.status === 'available').length,
    occupied: beds.filter(b => b.status === 'occupied').length,
    reserved: beds.filter(b => b.status === 'reserved').length,
    maintenance: beds.filter(b => b.status === 'maintenance').length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
          <BedDouble className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bed Management</h1>
          <p className="text-muted-foreground">Visual hospital floor layout with bed status</p>
        </div>
      </div>

      {/* Status Summary */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BedDouble className="h-5 w-5 text-primary" />
            Bed Management
          </h3>
          <div className="flex gap-3">
            <Badge className="bg-non-urgent text-non-urgent-foreground">{stats.available} Available</Badge>
            <Badge className="bg-critical text-critical-foreground">{stats.occupied} Occupied</Badge>
            <Badge className="bg-serious text-serious-foreground">{stats.reserved} Reserved</Badge>
            <Badge variant="outline">{stats.maintenance} Maintenance</Badge>
          </div>
        </div>
      </div>

      {/* ICU Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">ICU - Floor 3</h3>
            <span className="text-critical">⚠</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {icuBeds.filter(b => b.status === 'occupied').length}/{icuBeds.length} occupied
          </span>
        </div>
        
        <div className="grid grid-cols-5 gap-4">
          {icuBeds.map((bed, index) => (
            <BedCard key={bed.id} bed={bed} index={index} patients={patients} updateBed={updateBed} />
          ))}
        </div>
      </motion.div>

      {/* Ward Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">General Ward - Floor 2</h3>
          <span className="text-sm text-muted-foreground">
            {wardBeds.filter(b => b.status === 'occupied').length}/{wardBeds.length} occupied
          </span>
        </div>
        
        <div className="grid grid-cols-5 gap-4">
          {wardBeds.map((bed, index) => (
            <BedCard key={bed.id} bed={bed} index={index} patients={patients} updateBed={updateBed} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function BedCard({ 
  bed, 
  index, 
  patients, 
  updateBed 
}: { 
  bed: Bed; 
  index: number; 
  patients: Patient[];
  updateBed: (id: string, updates: Partial<Bed>) => Promise<{ error: Error | null }>;
}) {
  const config = statusConfig[bed.status];
  const Icon = config.icon;
  
  // Find patient assigned to this bed
  const patient = patients.find(p => p.assignedBed === bed.id);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02 }}
      className={cn(
        'p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md min-h-[100px]',
        config.bg
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <Icon className={cn('h-6 w-6', config.color)} />
        <span className="text-sm font-medium text-foreground">{bed.id}</span>
        
        {/* Show patient info if bed is occupied */}
        {patient && (
          <div className="w-full mt-2 p-2 bg-background/50 rounded-lg">
            <div className="flex items-center gap-1 mb-1">
              <User className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-foreground truncate">
                {patient.name}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground block">
              {patient.age}y, {patient.gender}
            </span>
            <Badge 
              className={cn(
                'mt-1 text-[10px] h-5',
                patient.triageResult?.severity === 'critical' ? 'bg-critical' :
                patient.triageResult?.severity === 'serious' ? 'bg-serious' :
                patient.triageResult?.severity === 'stable' ? 'bg-stable' : 'bg-non-urgent'
              )}
            >
              {patient.triageResult?.severity || 'pending'}
            </Badge>
          </div>
        )}
        
        {bed.patientName && !patient && (
          <span className="text-xs text-muted-foreground truncate max-w-full">
            {bed.patientName}
          </span>
        )}
      </div>
    </motion.div>
  );
}
