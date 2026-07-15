import { useEffect, useState, useCallback } from 'react';
import type { Patient, Bed, Doctor } from '@/types/hospital';

export function useSupabaseData() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data from localStorage
  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedPatients = localStorage.getItem('hospital_patients');
      const savedBeds = localStorage.getItem('hospital_beds');
      const savedDoctors = localStorage.getItem('hospital_doctors');

      if (savedPatients) {
        setPatients(JSON.parse(savedPatients));
      } else {
        // Initialize with empty array
        setPatients([]);
      }

      if (savedBeds) {
        setBeds(JSON.parse(savedBeds));
      } else {
        // Initialize with default beds
        const defaultBeds: Bed[] = [];
        for (let i = 1; i <= 10; i++) {
          defaultBeds.push({
            id: `ICU-${i.toString().padStart(2, '0')}`,
            type: 'ICU' as const,
            floor: 3,
            status: 'available' as const,
          });
        }
        for (let i = 1; i <= 30; i++) {
          defaultBeds.push({
            id: `W-${i.toString().padStart(2, '0')}`,
            type: 'Ward' as const,
            floor: 2,
            status: 'available' as const,
          });
        }
        setBeds(defaultBeds);
        localStorage.setItem('hospital_beds', JSON.stringify(defaultBeds));
      }

      if (savedDoctors) {
        setDoctors(JSON.parse(savedDoctors));
      } else {
        // Initialize with default doctors
        const defaultDoctors: Doctor[] = [
          {
            id: 'DR-001',
            name: 'Dr. Anil Kapoor',
            specialty: 'Emergency Medicine',
            status: 'available' as const,
            currentPatients: 2,
            maxPatients: 5,
          },
          {
            id: 'DR-002',
            name: 'Dr. Sunita Sharma',
            specialty: 'Critical Care',
            status: 'available' as const,
            currentPatients: 3,
            maxPatients: 4,
          },
          {
            id: 'DR-003',
            name: 'Dr. Rajiv Menon',
            specialty: 'Cardiology',
            status: 'busy' as const,
            currentPatients: 4,
            maxPatients: 4,
          },
          {
            id: 'DR-004',
            name: 'Dr. Priya Nair',
            specialty: 'Pulmonology',
            status: 'available' as const,
            currentPatients: 1,
            maxPatients: 5,
          },
          {
            id: 'DR-005',
            name: 'Dr. Vikram Singh',
            specialty: 'General Medicine',
            status: 'available' as const,
            currentPatients: 2,
            maxPatients: 6,
          },
        ];
        setDoctors(defaultDoctors);
        localStorage.setItem('hospital_doctors', JSON.stringify(defaultDoctors));
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save to localStorage
  const saveToLocalStorage = useCallback((key: string, data: Patient[] | Bed[] | Doctor[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, []);

  useEffect(() => {

    
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  const addPatient = async (patient: Patient) => {
    try {
      const updatedPatients = [...patients, patient];
      setPatients(updatedPatients);
      saveToLocalStorage('hospital_patients', updatedPatients);
      return { error: null };
    } catch (error) {
      console.error('Error adding patient:', error);
      return { error };
    }
  };

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    try {
      const saved = localStorage.getItem('hospital_patients');
      const currentPatients: Patient[] = saved ? JSON.parse(saved) : patients;
      const updatedPatients = currentPatients.map(p =>
        p.id === id ? { ...p, ...updates } : p
      );
      setPatients(updatedPatients);
      saveToLocalStorage('hospital_patients', updatedPatients);
      return { error: null };
    } catch (error) {
      console.error('Error updating patient:', error);
      return { error };
    }
  };

  const updateBed = async (id: string, updates: Partial<Bed>) => {
    try {
      const updatedBeds = beds.map(b =>
        b.id === id ? { ...b, ...updates } : b
      );
      setBeds(updatedBeds);
      saveToLocalStorage('hospital_beds', updatedBeds);
      return { error: null };
    } catch (error) {
      console.error('Error updating bed:', error);
      return { error };
    }
  };

  const assignDoctor = async (patientId: string, doctorId: string) => {
    try {
      const updatedPatients = patients.map(p =>
        p.id === patientId ? { ...p, assignedDoctor: doctorId, status: 'triaged' as const } : p
      );
      setPatients(updatedPatients);
      saveToLocalStorage('hospital_patients', updatedPatients);

      const updatedDoctors = doctors.map(d =>
        d.id === doctorId
          ? {
              ...d,
              currentPatients: d.currentPatients + 1,
              status: d.currentPatients + 1 >= d.maxPatients ? 'busy' as const : 'available' as const,
            }
          : d
      );
      setDoctors(updatedDoctors);
      saveToLocalStorage('hospital_doctors', updatedDoctors);
    } catch (error) {
      console.error('Error assigning doctor:', error);
    }
  };

  const verifyDoctorLogin = async (doctorId: string, password: string): Promise<Doctor | null> => {
    try {
      // For demo purposes, accept any password for existing doctors
      const doctor = doctors.find(d =>
        d.id === doctorId || d.name.toLowerCase().includes(doctorId.toLowerCase())
      );
      return doctor || null;
    } catch (error) {
      console.error('Error verifying doctor login:', error);
      return null;
    }
  };

  return {
    patients,
    beds,
    doctors,
    loading,
    addPatient,
    updatePatient,
    updateBed,
    assignDoctor,
    verifyDoctorLogin,
    refetch: loadFromLocalStorage,
  };
}
