import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Bus, 
  Truck, 
  MapPin, 
  Clock, 
  Ambulance, 
  Building2, 
  Users, 
  CheckCircle,
  Radio,
  Siren,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAIS140Data, AccidentEvent, AIS140Vehicle } from '@/hooks/useAIS140Data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const vehicleIcons: Record<string, React.ElementType> = {
  school_bus: Bus,
  college_bus: Bus,
  government_vehicle: Truck,
};

const priorityColors = {
  highest: 'bg-critical text-critical-foreground animate-pulse',
  medium: 'bg-serious text-serious-foreground',
  standard: 'bg-stable text-stable-foreground',
};

const statusColors = {
  new: 'bg-critical',
  ambulance_dispatched: 'bg-serious',
  hospital_notified: 'bg-stable',
  resolved: 'bg-non-urgent',
};

function VehicleTypeLabel({ type }: { type: string }) {
  const labels: Record<string, string> = {
    school_bus: 'School Bus',
    college_bus: 'College Bus',
    government_vehicle: 'Government Vehicle',
  };
  return <span>{labels[type] || type}</span>;
}

function AccidentCard({ 
  accident, 
  onDispatch, 
  onResolve,
  isDispatching 
}: { 
  accident: AccidentEvent; 
  onDispatch: () => void;
  onResolve: () => void;
  isDispatching: boolean;
}) {
  const Icon = vehicleIcons[accident.vehicle?.vehicleType || 'school_bus'] || Bus;
  const timeSince = Math.round((Date.now() - accident.timestamp.getTime()) / 60000);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`p-4 rounded-xl border-2 ${accident.status === 'new' ? 'border-critical bg-critical/10' : 'border-border bg-card'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${priorityColors[accident.priority]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {accident.vehicle?.registrationNumber || 'Unknown'}
              </span>
              <Badge className={statusColors[accident.status]}>
                {accident.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              <VehicleTypeLabel type={accident.vehicle?.vehicleType || ''} />
            </p>
          </div>
        </div>
        <Badge className={priorityColors[accident.priority]}>
          {accident.priority} priority
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{accident.latitude.toFixed(4)}, {accident.longitude.toFixed(4)}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{timeSince} min ago</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{accident.passengersCount || 0} passengers</span>
        </div>
        <div className="flex items-center gap-2 text-critical">
          <AlertTriangle className="h-4 w-4" />
          <span>~{accident.injuriesEstimated || 0} injuries</span>
        </div>
      </div>

      <div className="flex gap-2">
        {accident.status === 'new' && (
          <Button 
            onClick={onDispatch} 
            className="flex-1 gap-2"
            disabled={isDispatching}
          >
            <Ambulance className="h-4 w-4" />
            {isDispatching ? 'Dispatching...' : 'Dispatch Ambulance'}
          </Button>
        )}
        {accident.status !== 'resolved' && (
          <Button 
            variant="outline" 
            onClick={onResolve}
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Resolve
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function HospitalReadinessPanel() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="h-5 w-5 text-primary" />
          Hospital Readiness
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">ICU Beds Ready</span>
            <Badge variant="outline" className="bg-non-urgent/20">5 Available</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Trauma Team</span>
            <Badge variant="outline" className="bg-non-urgent/20">On Standby</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">O₂ Supply</span>
            <Badge variant="outline" className="bg-non-urgent/20">85%</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Blood Bank</span>
            <Badge variant="outline" className="bg-non-urgent/20">All Types Available</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AIS140Monitoring() {
  const { vehicles, accidents, ambulances, loading, simulateAccident, dispatchAmbulance, resolveAccident } = useAIS140Data();
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  const activeAccidents = accidents.filter(a => a.status !== 'resolved');
  const resolvedAccidents = accidents.filter(a => a.status === 'resolved');
  const availableAmbulances = ambulances.filter(a => a.status === 'available');

  const handleSimulate = async () => {
    if (!selectedVehicle) {
      toast.error('Please select a vehicle');
      return;
    }
    setIsSimulating(true);
    const result = await simulateAccident(selectedVehicle);
    if (result?.error) {
      toast.error('Failed to simulate accident');
    } else {
      toast.warning('⚠️ EMERGENCY ALERT: Accident detected!', {
        description: 'AIS-140 signal received. Hospital notified.',
        duration: 5000,
      });
    }
    setIsSimulating(false);
  };

  const handleDispatch = async (accidentId: string) => {
    setDispatchingId(accidentId);
    const result = await dispatchAmbulance(accidentId);
    if ('error' in result && result.error) {
      toast.error(result.error.message);
    } else if ('ambulance' in result) {
      toast.success(`Ambulance ${result.ambulance.registrationNumber} dispatched!`, {
        description: `Distance: ${result.distance.toFixed(1)} km`,
      });
    }
    setDispatchingId(null);
  };

  const handleResolve = async (accidentId: string) => {
    await resolveAccident(accidentId);
    toast.success('Accident resolved and ambulance released');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-critical">
          <Siren className="h-6 w-6 text-critical-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">AIS-140 Emergency Monitoring</h1>
          <p className="text-muted-foreground">Vehicle accident detection & response system</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold text-critical">{activeAccidents.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-critical" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ambulances Available</p>
                <p className="text-2xl font-bold text-non-urgent">{availableAmbulances.length}</p>
              </div>
              <Ambulance className="h-8 w-8 text-non-urgent" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tracked Vehicles</p>
                <p className="text-2xl font-bold text-primary">{vehicles.length}</p>
              </div>
              <Radio className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved Today</p>
                <p className="text-2xl font-bold text-foreground">{resolvedAccidents.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-non-urgent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simulate Accident (For Testing) */}
      <Card className="border-dashed border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-serious" />
            Simulate AIS-140 Accident Alert (Testing)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select vehicle to simulate accident" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map(v => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.registrationNumber} - <VehicleTypeLabel type={v.vehicleType} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleSimulate} 
              variant="destructive"
              disabled={isSimulating || !selectedVehicle}
            >
              {isSimulating ? 'Simulating...' : 'Trigger Emergency'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Alerts */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Siren className="h-5 w-5 text-critical" />
            Live Accident Alerts ({activeAccidents.length})
          </h2>
          
          <AnimatePresence mode="popLayout">
            {activeAccidents.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card rounded-xl border border-border p-8 text-center"
              >
                <CheckCircle className="h-12 w-12 text-non-urgent mx-auto mb-4" />
                <p className="text-muted-foreground">No active emergency alerts</p>
                <p className="text-sm text-muted-foreground">All AIS-140 vehicles operating normally</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {activeAccidents.map(accident => (
                  <AccidentCard 
                    key={accident.id} 
                    accident={accident}
                    onDispatch={() => handleDispatch(accident.id)}
                    onResolve={() => handleResolve(accident.id)}
                    isDispatching={dispatchingId === accident.id}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          <HospitalReadinessPanel />
          
          {/* Ambulance Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Ambulance className="h-5 w-5 text-primary" />
                Ambulance Fleet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ambulances.map(amb => (
                  <div key={amb.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium text-sm">{amb.registrationNumber}</p>
                      <p className="text-xs text-muted-foreground">{amb.driverName}</p>
                    </div>
                    <Badge className={
                      amb.status === 'available' ? 'bg-non-urgent' :
                      amb.status === 'dispatched' ? 'bg-serious' :
                      'bg-stable'
                    }>
                      {amb.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}