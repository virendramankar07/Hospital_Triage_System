-- Create doctors table
CREATE TABLE public.doctors (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  current_patients INTEGER NOT NULL DEFAULT 0,
  max_patients INTEGER NOT NULL DEFAULT 5,
  password TEXT NOT NULL DEFAULT '1234',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patients table
CREATE TABLE public.patients (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  arrival_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  heart_rate INTEGER NOT NULL,
  bp_systolic INTEGER NOT NULL,
  bp_diastolic INTEGER NOT NULL,
  temperature DECIMAL(4,1) NOT NULL,
  oxygen_saturation INTEGER NOT NULL,
  respiratory_rate INTEGER NOT NULL,
  symptoms TEXT[] DEFAULT '{}',
  comorbidities TEXT[] DEFAULT '{}',
  chief_complaint TEXT NOT NULL,
  severity TEXT,
  triage_score INTEGER,
  triage_reasoning TEXT[] DEFAULT '{}',
  risk_level TEXT,
  deterioration_probability INTEGER,
  risk_factors TEXT[] DEFAULT '{}',
  allocation_decision TEXT,
  assigned_bed TEXT,
  assigned_doctor_id TEXT REFERENCES public.doctors(id),
  status TEXT NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create beds table
CREATE TABLE public.beds (
  id TEXT NOT NULL PRIMARY KEY,
  type TEXT NOT NULL,
  floor INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  patient_id TEXT REFERENCES public.patients(id),
  patient_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial doctors
INSERT INTO public.doctors (id, name, specialty, status, current_patients, max_patients, password) VALUES
  ('DR-001', 'Dr. Anil Kapoor', 'Emergency Medicine', 'available', 2, 5, '1234'),
  ('DR-002', 'Dr. Sunita Sharma', 'Critical Care', 'available', 3, 4, '1234'),
  ('DR-003', 'Dr. Rajiv Menon', 'Cardiology', 'busy', 4, 4, '1234'),
  ('DR-004', 'Dr. Priya Nair', 'Pulmonology', 'available', 1, 5, '1234'),
  ('DR-005', 'Dr. Vikram Singh', 'General Medicine', 'available', 2, 6, '1234');

-- Insert ICU beds
INSERT INTO public.beds (id, type, floor, status) 
SELECT 
  'ICU-' || LPAD(generate_series::text, 2, '0'),
  'ICU',
  3,
  'available'
FROM generate_series(1, 10);

-- Insert Ward beds
INSERT INTO public.beds (id, type, floor, status) 
SELECT 
  'W-' || LPAD(generate_series::text, 2, '0'),
  'Ward',
  2,
  'available'
FROM generate_series(1, 30);

-- Enable RLS
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for demo (no authentication required)
CREATE POLICY "Allow public read doctors" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Allow public write doctors" ON public.doctors FOR ALL USING (true);

CREATE POLICY "Allow public read patients" ON public.patients FOR SELECT USING (true);
CREATE POLICY "Allow public write patients" ON public.patients FOR ALL USING (true);

CREATE POLICY "Allow public read beds" ON public.beds FOR SELECT USING (true);
CREATE POLICY "Allow public write beds" ON public.beds FOR ALL USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.beds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.doctors;