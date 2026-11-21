import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { AdoptionPage } from './pages/AdoptionPage';
import { PetDashboardPage } from './pages/PetDashboardPage';
import { authService } from './services/authService';
import { petService } from './services/petService';
import { User, Cat } from './types/pet';
import { sounds } from './audio/soundSynth';

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'adoption' | 'dashboard'>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [cat, setCat] = useState<Cat | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initial user & cat check
  useEffect(() => {
    const initApp = async () => {
      const token = authService.getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const me = await authService.me();
        setUser(me.user);

        if (me.has_cat) {
          const catRes = await petService.getCat();
          if (catRes.cat) {
            setCat(catRes.cat);
            setCurrentView('dashboard');
          } else {
            setCurrentView('adoption');
          }
        } else {
          setCurrentView('adoption');
        }
      } catch {
        // Token might be invalid or expired
        localStorage.removeItem('mimo_token');
        setUser(null);
        setCat(null);
        setCurrentView('landing');
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setCat(null);
    setCurrentView('landing');
  };

  const handleAuthSuccess = async (authUser: User, hasCat: boolean) => {
    setUser(authUser);
    if (hasCat) {
      try {
        const res = await petService.getCat();
        if (res.cat) {
          setCat(res.cat);
          setCurrentView('dashboard');
          return;
        }
      } catch {}
    }
    setCurrentView('adoption');
  };

  const handleAdoptionSuccess = (adoptedCat: Cat) => {
    setCat(adoptedCat);
    setCurrentView('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F6F1]">
        <div className="w-9 h-9 rounded-lg bg-[#22201D] text-[#FCFBF8] flex items-center justify-center font-mono font-bold text-xs mb-3 border border-[#22201D] animate-pulse">
          M
        </div>
        <span className="font-mono text-[11px] font-semibold tracking-wider text-[#22201D] uppercase">
          MIMO
        </span>
        <span className="font-mono text-[10px] text-[#9E9284] mt-0.5 uppercase tracking-wider">
          INITIALIZING TELEMETRY...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1] text-[#22201D] font-sans">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onNavigateHome={() => {
          if (cat) setCurrentView('dashboard');
          else setCurrentView('landing');
        }}
        onNavigateAdopt={user ? () => setCurrentView('adoption') : undefined}
        hasCat={Boolean(cat)}
      />

      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartAdoption={() => {
              if (user && cat) setCurrentView('dashboard');
              else if (user) setCurrentView('adoption');
              else setCurrentView('auth');
            }}
            onOpenLogin={() => setCurrentView('auth')}
            isAuthenticated={Boolean(user)}
            hasCat={Boolean(cat)}
          />
        )}

        {currentView === 'auth' && (
          <AuthPage
            onSuccess={handleAuthSuccess}
            onBack={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'adoption' && (
          <AdoptionPage
            onAdoptionSuccess={handleAdoptionSuccess}
            onCancel={cat ? () => setCurrentView('dashboard') : undefined}
          />
        )}

        {currentView === 'dashboard' && cat && (
          <PetDashboardPage
            initialCat={cat}
            onUpdateCat={(updated) => setCat(updated)}
            onAdoptNew={() => setCurrentView('adoption')}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
