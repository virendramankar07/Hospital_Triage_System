import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, RefreshCw, Calendar, ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Legend } from 'recharts';
import { cn } from '@/lib/utils';

// Simulated prediction data
const generatePredictionData = (days: number) => {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    const basePatients = 45 + Math.sin(i / 3) * 15;
    const weatherImpact = i > 3 && i < 7 ? 12 : 0; // Heatwave
    const festivalImpact = i === 5 || i === 6 ? 8 : 0;
    
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      patients: Math.round(basePatients + weatherImpact + festivalImpact + Math.random() * 5),
      icuDemand: Math.round(8 + (weatherImpact + festivalImpact) * 0.3 + Math.random() * 2),
      wardDemand: Math.round(22 + (weatherImpact + festivalImpact) * 0.5 + Math.random() * 4),
      oxygenDemand: Math.round(75 + (weatherImpact + festivalImpact) * 2 + Math.random() * 10),
    };
  });
};

const externalFactors = [
  { id: 'weather', label: 'Heatwave Alert', impact: 'high', description: 'Temperature expected to exceed 42°C from Dec 25-28' },
  { id: 'festival', label: 'Festival Season', impact: 'medium', description: 'Christmas celebrations may increase accident rates' },
  { id: 'disease', label: 'Flu Season', impact: 'medium', description: 'Seasonal influenza cases rising in the region' },
  { id: 'accident', label: 'Traffic Pattern', impact: 'low', description: 'Normal traffic conditions expected' },
];

export default function PredictivePlanning() {
  const [forecastWindow, setForecastWindow] = useState<7 | 30>(7);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const predictionData = generatePredictionData(forecastWindow);
  const peakDay = predictionData.reduce((max, d) => d.patients > max.patients ? d : max, predictionData[0]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const overallPressure = predictionData.some(d => d.icuDemand > 9) ? 'High' : 'Moderate';
  const trend = predictionData[predictionData.length - 1].patients > predictionData[0].patients ? 'up' : 'down';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Predictive Planning</h1>
            <p className="text-muted-foreground">AI-powered resource demand forecasting</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Refresh Prediction
          </Button>
          <Tabs value={String(forecastWindow)} onValueChange={(v) => setForecastWindow(Number(v) as 7 | 30)}>
            <TabsList>
              <TabsTrigger value="7">7 Days</TabsTrigger>
              <TabsTrigger value="30">30 Days</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Prediction Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Prediction Summary</h3>
            <div className="flex items-center gap-3 mb-4">
              <Badge className={overallPressure === 'High' ? 'bg-serious' : 'bg-stable text-stable-foreground'}>
                {overallPressure} Pressure Expected
              </Badge>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                {trend === 'up' ? (
                  <><ArrowUpRight className="h-4 w-4 text-serious" /> Increasing trend</>
                ) : (
                  <><ArrowDownRight className="h-4 w-4 text-non-urgent" /> Decreasing trend</>
                )}
              </span>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              <strong className="text-foreground">High patient surge expected</strong> during Dec 25-28 due to heatwave 
              conditions and festival activities. ICU and oxygen demand likely to exceed capacity by 15%. 
              Peak expected on <strong className="text-foreground">{peakDay.date}</strong> with ~{peakDay.patients} patients.
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Confidence Score</div>
            <div className="text-2xl font-bold text-non-urgent">87%</div>
            <div className="text-xs text-muted-foreground">Based on historical patterns</div>
          </div>
        </div>
      </motion.div>

      {/* Resource Demand Cards */}
      <div className="grid grid-cols-4 gap-4">
        <ResourceDemandCard
          title="ICU Beds"
          current={8}
          capacity={10}
          predicted={Math.max(...predictionData.map(d => d.icuDemand))}
          trend="up"
        />
        <ResourceDemandCard
          title="Ward Beds"
          current={22}
          capacity={30}
          predicted={Math.max(...predictionData.map(d => d.wardDemand))}
          trend="stable"
        />
        <ResourceDemandCard
          title="Oxygen Supply"
          current={85}
          capacity={100}
          predicted={Math.max(...predictionData.map(d => d.oxygenDemand))}
          trend="up"
        />
        <ResourceDemandCard
          title="Ventilators"
          current={6}
          capacity={8}
          predicted={7}
          trend="stable"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Patient Forecast */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Patient Inflow Forecast</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={predictionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="patients" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Resource Demand */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Resource Demand Forecast</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={predictionData.slice(0, 7)}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="icuDemand" name="ICU" fill="hsl(var(--critical))" radius={[2, 2, 0, 0]} />
              <Bar dataKey="wardDemand" name="Ward" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Explanation Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          Why This Prediction?
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {externalFactors.map(factor => (
            <div
              key={factor.id}
              className={cn(
                "p-4 rounded-lg border",
                factor.impact === 'high' ? 'border-serious/50 bg-serious/5' :
                factor.impact === 'medium' ? 'border-stable/50 bg-stable/5' :
                'border-border bg-secondary/30'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                {factor.impact === 'high' ? (
                  <AlertTriangle className="h-4 w-4 text-serious" />
                ) : factor.impact === 'medium' ? (
                  <Info className="h-4 w-4 text-stable" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-non-urgent" />
                )}
                <span className="font-medium text-foreground">{factor.label}</span>
                <Badge variant="outline" className="text-xs">{factor.impact}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{factor.description}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-non-urgent" />
          Actionable Recommendations
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <RecommendationCard
            priority="high"
            title="Increase ICU Capacity"
            description="Prepare 2 additional ICU beds by converting recovery rooms before Dec 25"
          />
          <RecommendationCard
            priority="high"
            title="Oxygen Stock Alert"
            description="Order additional oxygen supply (20% buffer) within next 3 days"
          />
          <RecommendationCard
            priority="medium"
            title="Staff Scheduling"
            description="Adjust doctor shifts: add 2 extra doctors on rotation for Dec 25-28"
          />
          <RecommendationCard
            priority="medium"
            title="Ambulance Standby"
            description="Keep 2 additional ambulances on standby during peak hours (10 AM - 6 PM)"
          />
        </div>
      </motion.div>
    </div>
  );
}

function ResourceDemandCard({ title, current, capacity, predicted, trend }: {
  title: string;
  current: number;
  capacity: number;
  predicted: number;
  trend: 'up' | 'down' | 'stable';
}) {
  const gap = predicted - capacity;
  const status = gap > 0 ? 'shortage' : gap > -3 ? 'tight' : 'sufficient';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-xl border-2",
        status === 'shortage' ? 'border-critical bg-critical/5' :
        status === 'tight' ? 'border-serious bg-serious/5' :
        'border-border bg-card'
      )}
    >
      <h4 className="font-medium text-foreground mb-2">{title}</h4>
      <div className="flex items-end gap-2 mb-2">
        <span className="text-2xl font-bold text-foreground">{predicted}</span>
        <span className="text-sm text-muted-foreground">/ {capacity}</span>
        {trend === 'up' && <ArrowUpRight className="h-4 w-4 text-serious" />}
        {trend === 'down' && <ArrowDownRight className="h-4 w-4 text-non-urgent" />}
      </div>
      <div className="text-xs">
        {status === 'shortage' && (
          <span className="text-critical">⚠ Shortage of {gap} expected</span>
        )}
        {status === 'tight' && (
          <span className="text-serious">⚡ Tight capacity</span>
        )}
        {status === 'sufficient' && (
          <span className="text-non-urgent">✓ Sufficient capacity</span>
        )}
      </div>
    </motion.div>
  );
}

function RecommendationCard({ priority, title, description }: {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
}) {
  return (
    <div className={cn(
      "p-4 rounded-lg border-l-4",
      priority === 'high' ? 'border-l-critical bg-critical/5' :
      priority === 'medium' ? 'border-l-serious bg-serious/5' :
      'border-l-non-urgent bg-non-urgent/5'
    )}>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium text-foreground">{title}</span>
        <Badge variant="outline" className="text-xs uppercase">{priority}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
