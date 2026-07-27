import { useState } from 'react';
import type { ViewMode, Property, ClientTab } from './types';
import { properties } from './mockData';
import { ToastProvider } from './toast';
import { LanguageProvider } from './i18n';
import { AppShell } from './components/AppShell';
import { AdminPanel, SettingsSlideOver } from './components/AdminPanel';
import { ClientPanel } from './components/ClientPanel';
import { PmsModule } from './components/PmsModule';
import { ChmModule } from './components/ChmModule';
import { BookingEngine } from './components/BookingEngine';

function App() {
  const [view, setView] = useState<ViewMode>('admin');
  const [activeProperty, setActiveProperty] = useState<Property>(properties[0]);
  const [clientTab, setClientTab] = useState<ClientTab>('pms');
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const impersonate = (p: Property) => {
    setActiveProperty(p);
    setView('client');
    setClientTab('pms');
  };

  return (
    <ToastProvider>
     <LanguageProvider>
      <AppShell
        view={view}
        onViewChange={setView}
        notifOpen={notifOpen}
        setNotifOpen={setNotifOpen}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        onMenu={() => {}}
      >
        {view === 'admin' ? (
          <AdminPanel onImpersonate={impersonate} />
        ) : (
          <ClientPanel
            property={activeProperty}
            onPropertyChange={setActiveProperty}
            activeTab={clientTab}
            onTabChange={setClientTab}
          >
            {clientTab === 'pms' && <PmsModule />}
            {clientTab === 'chm' && <ChmModule />}
            {clientTab === 'be' && <BookingEngine />}
          </ClientPanel>
        )}
      </AppShell>

      <SettingsSlideOver open={settingsOpen} onClose={() => setSettingsOpen(false)} />
     </LanguageProvider>
    </ToastProvider>
  );
}

export default App;
