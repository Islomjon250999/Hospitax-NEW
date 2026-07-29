import { useState } from 'react';
import { ToastProvider } from './toast';
import { LanguageProvider } from './i18n';
import { AuthProvider, useAuth } from './lib/auth';
import { AppShell } from './components/AppShell';
import { LandingPage } from './components/LandingPage';
import { CeoPanel } from './components/CeoPanel';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { ClientPanel } from './components/ClientPanel';
import { PmsModule } from './components/PmsModule';
import { ChmModule } from './components/ChmModule';
import { BookingEngine } from './components/BookingEngine';
import { HousekeepingPanel } from './components/HousekeepingPanel';
import { SettingsSlideOver } from './components/AdminPanel';
import type { Property, ClientTab } from './types';
import { properties } from './mockData';

function AppContent() {
  const { user, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [clientTab, setClientTab] = useState<ClientTab>('pms');

  if (!user) {
    return <LandingPage />;
  }

  const activeProperty: Property = properties.find((p) => p.id === user.hotelId) ?? properties[0];

  return (
    <AppShell
      notifOpen={notifOpen}
      setNotifOpen={setNotifOpen}
      settingsOpen={settingsOpen}
      setSettingsOpen={setSettingsOpen}
      onMenu={() => {}}
      onLogout={logout}
    >
      {user.role === 'ceo' && <CeoPanel />}
      {user.role === 'super_admin' && <SuperAdminPanel />}
      {user.role === 'housekeeping' && <HousekeepingPanel />}
      {(user.role === 'manager' || user.role === 'receptionist') && (
        <ClientPanel
          property={activeProperty}
          activeTab={clientTab}
          onTabChange={setClientTab}
          hideTabs={user.role === 'receptionist' ? ['chm', 'be'] : undefined}
        >
          {clientTab === 'pms' && (
            <PmsModule restrictTo={user.role === 'receptionist' ? ['shaxmatka'] : undefined} />
          )}
          {clientTab === 'chm' && <ChmModule />}
          {clientTab === 'be' && <BookingEngine />}
        </ClientPanel>
      )}

      <SettingsSlideOver open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </AppShell>
  );
}

function App() {
  return (
    <ToastProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ToastProvider>
  );
}

export default App;
