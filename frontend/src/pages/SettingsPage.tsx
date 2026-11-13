import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Check, Moon, Sun, Monitor, User, ShieldCheck, Database, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useServices } from '../app/ServiceProvider';
import { useTheme } from '../hooks/useTheme';

export function SettingsPage() {
  const { preferencesRepo, dataMode } = useServices();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Bring in the live global theme state
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    let active = true;
    preferencesRepo.get().then((p) => {
      if (active) {
        setDisplayName(p.displayName || '');
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [preferencesRepo]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await preferencesRepo.update({ displayName: displayName.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } finally {
      navigate('/login', { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-[#FDFBF7] rounded-3xl border border-[#3B1011]/10 flex flex-col items-center justify-center font-sans">
        <div className="w-8 h-8 border-2 border-[#7B2C2D] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-serif text-2xl text-[#3B1011] mb-1">Loading Configuration...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-2rem)] bg-[#FDFBF7] rounded-3xl overflow-hidden shadow-2xl border border-[#3B1011]/10 font-sans flex flex-col">

      {/* CSS For Custom Floating Animations & Typography */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(20px) rotate(-2deg) scale(1.05); }
        }
        .animate-float-slow { animation: float-slow 15s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 20s ease-in-out infinite; }
        
        .noise-overlay {
          position: absolute;
          inset: 0;
          opacity: 0.04;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
        
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* Floating 3D Textured Background Elements */}
      <div className="noise-overlay z-0"></div>

      <img
        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop"
        alt="3D Texture"
        className="absolute -top-32 -left-32 w-[600px] h-[600px] object-cover rounded-full opacity-[0.03] mix-blend-multiply animate-float-slow pointer-events-none blur-[3px]"
      />

      <div className="relative z-10 flex flex-col h-full p-8 lg:p-12 overflow-y-auto hide-scrollbar max-w-4xl">

        {/* HEADER SECTION */}
        <header className="mb-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7B2C2D] mb-3 flex items-center gap-2">
            <SettingsIcon size={12} /> CONFIGURATION
          </p>
          <h1 className="font-serif text-5xl lg:text-6xl font-bold text-[#3B1011] tracking-tight">
            Settings<span className="text-[#7B2C2D]">.</span>
          </h1>
          <p className="text-sm font-medium text-[#5C1A1B] mt-4 opacity-80 max-w-md">
            Manage your personal profile, aesthetic preferences, and system architecture.
          </p>
        </header>

        <div className="space-y-10">

          {/* PROFILE SECTION */}
          <form onSubmit={handleSubmit} className="bg-white/60 backdrop-blur-md rounded-3xl border border-[#3B1011]/10 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-[#EADDC5]/50 flex items-center justify-center border border-[#3B1011]/10">
                <User size={18} className="text-[#3B1011]" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#3B1011]">Personal Profile</h2>
            </div>

            <div className="space-y-6 max-w-lg">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 rounded-full bg-[#3B1011] text-[#FDFBF7] flex items-center justify-center text-3xl font-serif shadow-inner border-2 border-[#EADDC5]">
                  {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-[#5C1A1B] mb-1">Account Status</p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#7B2C2D]">
                    <ShieldCheck size={14} /> Active
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="settings-display-name" className="text-[10px] font-bold tracking-widest uppercase text-[#5C1A1B]">Display Name</label>
                <input
                  id="settings-display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-white border border-[#3B1011]/10 text-[#3B1011] focus:outline-none focus:border-[#7B2C2D] transition-colors rounded-xl shadow-sm text-sm"
                />
              </div>

              <div className="flex items-center gap-4 mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#3B1011] text-[#FDFBF7] px-6 py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-[#5C1A1B] transition-all shadow-md flex items-center gap-2 disabled:opacity-70 disabled:hover:bg-[#3B1011]"
                >
                  {saved ? <Check size={16} /> : <Save size={16} />}
                  {saving ? 'Updating...' : saved ? 'Saved!' : 'Update Profile'}
                </button>
                {saved && (
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7B2C2D] animate-[slideUp_0.3s_ease-out]">
                    Profile updated.
                  </span>
                )}
              </div>
            </div>
          </form>

          {/* APPEARANCE SECTION */}
          <section className="bg-white/60 backdrop-blur-md rounded-3xl border border-[#3B1011]/10 p-8 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-[#3B1011] mb-2">Aesthetic Theme</h2>
            <p className="text-xs text-[#5C1A1B]/80 mb-6 font-medium">Customise the visual presentation of your digital archive.</p>

            <div className="flex flex-wrap gap-4">
              {[
                { mode: 'light' as const, icon: Sun, label: 'Light' },
                { mode: 'dark' as const, icon: Moon, label: 'Dark' },
                { mode: 'system' as const, icon: Monitor, label: 'System' },
              ].map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTheme(mode)}
                  className={`flex items-center gap-2 px-6 py-4 rounded-xl border transition-all duration-300 ${theme === mode
                    ? 'bg-[#3B1011] border-[#3B1011] text-[#FDFBF7] shadow-md transform scale-[1.02]'
                    : 'bg-white border-[#3B1011]/10 text-[#3B1011]/60 hover:border-[#7B2C2D]/40 hover:text-[#3B1011]'
                    }`}
                >
                  <Icon size={16} />
                  <span className="text-xs font-bold tracking-widest uppercase">{label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* DATA SOURCE SECTION */}
          <section className="bg-white/60 backdrop-blur-md rounded-3xl border border-[#3B1011]/10 p-8 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-[#3B1011] mb-6">Data Architecture</h2>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#EADDC5]/20 border border-[#3B1011]/5 rounded-xl gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#3B1011]/10 shrink-0">
                  <Database size={18} className="text-[#3B1011]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#3B1011]">
                    {dataMode === 'mock' ? 'Local Demo Mode' : 'Neural API Connection'}
                  </p>
                  <p className="text-xs text-[#5C1A1B]/70 mt-1 max-w-sm leading-relaxed font-medium">
                    {dataMode === 'mock'
                      ? 'Using local demo data. Set VITE_DATA_MODE=http to connect to the backend.'
                      : 'Connected to the SmartWardrobe Fast-API Engine.'}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm shadow-sm border shrink-0 ${dataMode === 'mock'
                ? 'bg-orange-100 text-orange-800 border-orange-200'
                : 'bg-[#7B2C2D] text-[#FDFBF7] border-[#5C1A1B]'
                }`}>
                {dataMode === 'mock' ? 'Demo Mode' : 'API Connected'}
              </span>
            </div>
          </section>

          {/* ACCOUNT SECTION */}
          <section className="bg-white/60 backdrop-blur-md rounded-3xl border border-[#3B1011]/10 p-8 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-[#3B1011] mb-2">Account Control</h2>
            <p className="text-xs text-[#5C1A1B]/80 mb-6 font-medium">Sign out of this account on this browser.</p>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-4 rounded-xl border border-[#7B2C2D]/30 text-[#7B2C2D] bg-white hover:bg-[#7B2C2D]/10 hover:border-[#7B2C2D] transition-colors shadow-sm"
            >
              <LogOut size={16} />
              <span className="text-xs font-bold tracking-widest uppercase">Sign Out</span>
            </button>
          </section>

          <div className="text-center pt-4 pb-2 opacity-50">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3B1011]">SmartWardrobe Neural Architecture</p>
            <p className="text-[10px] text-[#5C1A1B] mt-1 font-serif italic">Version 15.0 - Editorial Edition</p>
          </div>

        </div>
      </div>
    </div>
  );
}