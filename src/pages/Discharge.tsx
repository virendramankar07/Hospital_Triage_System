import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, Search, CheckCircle, Clock, BedDouble, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useSupabaseData } from '@/hooks/useSupabaseData';

export default function Discharge() {
  const { patients, beds, doctors, updatePatient, updateBed, refetch } = useSupabaseData();
  const [search, setSearch] = useState('');

  // Filter patients that have been assigned to a doctor (triaged or admitted status)
  const dischargeablePatients = patients.filter(p => 
    (p.status === 'triaged' || p.status === 'admitted') && p.assignedDoctor
  );

  const filteredPatients = dischargeablePatients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleDischarge = async (patient: typeof patients[0]) => {
    // Update patient status to discharged
    await updatePatient(patient.id, { status: 'discharged' });

    // Free up the bed if assigned
    if (patient.assignedBed) {
      const bed = beds.find(b => b.id === patient.assignedBed);
      if (bed) {
        await updateBed(bed.id, { 
          status: 'available', 
          patientId: undefined, 
          patientName: undefined 
        });
      }
    }

    toast.success('Patient discharged successfully', {
      description: `${patient.name} has been discharged. Bed ${patient.assignedBed || 'N/A'} is now available.`,
    });

    refetch();
  };

  const dischargedPatients = patients.filter(p => p.status === 'discharged');

  // Helper to get doctor name
  const getDoctorName = (doctorId: string | undefined) => {
    if (!doctorId) return 'Not Assigned';
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor?.name || 'Unknown';
  };

  // Helper to get time since arrival
  const getTimeSince = (arrivalTime: Date) => {
  const time = new Date(arrivalTime); // string ko Date mein convert karo
  const hours = Math.round((Date.now() - time.getTime()) / (1000 * 60 * 60));
  return `${hours}h`;
};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
          <LogOut className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patient Discharge</h1>
          <p className="text-muted-foreground">Process patient discharges and release beds</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search patients by name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Active Patients for Discharge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Patient Discharge
          <Badge variant="outline">{dischargeablePatients.length} admitted</Badge>
        </h3>

        {filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No patients ready for discharge</p>
            <p className="text-sm text-muted-foreground mt-1">
              Patients need to be assigned to a doctor first
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPatients.map((patient, index) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/30"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                    <span className="text-lg font-semibold text-primary">
                      {patient.name.charAt(0).toLowerCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{patient.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{patient.age}y, {patient.gender}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getTimeSince(patient.arrivalTime)}
                      </span>
                      {patient.assignedBed && (
                        <span className="flex items-center gap-1">
                          <BedDouble className="h-3 w-3" />
                          Bed: {patient.assignedBed}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {patient.assignedDoctor && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Stethoscope className="h-4 w-4" />
                      <span>Dr. {getDoctorName(patient.assignedDoctor).replace('Dr. ', '')}</span>
                    </div>
                  )}
                  {patient.triageResult && (
                    <Badge
                      className={
                        patient.triageResult.severity === 'critical' ? 'bg-critical' :
                        patient.triageResult.severity === 'serious' ? 'bg-serious' :
                        patient.triageResult.severity === 'stable' ? 'bg-stable text-stable-foreground' :
                        'bg-non-urgent'
                      }
                    >
                      {patient.assignedBed?.startsWith('ICU') ? 'ICU' : 'Ward'}
                    </Badge>
                  )}
                  <Button
                    onClick={() => handleDischarge(patient)}
                    variant="outline"
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Discharge
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Recently Discharged */}
      {dischargedPatients.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-non-urgent" />
            Recently Discharged ({dischargedPatients.length})
          </h3>

          <div className="space-y-3">
            {dischargedPatients.slice(0, 5).map((patient, index) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-lg bg-non-urgent/10"
              >
                <CheckCircle className="h-5 w-5 text-non-urgent" />
                <span className="font-medium text-foreground">{patient.name}</span>
                <Badge variant="outline">{patient.id}</Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
