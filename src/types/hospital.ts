export type SeverityLevel = 'critical' | 'serious' | 'stable' | 'non-urgent';
export type AllocationDecision = 'ICU' | 'Ward' | 'Wait' | 'Refer' | 'Discharge';
export type BedStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  arrivalTime: Date;
  vitals: {
    heartRate: number;
    bloodPressure: { systolic: number; diastolic: number };
    temperature: number;
    oxygenSaturation: number;
    respiratoryRate: number;
  };
  symptoms: string[];
  comorbidities: string[];
  chiefComplaint: string;
  triageResult?: TriageResult;
  riskAssessment?: RiskAssessment;
  allocationDecision?: AllocationDecision;
  assignedBed?: string;
  assignedDoctor?: string;
  status: 'waiting' | 'triaged' | 'admitted' | 'discharged';
}

export interface TriageResult {
  severity: SeverityLevel;
  score: number;
  reasoning: string[];
  timestamp: Date;
}

export interface RiskAssessment {
  riskLevel: 'low' | 'medium' | 'high';
  deteriorationProbability: number;
  factors: string[];
  override: boolean;
}

export interface HospitalResources {
  icuBeds: { total: number; available: number };
  wardBeds: { total: number; available: number };
  doctors: { total: number; available: number };
  ventilators: { total: number; available: number };
  oxygenSupply: { total: number; available: number };
  ambulances: { total: number; available: number };
}

export interface Bed {
  id: string;
  type: 'ICU' | 'Ward' | 'Emergency';
  floor: number;
  status: BedStatus;
  patientId?: string;
  patientName?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  status: 'available' | 'busy' | 'off-duty';
  currentPatients: number;
  maxPatients: number;
  password?: string;
}

export interface VoiceOrder {
  id: string;
  doctorId: string;
  patientId: string;
  transcript: string;
  structuredOrder: {
    action: string;
    parameters: Record<string, string | number>;
    priority: 'high' | 'medium' | 'low';
  };
  status: 'pending' | 'confirmed' | 'cancelled';
  timestamp: Date;
}

export interface PredictiveData {
  date: string;
  predictedPatients: number;
  icuDemand: number;
  wardDemand: number;
  oxygenDemand: number;
  ventilatorDemand: number;
  confidence: number;
  factors: string[];
}

export interface ScheduleEvent {
  date: Date;
  expectedPatients: number;
  riskLevel: 'low' | 'medium' | 'high';
  notes: string;
}
