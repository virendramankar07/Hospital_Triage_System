import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Heart, Thermometer, Wind, Droplets, Activity, 
  AlertTriangle, TrendingUp, TrendingDown, Minus 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Patient, Doctor } from '@/types/hospital';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface LivePatientDashboardProps {
  patient: Patient;
  doctor: Doctor;
  onBack: () => void;
}

interface VitalData {
  time: string;
  value: number;
}

export function LivePatientDashboard({ patient, doctor, onBack }: LivePatientDashboardProps) {
  const [liveVitals, setLiveVitals] = useState({
    heartRate: patient.vitals.heartRate,
    oxygenSaturation: patient.vitals.oxygenSaturation,
    temperature: patient.vitals.temperature,
    respiratoryRate: patient.vitals.respiratoryRate,
    bloodPressure: patient.vitals.bloodPressure,
  });

  const [heartRateHistory, setHeartRateHistory] = useState<VitalData[]>([]);
  const [oxygenHistory, setOxygenHistory] = useState<VitalData[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);

  // Simulate real-time vital updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveVitals(prev => {
        const newHR = prev.heartRate + (Math.random() - 0.5) * 5;
        const newSpO2 = Math.min(100, prev.oxygenSaturation + (Math.random() - 0.5) * 2);
        const newTemp = prev.temperature + (Math.random() - 0.5) * 0.1;
        const newRR = prev.respiratoryRate + (Math.random() - 0.5) * 2;

        // Check for critical values and set alerts
        const newAlerts: string[] = [];
        if (newHR > 120 || newHR < 50) newAlerts.push('Heart rate abnormal');
        if (newSpO2 < 90) newAlerts.push('Low oxygen saturation');
        if (newTemp > 39 || newTemp < 35) newAlerts.push('Temperature abnormal');
        setAlerts(newAlerts);

        return {
          heartRate: Math.round(newHR),
          oxygenSaturation: Math.round(newSpO2),
          temperature: Math.round(newTemp * 10) / 10,
          respiratoryRate: Math.round(newRR),
          bloodPressure: prev.bloodPressure,
        };
      });

      const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      setHeartRateHistory(prev => [...prev.slice(-20), { time: now, value: liveVitals.heartRate }]);
      setOxygenHistory(prev => [...prev.slice(-20), { time: now, value: liveVitals.oxygenSaturation }]);
    }, 2000);

    return () => clearInterval(interval);
  }, [liveVitals]);

  const getVitalStatus = (type: string, value: number) => {
    switch (type) {
      case 'heartRate':
        if (value > 120 || value < 50) return 'critical';
        if (value > 100 || value < 60) return 'warning';
        return 'normal';
      case 'oxygenSaturation':
        if (value < 90) return 'critical';
        if (value < 95) return 'warning';
        return 'normal';
      case 'temperature':
        if (value > 39 || value < 35) return 'critical';
        if (value > 37.5 || value < 36) return 'warning';
        return 'normal';
      case 'respiratoryRate':
        if (value > 25 || value < 10) return 'critical';
        if (value > 20 || value < 12) return 'warning';
        return 'normal';
      default:
        return 'normal';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-critical bg-critical/10 border-critical';
      case 'warning': return 'text-serious bg-serious/10 border-serious';
      default: return 'text-non-urgent bg-non-urgent/10 border-non-urgent';
    }
  };

  // Generate waveform data for pulse
  const generateWaveform = () => {
    return Array.from({ length: 50 }, (_, i) => ({
      x: i,
      y: Math.sin(i * 0.3 + Date.now() / 200) * 30 + 50 + Math.random() * 5,
    }));
  };

  const [waveform, setWaveform] = useState(generateWaveform());

  useEffect(() => {
    const waveInterval = setInterval(() => {
      setWaveform(generateWaveform());
    }, 50);
    return () => clearInterval(waveInterval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Live Patient Monitoring</h1>
            <p className="text-muted-foreground">
              {patient.name} • {patient.id} • Dr. {doctor.name}
            </p>
          </div>
        </div>
        <Badge className={cn(
          patient.triageResult?.severity === 'critical' ? 'bg-critical' :
          patient.triageResult?.severity === 'serious' ? 'bg-serious' :
          patient.triageResult?.severity === 'stable' ? 'bg-stable' : 'bg-non-urgent'
        )}>
          {patient.triageResult?.severity?.toUpperCase() || 'PENDING'}
        </Badge>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-critical/10 border border-critical rounded-xl"
        >
          <div className="flex items-center gap-2 text-critical">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
            <span className="font-semibold">Critical Alerts</span>
          </div>
          <ul className="mt-2 space-y-1">
            {alerts.map((alert, i) => (
              <li key={i} className="text-sm text-critical">{alert}</li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Pulse Waveform */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-critical" />
            ECG Waveform
          </h3>
          <span className="text-2xl font-bold text-critical">{liveVitals.heartRate} BPM</span>
        </div>
        <div className="h-24 bg-background rounded-lg p-2 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 200 80">
            <path
              d={`M ${waveform.map(p => `${p.x * 4},${p.y}`).join(' L ')}`}
              fill="none"
              stroke="hsl(var(--critical))"
              strokeWidth="2"
              className="animate-pulse"
            />
          </svg>
        </div>
      </motion.div>

      {/* Vital Signs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Heart Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-4 rounded-xl border-2 transition-colors",
            getStatusColor(getVitalStatus('heartRate', liveVitals.heartRate))
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-5 w-5" />
            <span className="text-sm font-medium">Heart Rate</span>
          </div>
          <p className="text-3xl font-bold">{liveVitals.heartRate}</p>
          <p className="text-xs opacity-70">bpm</p>
        </motion.div>

        {/* Oxygen Saturation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "p-4 rounded-xl border-2 transition-colors",
            getStatusColor(getVitalStatus('oxygenSaturation', liveVitals.oxygenSaturation))
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="h-5 w-5" />
            <span className="text-sm font-medium">SpO2</span>
          </div>
          <p className="text-3xl font-bold">{liveVitals.oxygenSaturation}</p>
          <p className="text-xs opacity-70">%</p>
        </motion.div>

        {/* Temperature */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "p-4 rounded-xl border-2 transition-colors",
            getStatusColor(getVitalStatus('temperature', liveVitals.temperature))
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="h-5 w-5" />
            <span className="text-sm font-medium">Temp</span>
          </div>
          <p className="text-3xl font-bold">{liveVitals.temperature.toFixed(1)}</p>
          <p className="text-xs opacity-70">°C</p>
        </motion.div>

        {/* Respiratory Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={cn(
            "p-4 rounded-xl border-2 transition-colors",
            getStatusColor(getVitalStatus('respiratoryRate', liveVitals.respiratoryRate))
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <Wind className="h-5 w-5" />
            <span className="text-sm font-medium">Resp Rate</span>
          </div>
          <p className="text-3xl font-bold">{liveVitals.respiratoryRate}</p>
          <p className="text-xs opacity-70">/min</p>
        </motion.div>
      </div>

      {/* Blood Pressure */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <h3 className="font-semibold text-foreground mb-4">Blood Pressure</h3>
        <div className="flex items-center gap-8">
          <div>
            <p className="text-4xl font-bold text-foreground">
              {liveVitals.bloodPressure.systolic}/{liveVitals.bloodPressure.diastolic}
            </p>
            <p className="text-sm text-muted-foreground">mmHg</p>
          </div>
          <div className="flex-1 h-4 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-non-urgent via-stable to-critical rounded-full"
              style={{ width: `${(liveVitals.bloodPressure.systolic / 200) * 100}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Trend Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-xl border border-border p-6"
        >
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Heart className="h-4 w-4 text-critical" />
            Heart Rate Trend
          </h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={heartRateHistory}>
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis domain={[40, 140]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--critical))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-xl border border-border p-6"
        >
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Droplets className="h-4 w-4 text-primary" />
            Oxygen Saturation Trend
          </h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={oxygenHistory}>
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis domain={[85, 100]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Patient Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <h3 className="font-semibold text-foreground mb-4">Patient Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Age</p>
            <p className="font-medium text-foreground">{patient.age} years</p>
          </div>
          <div>
            <p className="text-muted-foreground">Gender</p>
            <p className="font-medium text-foreground">{patient.gender}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Chief Complaint</p>
            <p className="font-medium text-foreground">{patient.chiefComplaint}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <p className="font-medium text-foreground capitalize">{patient.status}</p>
          </div>
        </div>
        {patient.symptoms.length > 0 && (
          <div className="mt-4">
            <p className="text-muted-foreground text-sm mb-2">Symptoms</p>
            <div className="flex flex-wrap gap-2">
              {patient.symptoms.map(symptom => (
                <Badge key={symptom} variant="outline">{symptom}</Badge>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
