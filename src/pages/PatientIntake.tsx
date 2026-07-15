import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, Thermometer, Wind, Droplets, Activity, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useHospitalStore } from '@/store/hospitalStore';
import { processPatient } from '@/lib/triageEngine';
import { toast } from 'sonner';
import { AgentFlow } from '@/components/dashboard/AgentFlow';
import { useNavigate } from 'react-router-dom';
import { useSupabaseData } from '@/hooks/useSupabaseData';

const symptomOptions = [
  'Chest pain', 'Shortness of breath', 'Fever', 'Headache', 'Abdominal pain',
  'Dizziness', 'Nausea', 'Fatigue', 'Cough', 'Back pain', 'Joint pain',
  'Confusion', 'Weakness', 'Palpitations', 'Swelling', 'Vomiting', 'Seizures'
];

const comorbidityOptions = [
  'Diabetes', 'Hypertension', 'Heart disease', 'COPD', 'Asthma',
  'Kidney disease', 'Cancer', 'Obesity', 'Stroke history', 'Immunocompromised',
  'Liver disease', 'Thyroid disorder'
];

export default function PatientIntake() {
  const navigate = useNavigate();
  const { resources } = useHospitalStore();
  const { addPatient } = useSupabaseData();
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    heartRate: '',
    systolic: '',
    diastolic: '',
    temperature: '',
    oxygenSaturation: '',
    respiratoryRate: '',
    chiefComplaint: '',
  });
  
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedComorbidities, setSelectedComorbidities] = useState<string[]>([]);
  const [symptomSearch, setSymptomSearch] = useState('');
  const [comorbiditySearch, setComorbiditySearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newPatient = {
      id: `PT-${Date.now().toString(36).toUpperCase()}`,
      name: formData.name,
      age: parseInt(formData.age),
      gender: formData.gender,
      arrivalTime: new Date(),
      vitals: {
        heartRate: parseInt(formData.heartRate),
        bloodPressure: {
          systolic: parseInt(formData.systolic),
          diastolic: parseInt(formData.diastolic),
        },
        temperature: parseFloat(formData.temperature),
        oxygenSaturation: parseInt(formData.oxygenSaturation),
        respiratoryRate: parseInt(formData.respiratoryRate),
      },
      symptoms: selectedSymptoms,
      comorbidities: selectedComorbidities,
      chiefComplaint: formData.chiefComplaint,
      status: 'waiting' as const,
    };

    const processedPatient = processPatient(newPatient, resources);
    const { error } = await addPatient(processedPatient);

    if (error) {
      toast.error('Failed to register patient', {
        description: error.message,
      });
      setIsSubmitting(false);
      return;
    }

    toast.success('Patient registered and triaged successfully', {
      description: `${processedPatient.name} - ${processedPatient.triageResult?.severity.toUpperCase()} priority`,
    });

    // Reset form
    setFormData({
      name: '', age: '', gender: 'Male', heartRate: '', systolic: '', diastolic: '',
      temperature: '', oxygenSaturation: '', respiratoryRate: '', chiefComplaint: '',
    });
    setSelectedSymptoms([]);
    setSelectedComorbidities([]);
    setIsSubmitting(false);

    // Navigate to dashboard
    navigate('/dashboard');
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const toggleComorbidity = (comorbidity: string) => {
    setSelectedComorbidities(prev =>
      prev.includes(comorbidity) ? prev.filter(c => c !== comorbidity) : [...prev, comorbidity]
    );
  };

  const filteredSymptoms = symptomOptions.filter(s =>
    s.toLowerCase().includes(symptomSearch.toLowerCase())
  );

  const filteredComorbidities = comorbidityOptions.filter(c =>
    c.toLowerCase().includes(comorbiditySearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
          <Users className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patient Intake</h1>
          <p className="text-muted-foreground">Register new patients into the triage system</p>
        </div>
      </div>

      {/* Agent Flow */}
      <AgentFlow />

      {/* Registration Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          New Patient Registration
        </h3>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4">Basic Information</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Patient Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Years"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value: 'Male' | 'Female' | 'Other') => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Vital Signs */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Vital Signs
            </h4>
            <div className="grid grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="heartRate" className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-critical" /> HR (bpm)
                </Label>
                <Input
                  id="heartRate"
                  type="number"
                  value={formData.heartRate}
                  onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                  placeholder="60-100"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>BP (mmHg)</Label>
                <div className="flex gap-1">
                  <Input
                    type="number"
                    value={formData.systolic}
                    onChange={(e) => setFormData({ ...formData, systolic: e.target.value })}
                    placeholder="120"
                    required
                  />
                  <span className="self-center text-muted-foreground">/</span>
                  <Input
                    type="number"
                    value={formData.diastolic}
                    onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })}
                    placeholder="80"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature" className="flex items-center gap-1">
                  <Thermometer className="h-3 w-3 text-serious" /> Temp (°C)
                </Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  placeholder="36.5-37.5"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oxygenSaturation" className="flex items-center gap-1">
                  <Droplets className="h-3 w-3 text-primary" /> SpO2 (%)
                </Label>
                <Input
                  id="oxygenSaturation"
                  type="number"
                  value={formData.oxygenSaturation}
                  onChange={(e) => setFormData({ ...formData, oxygenSaturation: e.target.value })}
                  placeholder="95-100"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="respiratoryRate" className="flex items-center gap-1">
                  <Wind className="h-3 w-3 text-accent" /> RR (/min)
                </Label>
                <Input
                  id="respiratoryRate"
                  type="number"
                  value={formData.respiratoryRate}
                  onChange={(e) => setFormData({ ...formData, respiratoryRate: e.target.value })}
                  placeholder="12-20"
                  required
                />
              </div>
            </div>
          </div>

          {/* Chief Complaint */}
          <div className="space-y-2">
            <Label htmlFor="chiefComplaint">Chief Complaint</Label>
            <Input
              id="chiefComplaint"
              value={formData.chiefComplaint}
              onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
              placeholder="Primary reason for visit"
              required
            />
          </div>

          {/* Symptoms */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4">Symptoms (Select all that apply)</h4>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search symptoms..."
                value={symptomSearch}
                onChange={(e) => setSymptomSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredSymptoms.map(symptom => (
                <Badge
                  key={symptom}
                  variant={selectedSymptoms.includes(symptom) ? 'default' : 'outline'}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => toggleSymptom(symptom)}
                >
                  {symptom}
                </Badge>
              ))}
            </div>
          </div>

          {/* Comorbidities */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4">Comorbidities (Select all that apply)</h4>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search comorbidities..."
                value={comorbiditySearch}
                onChange={(e) => setComorbiditySearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredComorbidities.map(comorbidity => (
                <Badge
                  key={comorbidity}
                  variant={selectedComorbidities.includes(comorbidity) ? 'default' : 'outline'}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => toggleComorbidity(comorbidity)}
                >
                  {comorbidity}
                </Badge>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button type="submit" size="lg" className="gap-2" disabled={isSubmitting}>
              <Plus className="h-4 w-4" />
              {isSubmitting ? 'Registering...' : 'Register & Triage Patient'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
