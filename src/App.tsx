import { useCallback, useEffect, useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { InventoryPage } from './pages/InventoryPage';
import { SalesPage } from './pages/SalesPage';

type View = 'dashboard' | 'inventory' | 'sales';

function viewFromHistory(): View {
  const view = window.history.state?.view;
  return view === 'inventory' || view === 'sales' ? view : 'dashboard';
}

/**
 * Minimal navigation without a router library. Each screen is pushed onto the
 * browser history so the phone's Back button and the browser Back button return
 * to the dashboard instead of closing the app.
 */
export default function App() {
  const [view, setView] = useState<View>(viewFromHistory);

  useEffect(() => {
    const onPopState = () => setView(viewFromHistory());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const open = useCallback((next: 'inventory' | 'sales') => {
    window.history.pushState({ view: next }, '');
    setView(next);
  }, []);

  const goToDashboard = useCallback(() => {
    if (window.history.state?.view) {
      window.history.back(); // triggers popstate, which updates the view
    } else {
      setView('dashboard');
    }
  }, []);

  if (view === 'inventory') {
    return <InventoryPage onBack={goToDashboard} />;
  }
  if (view === 'sales') {
    return <SalesPage onBack={goToDashboard} />;
  }
  return (
    <Dashboard
      onOpenInventory={() => open('inventory')}
      onOpenSales={() => open('sales')}
    />
  );
}
