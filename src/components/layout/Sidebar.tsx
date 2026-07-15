import { useState, createContext, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  LayoutDashboard,
  BedDouble,
  LogOut,
  BarChart3,
  TrendingUp,
  Stethoscope,
  Mic,
  Activity,
  Menu,
  X,
  Home,
  Siren,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { path: '/patient-intake', icon: Users, label: 'Patient Intake' },
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/bed-management', icon: BedDouble, label: 'Bed Management' },
  { path: '/discharge', icon: LogOut, label: 'Discharge' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/predictive-planning', icon: TrendingUp, label: 'Predictive Planning' },
  { path: '/doctor-monitoring', icon: Stethoscope, label: 'Doctor Monitoring' },
  { path: '/voice-orders', icon: Mic, label: 'Voice Orders' },
  { path: '/ais140-monitoring', icon: Siren, label: 'AIS-140 Emergency' },
];

// Context to share sidebar state
export const SidebarContext = createContext<{ isCollapsed: boolean }>({ isCollapsed: false });

export function useSidebarState() {
  return useContext(SidebarContext);
}

export function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed }}>
      {/* Mobile/Collapsed Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 h-10 w-10 bg-card border border-border shadow-md hover:bg-secondary"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r border-border"
          >
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-border mt-14">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                <Activity className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-foreground">MedTriage AI</h1>
                <p className="text-xs text-muted-foreground">Hospital System</p>
              </div>
            </div>

            {/* Home Link */}
            <div className="px-4 pt-4">
              <Link
                to="/"
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  location.pathname === '/'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="px-4 py-4">
              <p className="px-3 mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Navigation
              </p>
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;

                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Autonomous Triage System</p>
                <p className="text-xs font-medium text-foreground">v1.0.0</p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Expose state for layout */}
      <div data-sidebar-collapsed={isCollapsed} className="hidden" />
    </SidebarContext.Provider>
  );
}
