import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Clock, User, Activity, UserPlus } from 'lucide-react';
import type { Patient, Doctor } from '@/types/hospital';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PatientCardProps {
  patient: Patient;
  index: number;
  doctors?: Doctor[];
  onAssignDoctor?: (doctorId: string) => void;
}

const severityConfig = {
  critical: {
    bg: 'bg-critical/10',
    border: 'border-critical',
    badge: 'bg-critical text-critical-foreground',
    label: 'Critical',
  },
  serious: {
    bg: 'bg-serious/10',
    border: 'border-serious',
    badge: 'bg-serious text-serious-foreground',
    label: 'Serious',
  },
  stable: {
    bg: 'bg-stable/10',
    border: 'border-stable',
    badge: 'bg-stable text-stable-foreground',
    label: 'Stable',
  },
  'non-urgent': {
    bg: 'bg-non-urgent/10',
    border: 'border-non-urgent',
    badge: 'bg-non-urgent text-non-urgent-foreground',
    label: 'Non-Urgent',
  },
};

export function PatientCard({ patient, index, doctors, onAssignDoctor }: PatientCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const severity = patient.triageResult?.severity || 'stable';
  const config = severityConfig[severity];

  const waitTime = Math.floor((Date.now() - new Date(patient.arrivalTime).getTime()) / 60000);
  const assignedDoctorName = doctors?.find(d => d.id === patient.assignedDoctor)?.name;

  const handleAssign = () => {
    if (selectedDoctor && onAssignDoctor) {
      onAssignDoctor(selectedDoctor);
      setSelectedDoctor('');
    }
  };

  const availableDoctors = doctors?.filter(d => d.status !== 'off-duty' && d.currentPatients < d.maxPatients) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'rounded-xl border-2 overflow-hidden transition-all duration-200',
        config.bg,
        config.border
      )}
    >
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-card">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{patient.name}</span>
              <span className="text-sm text-muted-foreground">({patient.id})</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{patient.age}y, {patient.gender}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {waitTime}m wait
              </span>
              {assignedDoctorName && (
                <span className="text-primary font-medium">
                  → {assignedDoctorName}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className={config.badge}>{config.label}</Badge>
          {patient.allocationDecision && (
            <Badge variant="outline">{patient.allocationDecision}</Badge>
          )}
          {patient.assignedDoctor && (
            <Badge className="bg-primary text-primary-foreground">Assigned</Badge>
          )}
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border"
          >
            <div className="p-4 space-y-4">
              {/* Vitals */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Vital Signs
                </h4>
                <div className="grid grid-cols-5 gap-2">
                  <VitalBadge label="HR" value={`${patient.vitals.heartRate} bpm`} />
                  <VitalBadge label="BP" value={`${patient.vitals.bloodPressure.systolic}/${patient.vitals.bloodPressure.diastolic}`} />
                  <VitalBadge label="SpO2" value={`${patient.vitals.oxygenSaturation}%`} />
                  <VitalBadge label="Temp" value={`${patient.vitals.temperature.toFixed(1)}°C`} />
                  <VitalBadge label="RR" value={`${patient.vitals.respiratoryRate}/min`} />
                </div>
              </div>

              {/* Doctor Assignment */}
              {!patient.assignedDoctor && onAssignDoctor && (
                <div className="bg-secondary/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-primary" />
                    Assign Doctor
                  </h4>
                  <div className="flex gap-3">
                    <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDoctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name} - {doctor.specialty} ({doctor.currentPatients}/{doctor.maxPatients})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={(e) => { e.stopPropagation(); handleAssign(); }}
                      disabled={!selectedDoctor}
                    >
                      Assign
                    </Button>
                  </div>
                </div>
              )}

              {/* Triage Analysis */}
              {patient.triageResult && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">🔴 Triage Analysis</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {patient.triageResult.reasoning.slice(0, 3).map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risk Assessment */}
              {patient.riskAssessment && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">⚠️ Risk Assessment</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={patient.riskAssessment.riskLevel === 'high' ? 'destructive' : 'secondary'}>
                      {patient.riskAssessment.riskLevel.toUpperCase()} RISK
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Deterioration probability: {patient.riskAssessment.deteriorationProbability}%
                    </span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {patient.riskAssessment.factors.slice(0, 2).map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-serious">•</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function VitalBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card rounded-lg p-2 text-center">
      <span className="text-xs text-muted-foreground block">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
