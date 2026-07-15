import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ResourcePanel } from './ResourcePanel';
import { Header } from './Header';

export function MainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Listen for sidebar collapse state changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-sidebar-collapsed') {
          const target = mutation.target as HTMLElement;
          setIsCollapsed(target.dataset.sidebarCollapsed === 'true');
        }
      });
    });

    const sidebarState = document.querySelector('[data-sidebar-collapsed]');
    if (sidebarState) {
      observer.observe(sidebarState, { attributes: true });
      setIsCollapsed(sidebarState.getAttribute('data-sidebar-collapsed') === 'true');
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      <main 
        className={`min-h-screen p-8 pt-24 transition-all duration-300 ${
          isCollapsed ? 'ml-0' : 'ml-0 md:ml-64'
        } mr-0 md:mr-80`}
      >
 
        <Outlet />
      </main>
      <ResourcePanel />
    </div>
  );
}
