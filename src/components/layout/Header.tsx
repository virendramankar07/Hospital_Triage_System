import { Activity } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-card border-b border-border">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Hospital Triage & Resource Allocation</h1>
            <p className="text-xs text-muted-foreground">Autonomous Multi-Agent Decision System</p>
          </div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
          <Activity className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="h-1 w-full bg-gradient-to-r from-primary via-serious to-critical opacity-60" />
    </header>
  );
}
