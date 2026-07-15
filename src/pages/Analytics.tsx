import { motion } from 'framer-motion';
import { BarChart3, Users, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useHospitalStore } from '@/store/hospitalStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';

export default function Analytics() {
  const { patients, resources } = useHospitalStore();

  const triageDistribution = [
    { name: 'Critical', value: patients.filter(p => p.triageResult?.severity === 'critical').length, color: 'hsl(0, 84%, 60%)' },
    { name: 'Serious', value: patients.filter(p => p.triageResult?.severity === 'serious').length, color: 'hsl(25, 95%, 53%)' },
    { name: 'Stable', value: patients.filter(p => p.triageResult?.severity === 'stable').length, color: 'hsl(45, 93%, 47%)' },
    { name: 'Non-Urgent', value: patients.filter(p => p.triageResult?.severity === 'non-urgent').length, color: 'hsl(142, 71%, 45%)' },
  ];

  const allocationData = [
    { name: 'ICU', count: patients.filter(p => p.allocationDecision === 'ICU').length },
    { name: 'Ward', count: patients.filter(p => p.allocationDecision === 'Ward').length },
    { name: 'Wait', count: patients.filter(p => p.allocationDecision === 'Wait').length },
    { name: 'Refer', count: patients.filter(p => p.allocationDecision === 'Refer').length },
  ];

  const timeSeriesData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    patients: Math.floor(Math.random() * 10) + 2,
    critical: Math.floor(Math.random() * 3),
  }));

  const waitTimeData = [
    { category: 'Critical', avgWait: 5 },
    { category: 'Serious', avgWait: 15 },
    { category: 'Stable', avgWait: 35 },
    { category: 'Non-Urgent', avgWait: 60 },
  ];

  const stats = {
    totalPatients: patients.length,
    critical: patients.filter(p => p.triageResult?.severity === 'critical').length,
    discharged: patients.filter(p => p.status === 'discharged').length,
    avgWait: patients.length > 0 
      ? Math.floor(patients.reduce((acc, p) => acc + (Date.now() - new Date(p.arrivalTime).getTime()) / 60000, 0) / patients.length)
      : 0,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
          <BarChart3 className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Time-series data, wait times, and agent performance</p>
        </div>
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Detailed Analytics
        </h3>

        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeseries">Time Series</TabsTrigger>
            <TabsTrigger value="waittimes">Wait Times</TabsTrigger>
            <TabsTrigger value="agentstats">Agent Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <StatCard icon={Users} value={stats.totalPatients} label="TOTAL PATIENTS" />
              <StatCard icon={AlertCircle} value={stats.critical} label="CRITICAL" color="text-critical" />
              <StatCard icon={CheckCircle} value={stats.discharged} label="DISCHARGED" color="text-non-urgent" />
              <StatCard icon={Clock} value={`${stats.avgWait}m`} label="AVG WAIT" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-8">
              {/* Allocation Distribution */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-4 uppercase tracking-wide">Allocation Distribution</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={triageDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {triageDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Quick Stats */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-4 uppercase tracking-wide">Quick Stats</h4>
                <div className="space-y-4">
                  <QuickStatBar
                    label="ICU Utilization"
                    value={resources.icuBeds.total - resources.icuBeds.available}
                    max={resources.icuBeds.total}
                  />
                  <QuickStatBar
                    label="Ward Utilization"
                    value={resources.wardBeds.total - resources.wardBeds.available}
                    max={resources.wardBeds.total}
                  />
                  <QuickStatBar
                    label="High Risk"
                    value={patients.filter(p => p.riskAssessment?.riskLevel === 'high').length}
                    max={Math.max(patients.length, 1)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeseries">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="patients" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="critical" stroke="hsl(var(--critical))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="waittimes">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waitTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Bar dataKey="avgWait" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="agentstats">
            <div className="grid grid-cols-3 gap-6">
              <AgentStatCard
                title="Triage Agent"
                accuracy={94}
                processed={patients.length}
                avgTime="2.3s"
              />
              <AgentStatCard
                title="Risk Agent"
                accuracy={91}
                processed={patients.length}
                avgTime="1.8s"
              />
              <AgentStatCard
                title="Coordinator"
                accuracy={97}
                processed={patients.length}
                avgTime="0.5s"
              />
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color = 'text-foreground' }: {
  icon: React.ElementType;
  value: number | string;
  label: string;
  color?: string;
}) {
  return (
    <div className="bg-secondary/30 rounded-xl p-4 text-center">
      <Icon className={`h-5 w-5 mx-auto mb-2 ${color}`} />
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
    </div>
  );
}

function QuickStatBar({ label, value, max }: { label: string; value: number; max: number }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}/{max}</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function AgentStatCard({ title, accuracy, processed, avgTime }: {
  title: string;
  accuracy: number;
  processed: number;
  avgTime: string;
}) {
  return (
    <div className="bg-secondary/30 rounded-xl p-6">
      <h4 className="font-semibold text-foreground mb-4">{title}</h4>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Accuracy</span>
          <span className="font-medium text-non-urgent">{accuracy}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Processed</span>
          <span className="font-medium text-foreground">{processed}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Avg Time</span>
          <span className="font-medium text-foreground">{avgTime}</span>
        </div>
      </div>
    </div>
  );
}
