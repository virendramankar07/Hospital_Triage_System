import { motion } from 'framer-motion';
import type { Patient } from '@/types/hospital';
import { Users, AlertCircle, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgentFlow } from '@/components/dashboard/AgentFlow';
import { PatientCard } from '@/components/dashboard/PatientCard';
import { processPatient } from '@/lib/triageEngine';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useHospitalStore } from '@/store/hospitalStore';

export default function Dashboard() {
  const { patients, doctors, beds, assignDoctor, addPatient, updatePatient: updatePatientDb, updateBed } = useSupabaseData();
  const { resources, generateEmergencySurge, updatePatient } = useHospitalStore();

  const activePatients = patients.filter(p => p.status !== 'discharged');
  const criticalPatients = activePatients.filter(p => p.triageResult?.severity === 'critical');
  const seriousPatients = activePatients.filter(p => p.triageResult?.severity === 'serious');
  const admittedPatients = activePatients.filter(p => p.assignedBed);

  const handleEmergencySurge = async () => {
    // Generate random patients and save to database
    const numPatients = Math.floor(Math.random() * 8) + 8;
    
    for (let i = 0; i < numPatients; i++) {
      const severity = Math.random();
      const isCritical = severity < 0.2;
      
      const names = [
        'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Singh', 'Vikram Reddy',
        'Anjali Gupta', 'Rajesh Verma', 'Pooja Mehta', 'Suresh Nair', 'Kavita Joshi',
      ];
      const symptomsList = ['Chest pain', 'Shortness of breath', 'Fever', 'Headache', 'Dizziness'];
      const comorbiditiesList = ['Diabetes', 'Hypertension', 'Heart disease', 'COPD'];

      const patient = {
        id: `PT-${Date.now().toString(36).toUpperCase()}-${i}`,
        name: names[Math.floor(Math.random() * names.length)],
        age: Math.floor(Math.random() * 70) + 18,
        gender: ['Male', 'Female', 'Other'][Math.floor(Math.random() * 3)] as 'Male' | 'Female' | 'Other',
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
        status: 'waiting' as const,
      };

      // Process with triage engine
      const processed = processPatient(patient, resources);
      await addPatient(processed);
    }
  };

  const handleAssignDoctor = async (patient: Patient, doctorId: string) => {
    await assignDoctor(patient.id, doctorId);
    
    if (patient?.allocationDecision) {
      const bedType = patient.allocationDecision === 'ICU' ? 'ICU' : 'Ward';
      const availableBed = beds.find(b => b.type === bedType && b.status === 'available');
      
      if (availableBed) {
        await updateBed(availableBed.id, {
          status: 'occupied',
          patientId: patient.id,
          patientName: patient.name,
        });
        await updatePatientDb(patient.id, {
          assignedBed: availableBed.id,
          status: 'admitted',
        });
      }
    }
  };

  const sortedPatients = [...activePatients].sort((a, b) => {
    const severityOrder = { critical: 0, serious: 1, stable: 2, 'non-urgent': 3 };
    const aSev = a.triageResult?.severity || 'non-urgent';
    const bSev = b.triageResult?.severity || 'non-urgent';
    return severityOrder[aSev] - severityOrder[bSev];
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Real-time patient queue and triage status</p>
          </div>
        </div>
        
        <Button
          onClick={handleEmergencySurge}
          className="bg-critical hover:bg-critical/90 text-critical-foreground gap-2"
        >
          <AlertTriangle className="h-4 w-4" />
          Emergency Surge Simulation
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          value={activePatients.length}
          label="Active Patients"
          color="text-primary"
        />
        <StatCard
          icon={AlertCircle}
          value={criticalPatients.length}
          label="Critical"
          color="text-critical"
        />
        <StatCard
          icon={AlertTriangle}
          value={seriousPatients.length}
          label="Serious"
          color="text-serious"
        />
        <StatCard
          icon={CheckCircle}
          value={admittedPatients.length}
          label="Admitted"
          color="text-non-urgent"
        />
      </div>

      {/* Agent Flow */}
      <AgentFlow />

      {/* Patient Queue */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Patient Queue ({activePatients.length})
        </h3>

        {sortedPatients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No patients in queue</p>
            <p className="text-sm text-muted-foreground">
              Add a patient from the intake page or trigger an emergency surge
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedPatients.map((patient, index) => (
              <PatientCard 
                key={patient.id} 
                patient={patient} 
                index={index}
                doctors={doctors}
                onAssignDoctor={(doctorId) => handleAssignDoctor(patient, doctorId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div className="text-3xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground uppercase tracking-wide">{label}</div>
    </motion.div>
  );
}