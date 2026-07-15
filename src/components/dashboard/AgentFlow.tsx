import { motion } from 'framer-motion';
import { Users, ClipboardList, Stethoscope, AlertTriangle, BarChart3, Brain } from 'lucide-react';

const agents = [
  {
    id: 'patient',
    icon: Users,
    label: 'Patient',
    sublabel: 'Arrives',
    color: 'bg-secondary',
    iconColor: 'text-muted-foreground',
  },
  {
    id: 'intake',
    icon: ClipboardList,
    label: 'Intake',
    sublabel: 'Collect patient data',
    color: 'bg-primary',
    iconColor: 'text-primary-foreground',
  },
  {
    id: 'triage',
    icon: Stethoscope,
    label: 'Triage',
    sublabel: 'Classify severity',
    color: 'bg-agent-triage',
    iconColor: 'text-white',
  },
  {
    id: 'risk',
    icon: AlertTriangle,
    label: 'Risk',
    sublabel: 'Predict deterioration',
    color: 'bg-serious',
    iconColor: 'text-serious-foreground',
  },
  {
    id: 'resource',
    icon: BarChart3,
    label: 'Resource',
    sublabel: 'Check availability',
    color: 'bg-primary',
    iconColor: 'text-primary-foreground',
  },
  {
    id: 'coordinator',
    icon: Brain,
    label: 'Coordinator',
    sublabel: 'Final decision',
    color: 'bg-agent-coordinator',
    iconColor: 'text-white',
  },
];

function AnimatedArrow({ delay }: { delay: number }) {
  return (
    <div className="relative flex items-center justify-center w-8 mb-8">
      {/* Static arrow */}
      <span className="text-muted-foreground/30 text-xl">→</span>
      
      {/* Animated flowing dots */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <motion.div
          className="flex items-center gap-0.5"
          initial={{ x: -20, opacity: 0 }}
          animate={{ 
            x: ['-100%', '100%'],
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: delay * 0.2,
            ease: 'linear',
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <div className="w-1 h-1 rounded-full bg-primary/70" />
          <div className="w-0.5 h-0.5 rounded-full bg-primary/40" />
        </motion.div>
      </div>
    </div>
  );
}

export function AgentFlow() {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        Multi-Agent Decision Flow
      </h3>
      
      <div className="flex items-center justify-between gap-2">
        {agents.map((agent, index) => {
          const Icon = agent.icon;
          return (
            <div key={agent.id} className="flex items-center gap-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center"
              >
                <motion.div 
                  className={`w-14 h-14 rounded-xl ${agent.color} flex items-center justify-center shadow-md relative overflow-hidden`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {/* Pulse effect on active */}
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-white/20"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 0, 0.3]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3,
                    }}
                  />
                  <Icon className={`h-6 w-6 ${agent.iconColor} relative z-10`} />
                </motion.div>
                <span className="text-sm font-medium text-foreground mt-2">{agent.label}</span>
                <span className="text-xs text-muted-foreground">{agent.sublabel}</span>
              </motion.div>
              
              {index < agents.length - 1 && (
                <AnimatedArrow delay={index} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
