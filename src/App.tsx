import { useCallback, useEffect, useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { InventoryPage } from './pages/InventoryPage';

type View = 'dashboard' | 'inventory';

function viewFromHistory(): View {
  return window.history.state?.view === 'inventory' ? 'inventory' : 'dashboard';
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

  const openInventory = useCallback(() => {
    window.history.pushState({ view: 'inventory' }, '');
    setView('inventory');
  }, []);

  const goToDashboard = useCallback(() => {
    if (window.history.state?.view === 'inventory') {
      window.history.back(); // triggers popstate, which updates the view
    } else {
      setView('dashboard');
    }
  }, []);

  if (view === 'inventory') {
    return <InventoryPage onBack={goToDashboard} />;
  }
  return <Dashboard onOpenInventory={openInventory} />;
}
