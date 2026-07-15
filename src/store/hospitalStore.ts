import { create } from 'zustand';
import type { Patient, HospitalResources, Bed, Doctor, VoiceOrder, ScheduleEvent } from '@/types/hospital';

interface HospitalState {
  patients: Patient[];
  resources: HospitalResources;
  beds: Bed[];
  doctors: Doctor[];
  voiceOrders: VoiceOrder[];
  scheduleEvents: ScheduleEvent[];
  
  // Actions
  addPatient: (patient: Patient) => void;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  removePatient: (id: string) => void;
  updateResources: (updates: Partial<HospitalResources>) => void;
  updateBed: (id: string, updates: Partial<Bed>) => void;
  addVoiceOrder: (order: VoiceOrder) => void;
  generateEmergencySurge: () => void;
  dischargePatient: (id: string) => void;
}

const generatePatientId = () => `PT-${Date.now().toString(36).toUpperCase()}`;

const symptomsList = [
  'Chest pain', 'Shortness of breath', 'Fever', 'Headache', 'Abdominal pain',
  'Dizziness', 'Nausea', 'Fatigue', 'Cough', 'Back pain', 'Joint pain',
  'Confusion', 'Weakness', 'Palpitations', 'Swelling'
];

const comorbiditiesList = [
  'Diabetes', 'Hypertension', 'Heart disease', 'COPD', 'Asthma',
  'Kidney disease', 'Cancer', 'Obesity', 'Stroke history', 'Immunocompromised'
];

const names = [
  'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Singh', 'Vikram Reddy',
  'Anjali Gupta', 'Rajesh Verma', 'Pooja Mehta', 'Suresh Nair', 'Kavita Joshi',
  'Mohammed Ali', 'Lakshmi Rao', 'Arun Pillai', 'Deepa Iyer', 'Kiran Desai'
];

const generateRandomPatient = (): Patient => {
  const severity = Math.random();
  const isCritical = severity < 0.2;
  const isSerious = severity < 0.4;
  
  return {
    id: generatePatientId(),
    name: names[Math.floor(Math.random() * names.length)],
    age: Math.floor(Math.random() * 70) + 18,
    gender: (['Male', 'Female', 'Other'] as const)[Math.floor(Math.random() * 3)] as Patient['gender'],
    arrivalTime: new Date(),
    vitals: {
      heartRate: isCritical ? Math.floor(Math.random() * 40) + 120 : Math.floor(Math.random() * 30) + 60,
      bloodPressure: {
        systolic: isCritical ? Math.floor(Math.random() * 40) + 160 : Math.floor(Math.random() * 30) + 110,
        diastolic: isCritical ? Math.floor(Math.random() * 20) + 100 : Math.floor(Math.random() * 20) + 70,
      },
      temperature: isCritical ? 39 + Math.random() * 2 : 36.5 + Math.random() * 1.5,
      oxygenSaturation: isCritical ? Math.floor(Math.random() * 10) + 85 : Math.floor(Math.random() * 5) + 95,
      respiratoryRate: isCritical ? Math.floor(Math.random() * 10) + 25 : Math.floor(Math.random() * 8) + 12,
    },
    symptoms: symptomsList.slice(0, Math.floor(Math.random() * 4) + 1),
    comorbidities: comorbiditiesList.slice(0, Math.floor(Math.random() * 3)),
    chiefComplaint: symptomsList[Math.floor(Math.random() * symptomsList.length)],
    status: 'waiting',
  };
};

const initialBeds: Bed[] = [
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `ICU-${String(i + 1).padStart(2, '0')}`,
    type: 'ICU' as const,
    floor: 3,
    status: 'available' as const,
  })),
  ...Array.from({ length: 30 }, (_, i) => ({
    id: `W-${String(i + 1).padStart(2, '0')}`,
    type: 'Ward' as const,
    floor: 2,
    status: 'available' as const,
  })),
];

const initialDoctors: Doctor[] = [
  { id: 'DR-001', name: 'Dr. Anil Kapoor', specialty: 'Emergency Medicine', status: 'available', currentPatients: 2, maxPatients: 5 },
  { id: 'DR-002', name: 'Dr. Sunita Sharma', specialty: 'Critical Care', status: 'available', currentPatients: 3, maxPatients: 4 },
  { id: 'DR-003', name: 'Dr. Rajiv Menon', specialty: 'Cardiology', status: 'busy', currentPatients: 4, maxPatients: 4 },
  { id: 'DR-004', name: 'Dr. Priya Nair', specialty: 'Pulmonology', status: 'available', currentPatients: 1, maxPatients: 5 },
  { id: 'DR-005', name: 'Dr. Vikram Singh', specialty: 'General Medicine', status: 'available', currentPatients: 2, maxPatients: 6 },
];

export const useHospitalStore = create<HospitalState>((set, get) => ({
  patients: [],
  resources: {
    icuBeds: { total: 10, available: 8 },
    wardBeds: { total: 30, available: 25 },
    doctors: { total: 15, available: 12 },
    ventilators: { total: 8, available: 6 },
    oxygenSupply: { total: 100, available: 85 },
    ambulances: { total: 5, available: 4 },
  },
  beds: initialBeds,
  doctors: initialDoctors,
  voiceOrders: [],
  scheduleEvents: [],

  addPatient: (patient) => set((state) => ({
    patients: [...state.patients, patient],
  })),

  updatePatient: (id, updates) => set((state) => ({
    patients: state.patients.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    ),
  })),

  removePatient: (id) => set((state) => ({
    patients: state.patients.filter((p) => p.id !== id),
  })),

  updateResources: (updates) => set((state) => ({
    resources: { ...state.resources, ...updates },
  })),

  updateBed: (id, updates) => set((state) => ({
    beds: state.beds.map((b) =>
      b.id === id ? { ...b, ...updates } : b
    ),
  })),

  addVoiceOrder: (order) => set((state) => ({
    voiceOrders: [...state.voiceOrders, order],
  })),

  generateEmergencySurge: () => {
    const numPatients = Math.floor(Math.random() * 8) + 8;
    const newPatients = Array.from({ length: numPatients }, generateRandomPatient);
    
    set((state) => ({
      patients: [...state.patients, ...newPatients],
    }));
  },

  dischargePatient: (id) => {
    const state = get();
    const patient = state.patients.find(p => p.id === id);
    
    if (patient?.assignedBed) {
      set((state) => ({
        beds: state.beds.map(b =>
          b.id === patient.assignedBed
            ? { ...b, status: 'available', patientId: undefined, patientName: undefined }
            : b
        ),
        patients: state.patients.map(p =>
          p.id === id ? { ...p, status: 'discharged', assignedBed: undefined } : p
        ),
      }));
    } else {
      set((state) => ({
        patients: state.patients.map(p =>
          p.id === id ? { ...p, status: 'discharged' } : p
        ),
      }));
    }
  },
}));
