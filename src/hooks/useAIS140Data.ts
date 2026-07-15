import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/client';

export interface AIS140Vehicle {
  id: string;
  vehicleType: 'school_bus' | 'college_bus' | 'government_vehicle';
  registrationNumber: string;
  ownerName: string | null;
  driverName: string | null;
  driverPhone: string | null;
  currentLat: number | null;
  currentLng: number | null;
  status: string;
}

export interface AccidentEvent {
  id: string;
  vehicleId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  severity: 'high' | 'medium' | 'low';
  priority: 'highest' | 'medium' | 'standard';
  status: 'new' | 'ambulance_dispatched' | 'hospital_notified' | 'resolved';
  description: string | null;
  passengersCount: number | null;
  injuriesEstimated: number | null;
  vehicle?: AIS140Vehicle;
}

export interface Ambulance {
  id: string;
  registrationNumber: string;
  currentLat: number | null;
  currentLng: number | null;
  status: 'available' | 'dispatched' | 'on_scene' | 'returning';
  assignedAccidentId: string | null;
  driverName: string | null;
  driverPhone: string | null;
}

export interface EmergencyAlert {
  id: string;
  accidentId: string;
  alertType: 'ambulance_dispatch' | 'hospital_notification' | 'resource_prep';
  status: 'pending' | 'sent' | 'acknowledged' | 'completed';
  message: string | null;
  sentAt: Date | null;
  acknowledgedAt: Date | null;
}

interface DbVehicle {
  id: string;
  vehicle_type: string;
  registration_number: string;
  owner_name: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  current_lat: number | null;
  current_lng: number | null;
  status: string;
}

interface DbAccident {
  id: string;
  vehicle_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  severity: string;
  priority: string;
  status: string;
  description: string | null;
  passengers_count: number | null;
  injuries_estimated: number | null;
}

interface DbAmbulance {
  id: string;
  registration_number: string;
  current_lat: number | null;
  current_lng: number | null;
  status: string;
  assigned_accident_id: string | null;
  driver_name: string | null;
  driver_phone: string | null;
}

interface DbAlert {
  id: string;
  accident_id: string;
  alert_type: string;
  status: string;
  message: string | null;
  sent_at: string | null;
  acknowledged_at: string | null;
}

const mapVehicle = (v: DbVehicle): AIS140Vehicle => ({
  id: v.id,
  vehicleType: v.vehicle_type as 'school_bus' | 'college_bus' | 'government_vehicle',
  registrationNumber: v.registration_number,
  ownerName: v.owner_name,
  driverName: v.driver_name,
  driverPhone: v.driver_phone,
  currentLat: v.current_lat ? Number(v.current_lat) : null,
  currentLng: v.current_lng ? Number(v.current_lng) : null,
  status: v.status,
});

const mapAccident = (a: DbAccident, vehicles: AIS140Vehicle[]): AccidentEvent => ({
  id: a.id,
  vehicleId: a.vehicle_id,
  latitude: Number(a.latitude),
  longitude: Number(a.longitude),
  timestamp: new Date(a.timestamp),
  severity: a.severity as 'high' | 'medium' | 'low',
  priority: a.priority as 'highest' | 'medium' | 'standard',
  status: a.status as 'new' | 'ambulance_dispatched' | 'hospital_notified' | 'resolved',
  description: a.description,
  passengersCount: a.passengers_count,
  injuriesEstimated: a.injuries_estimated,
  vehicle: vehicles.find(v => v.id === a.vehicle_id),
});

const mapAmbulance = (a: DbAmbulance): Ambulance => ({
  id: a.id,
  registrationNumber: a.registration_number,
  currentLat: a.current_lat ? Number(a.current_lat) : null,
  currentLng: a.current_lng ? Number(a.current_lng) : null,
  status: a.status as 'available' | 'dispatched' | 'on_scene' | 'returning',
  assignedAccidentId: a.assigned_accident_id,
  driverName: a.driver_name,
  driverPhone: a.driver_phone,
});

const mapAlert = (a: DbAlert): EmergencyAlert => ({
  id: a.id,
  accidentId: a.accident_id,
  alertType: a.alert_type as 'ambulance_dispatch' | 'hospital_notification' | 'resource_prep',
  status: a.status as 'pending' | 'sent' | 'acknowledged' | 'completed',
  message: a.message,
  sentAt: a.sent_at ? new Date(a.sent_at) : null,
  acknowledgedAt: a.acknowledged_at ? new Date(a.acknowledged_at) : null,
});

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function useAIS140Data() {
  const [vehicles, setVehicles] = useState<AIS140Vehicle[]>([]);
  const [accidents, setAccidents] = useState<AccidentEvent[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const [vehiclesRes, accidentsRes, ambulancesRes, alertsRes] = await Promise.all([
      supabase.from('ais140_vehicles').select('*').order('id'),
      supabase.from('accident_events').select('*').order('timestamp', { ascending: false }),
      supabase.from('ambulances').select('*').order('id'),
      supabase.from('emergency_alerts').select('*').order('created_at', { ascending: false }),
    ]);

    const mappedVehicles = vehiclesRes.data ? (vehiclesRes.data as DbVehicle[]).map(mapVehicle) : [];
    setVehicles(mappedVehicles);
    
    if (accidentsRes.data) {
      setAccidents((accidentsRes.data as DbAccident[]).map(a => mapAccident(a, mappedVehicles)));
    }
    if (ambulancesRes.data) {
      setAmbulances((ambulancesRes.data as DbAmbulance[]).map(mapAmbulance));
    }
    if (alertsRes.data) {
      setAlerts((alertsRes.data as DbAlert[]).map(mapAlert));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();

    // Realtime subscriptions
    const accidentsChannel = supabase
      .channel('accidents-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'accident_events' }, () => {
        fetchData();
      })
      .subscribe();

    const ambulancesChannel = supabase
      .channel('ambulances-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ambulances' }, () => {
        fetchData();
      })
      .subscribe();

    const alertsChannel = supabase
      .channel('alerts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_alerts' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(accidentsChannel);
      supabase.removeChannel(ambulancesChannel);
      supabase.removeChannel(alertsChannel);
    };
  }, [fetchData]);

  // Simulate an accident for testing
  const simulateAccident = async (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle || !vehicle.currentLat || !vehicle.currentLng) return;

    // Determine priority based on vehicle type
    let priority: 'highest' | 'medium' | 'standard' = 'standard';
    if (vehicle.vehicleType === 'school_bus') priority = 'highest';
    else if (vehicle.vehicleType === 'college_bus') priority = 'medium';

    // Create accident event
    const { data: accident, error } = await supabase.from('accident_events').insert({
      vehicle_id: vehicleId,
      latitude: vehicle.currentLat,
      longitude: vehicle.currentLng,
      severity: 'high',
      priority,
      status: 'new',
      description: `Emergency alert from ${vehicle.vehicleType.replace('_', ' ')} - ${vehicle.registrationNumber}`,
      passengers_count: vehicle.vehicleType === 'school_bus' ? 40 : vehicle.vehicleType === 'college_bus' ? 50 : 5,
      injuries_estimated: Math.floor(Math.random() * 10) + 1,
    }).select().single();

    if (!error && accident) {
      // Create hospital notification alert
      await supabase.from('emergency_alerts').insert({
        accident_id: accident.id,
        alert_type: 'hospital_notification',
        status: 'sent',
        message: `EMERGENCY: ${vehicle.vehicleType.replace('_', ' ')} accident. Prepare for mass casualty event.`,
        sent_at: new Date().toISOString(),
      });
    }

    fetchData();
    return { error };
  };

  // Dispatch nearest ambulance
  const dispatchAmbulance = async (accidentId: string) => {
    const accident = accidents.find(a => a.id === accidentId);
    if (!accident) return { error: new Error('Accident not found') };

    // Find nearest available ambulance
    const availableAmbulances = ambulances.filter(a => a.status === 'available' && a.currentLat && a.currentLng);
    if (availableAmbulances.length === 0) {
      return { error: new Error('No ambulances available') };
    }

    let nearestAmbulance = availableAmbulances[0];
    let minDistance = Infinity;

    for (const amb of availableAmbulances) {
      if (amb.currentLat && amb.currentLng) {
        const distance = calculateDistance(
          accident.latitude, 
          accident.longitude, 
          amb.currentLat, 
          amb.currentLng
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestAmbulance = amb;
        }
      }
    }

    // Update ambulance status
    await supabase.from('ambulances').update({
      status: 'dispatched',
      assigned_accident_id: accidentId,
    }).eq('id', nearestAmbulance.id);

    // Update accident status
    await supabase.from('accident_events').update({
      status: 'ambulance_dispatched',
    }).eq('id', accidentId);

    // Create dispatch alert
    await supabase.from('emergency_alerts').insert({
      accident_id: accidentId,
      alert_type: 'ambulance_dispatch',
      status: 'sent',
      message: `Ambulance ${nearestAmbulance.registrationNumber} dispatched. ETA: ${Math.round(minDistance * 3)} minutes`,
      sent_at: new Date().toISOString(),
    });

    // Log response timing
    await supabase.from('response_timings').insert({
      accident_id: accidentId,
      ambulance_id: nearestAmbulance.id,
      alert_received_at: accident.timestamp.toISOString(),
      ambulance_dispatched_at: new Date().toISOString(),
    });

    fetchData();
    return { ambulance: nearestAmbulance, distance: minDistance };
  };

  // Mark accident as resolved
  const resolveAccident = async (accidentId: string) => {
    // Update accident status
    await supabase.from('accident_events').update({
      status: 'resolved',
    }).eq('id', accidentId);

    // Free up assigned ambulance
    const ambulance = ambulances.find(a => a.assignedAccidentId === accidentId);
    if (ambulance) {
      await supabase.from('ambulances').update({
        status: 'available',
        assigned_accident_id: null,
      }).eq('id', ambulance.id);
    }

    fetchData();
  };

  return {
    vehicles,
    accidents,
    ambulances,
    alerts,
    loading,
    simulateAccident,
    dispatchAmbulance,
    resolveAccident,
    refetch: fetchData,
  };
}