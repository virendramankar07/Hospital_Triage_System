import { useState, useEffect} from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, User, Lock, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { LivePatientDashboard } from '@/components/monitoring/LivePatientDashboard';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import type { Patient, Doctor } from '@/types/hospital';

interface LoginCredentials {
  doctorId: string;
  password: string;
}

export default function DoctorMonitoring() {
  const { doctors, patients, verifyDoctorLogin, refetch } = useSupabaseData();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [credentials, setCredentials] = useState<LoginCredentials>({
    doctorId: '',
    password: '',
  });

  // Get patients assigned to current doctor
  const doctorPatients = patients.filter(p => p.assignedDoctor === currentDoctor?.id);

useEffect(() => {
  if (!isLoggedIn) return;
  const interval = setInterval(() => {
    refetch();
  }, 3000);
  return () => clearInterval(interval);
}, [isLoggedIn, refetch]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    const doctor = await verifyDoctorLogin(credentials.doctorId, credentials.password);

    if (doctor) {
      setCurrentDoctor(doctor);
      setIsLoggedIn(true);
      toast.success(`Welcome, ${doctor.name}`, {
        description: `Logged in as ${doctor.specialty}`,
      });
    } else {
      toast.error('Invalid credentials', {
        description: 'Please check your Doctor ID and password',
      });
    }
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentDoctor(null);
    setSelectedPatient(null);
    setCredentials({ doctorId: '', password: '' });
    toast.info('Logged out successfully');
  };

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleBackToList = () => {
    setSelectedPatient(null);
  };

  // Show Live Patient Dashboard if patient is selected
  if (selectedPatient && currentDoctor) {
    return (
      <LivePatientDashboard
        patient={selectedPatient}
        doctor={currentDoctor}
        onBack={handleBackToList}
      />
    );
  }

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
            <Stethoscope className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Doctor Monitoring</h1>
            <p className="text-muted-foreground">Login to access patient monitoring</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="bg-card rounded-xl border border-border p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-foreground text-center mb-6">
              Doctor Login
            </h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doctorId">Doctor ID or Name</Label>
                <Input
                  id="doctorId"
                  value={credentials.doctorId}
                  onChange={(e) => setCredentials({ ...credentials, doctorId: e.target.value })}
                  placeholder="e.g., DR-001 or Anil"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                Demo credentials: Use any Doctor ID (e.g., DR-001) with password <strong>1234</strong>
              </p>
            </div>

            {/* Show available doctors for demo */}
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-xs font-medium text-foreground mb-2">Available Doctors:</p>
              <div className="space-y-1">
                {doctors.slice(0, 3).map(d => (
                  <p key={d.id} className="text-xs text-muted-foreground">
                    {d.id} - {d.name}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Doctor Dashboard (logged in)
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
            <Stethoscope className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Doctor Monitoring</h1>
            <p className="text-muted-foreground">
              Welcome, {currentDoctor?.name} • {currentDoctor?.specialty}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {/* Doctor Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">{currentDoctor?.name}</h3>
            <p className="text-muted-foreground">{currentDoctor?.specialty}</p>
            <div className="flex items-center gap-3 mt-2">
              <Badge className={cn(
                currentDoctor?.status === 'available' ? 'bg-non-urgent' :
                currentDoctor?.status === 'busy' ? 'bg-serious' : 'bg-muted'
              )}>
                {currentDoctor?.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {doctorPatients.length} patients assigned
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Patient List */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Your Assigned Patients</h3>
        {doctorPatients.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No patients assigned yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Patients will appear here once assigned to you from the Dashboard
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctorPatients.map((patient, index) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
                onClick={() => handlePatientClick(patient)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    patient.triageResult?.severity === 'critical' ? 'bg-critical/20' :
                    patient.triageResult?.severity === 'serious' ? 'bg-serious/20' :
                    patient.triageResult?.severity === 'stable' ? 'bg-stable/20' : 'bg-non-urgent/20'
                  )}>
                    <User className={cn(
                      "h-6 w-6",
                      patient.triageResult?.severity === 'critical' ? 'text-critical' :
                      patient.triageResult?.severity === 'serious' ? 'text-serious' :
                      patient.triageResult?.severity === 'stable' ? 'text-stable' : 'text-non-urgent'
                    )} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{patient.name}</h4>
                    <p className="text-sm text-muted-foreground">{patient.id} • {patient.age} yrs</p>
                  </div>
                  <Badge className={cn(
                    patient.triageResult?.severity === 'critical' ? 'bg-critical' :
                    patient.triageResult?.severity === 'serious' ? 'bg-serious' :
                    patient.triageResult?.severity === 'stable' ? 'bg-stable' : 'bg-non-urgent'
                  )}>
                    {patient.triageResult?.severity || 'pending'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {patient.chiefComplaint}
                </p>
                {patient.assignedBed && (
                  <p className="text-sm text-primary font-medium mb-2">
                    Bed: {patient.assignedBed}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>HR: {patient.vitals.heartRate} bpm</span>
                  <span>SpO2: {patient.vitals.oxygenSaturation}%</span>
                  <span>Temp: {patient.vitals.temperature.toFixed(1)}°C</span>
                </div>
                <p className="text-xs text-primary mt-3">Click to view live monitoring →</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
