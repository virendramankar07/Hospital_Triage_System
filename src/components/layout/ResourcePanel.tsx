import { BedDouble, Users, Wind, Droplets, Minus, Plus } from 'lucide-react';
import { useHospitalStore } from '@/store/hospitalStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { HospitalResources } from '@/types/hospital';

interface ResourceItemProps {
  icon: React.ElementType;
  label: string;
  available: number;
  total: number;
  onDecrease: () => void;
  onIncrease: () => void;
}

function ResourceItem({ icon: Icon, label, available, total, onDecrease, onIncrease }: ResourceItemProps) {
  const percentage = (available / total) * 100;
  const status = percentage > 50 ? 'good' : percentage > 25 ? 'warning' : 'critical';
  
  const statusColors = {
    good: 'bg-non-urgent',
    warning: 'bg-stable',
    critical: 'bg-critical',
  };

  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium text-foreground flex-1">{label}</span>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDecrease}>
        <Minus className="h-3 w-3" />
      </Button>
      <span className="text-sm font-bold text-foreground w-12 text-center">
        {available}/{total}
      </span>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onIncrease}>
        <Plus className="h-3 w-3" />
      </Button>
      <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', statusColors[status])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function ResourcePanel() {
  const { resources, updateResources } = useHospitalStore();

  const pressure = calculatePressure(resources);
  const pressureColors = {
    Normal: 'bg-non-urgent text-non-urgent-foreground',
    Moderate: 'bg-stable text-stable-foreground',
    High: 'bg-serious text-serious-foreground',
    Critical: 'bg-critical text-critical-foreground',
  };

  return (
    <aside className="fixed right-0 top-0 h-screen w-80 bg-card border-l border-border overflow-y-auto">
  {/* Sticky Heading */}
  <div className="p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-base font-bold text-foreground tracking-wide">
        🏥 Hospital Resources
      </h2>
      <span className={cn('px-3 py-1 rounded-full text-xs font-medium', pressureColors[pressure])}>
        {pressure} Pressure
      </span>
    </div>

  
        {/* Resource Items */}
        <div className="space-y-4">
          <ResourceItem
            icon={BedDouble}
            label="ICU Beds"
            available={resources.icuBeds.available}
            total={resources.icuBeds.total}
            onDecrease={() => updateResources({
              icuBeds: { ...resources.icuBeds, available: Math.max(0, resources.icuBeds.available - 1) }
            })}
            onIncrease={() => updateResources({
              icuBeds: { ...resources.icuBeds, available: Math.min(resources.icuBeds.total, resources.icuBeds.available + 1) }
            })}
          />
          <ResourceItem
            icon={BedDouble}
            label="Ward Beds"
            available={resources.wardBeds.available}
            total={resources.wardBeds.total}
            onDecrease={() => updateResources({
              wardBeds: { ...resources.wardBeds, available: Math.max(0, resources.wardBeds.available - 1) }
            })}
            onIncrease={() => updateResources({
              wardBeds: { ...resources.wardBeds, available: Math.min(resources.wardBeds.total, resources.wardBeds.available + 1) }
            })}
          />
          <ResourceItem
            icon={Users}
            label="Doctors"
            available={resources.doctors.available}
            total={resources.doctors.total}
            onDecrease={() => updateResources({
              doctors: { ...resources.doctors, available: Math.max(0, resources.doctors.available - 1) }
            })}
            onIncrease={() => updateResources({
              doctors: { ...resources.doctors, available: Math.min(resources.doctors.total, resources.doctors.available + 1) }
            })}
          />
          <ResourceItem
            icon={Wind}
            label="Ventilators"
            available={resources.ventilators.available}
            total={resources.ventilators.total}
            onDecrease={() => updateResources({
              ventilators: { ...resources.ventilators, available: Math.max(0, resources.ventilators.available - 1) }
            })}
            onIncrease={() => updateResources({
              ventilators: { ...resources.ventilators, available: Math.min(resources.ventilators.total, resources.ventilators.available + 1) }
            })}
          />
          <ResourceItem
            icon={Droplets}
            label="O₂ Supply"
            available={resources.oxygenSupply.available}
            total={resources.oxygenSupply.total}
            onDecrease={() => updateResources({
              oxygenSupply: { ...resources.oxygenSupply, available: Math.max(0, resources.oxygenSupply.available - 5) }
            })}
            onIncrease={() => updateResources({
              oxygenSupply: { ...resources.oxygenSupply, available: Math.min(resources.oxygenSupply.total, resources.oxygenSupply.available + 5) }
            })}
          />
        </div>

        {/* Calendar Section */}
        <div className="mt-8">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="text-lg">📅</span> Today's Schedule
          </h3>
          <Calendar />
        </div>
      </div>
    </aside>
  );
}

function Calendar() {
  const today = new Date();
  const month = today.toLocaleString('default', { month: 'long', year: 'numeric' });
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  return (
    <div className="bg-secondary/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <button className="text-muted-foreground hover:text-foreground">‹</button>
        <span className="text-sm font-medium text-foreground">{month}</span>
        <button className="text-muted-foreground hover:text-foreground">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map(day => (
          <div key={day} className="text-xs font-medium text-muted-foreground py-1">
            {day}
          </div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="py-1" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = day === today.getDate();
          return (
            <div
              key={day}
              className={cn(
                'py-1 text-xs rounded-md cursor-pointer transition-colors',
                isToday
                  ? 'bg-primary text-primary-foreground font-bold'
                  : 'text-foreground hover:bg-secondary'
              )}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function calculatePressure(resources: HospitalResources): 'Normal' | 'Moderate' | 'High' | 'Critical' {
  const icuUsage = 1 - resources.icuBeds.available / resources.icuBeds.total;
  const wardUsage = 1 - resources.wardBeds.available / resources.wardBeds.total;
  const avgUsage = (icuUsage + wardUsage) / 2;

  if (avgUsage > 0.9) return 'Critical';
  if (avgUsage > 0.7) return 'High';
  if (avgUsage > 0.5) return 'Moderate';
  return 'Normal';
}
