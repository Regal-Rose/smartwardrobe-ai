import { useState, useEffect } from 'react';
import {
  Calendar,
  Bell,
  CloudSun,
  MapPin,
  RefreshCw,
  MessageCircle,
  Palette,
  User,
  Star,
  Eye,
  Shirt,
  ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { checkSession } from '../auth/AuthPages';

export function DashboardOverview() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userName, setUserName] = useState('User');
  const [stats, setStats] = useState({ totalGarments: 0, savedOutfits: 0, wearEvents: 0 });

  // State for live weather data
  const [weather, setWeather] = useState({
    temp: '--',
    condition: 'loading...',
    location: 'Locating...'
  });

  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  // Helper function to format today's date
  const getTodayFormatted = () => {
    return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  useEffect(() => {
    let active = true;

    // 1. Fetch User Name
    checkSession().then(user => {
      if (active && user) {
        const displayName = user.name || (user.email ? user.email.split('@')[0] : 'User');
        setUserName(displayName.charAt(0).toUpperCase() + displayName.slice(1));
      }
    });

    // 2. Fetch Real Analytics from FastAPI
    fetch(`${BASE_URL}/api/v1/analytics/wardrobe`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (active && !data.error) {
          setStats({
            totalGarments: data.totalGarments || 0,
            savedOutfits: data.savedOutfits || 0,
            wearEvents: data.wearEvents || 0
          });
        }
      })
      .catch(err => console.error("Could not load analytics", err));

    return () => { active = false; };
  }, []);

  // 3. Fetch Live Weather based on highly accurate User Geolocation (Preserved Logic)
  const fetchWeather = () => {
    const getWeatherData = async (lat: number, lon: number) => {
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
        const geoData = await geoRes.json();

        const address = geoData.address || {};
        const locName = address.village || address.suburb || address.town || address.city || address.county || "Current Location";

        const weatherRes = await fetch(`${BASE_URL}/api/v1/weather?lat=${lat}&lon=${lon}`, {
          credentials: "include"
        });

        if (!weatherRes.ok) throw new Error("Backend unauthorized");

        const weatherData = await weatherRes.json();

        setWeather({
          temp: `${Math.round(weatherData.temperature)}°`,
          condition: weatherData.condition.charAt(0).toUpperCase() + weatherData.condition.slice(1),
          location: locName
        });
        setIsRefreshing(false);
      } catch (err) {
        console.error("Error fetching weather:", err);
        setWeather(prev => ({ ...prev, condition: "Weather unavailable" }));
        setIsRefreshing(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          getWeatherData(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Geolocation denied or failed, using fallback location.", error);
          getWeatherData(26.61, 80.68); // Parsandan Fallback
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setWeather({ temp: '--', condition: 'Geolocation not supported', location: 'Unknown' });
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchWeather();
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] bg-[#FDFBF7] rounded-3xl overflow-hidden shadow-2xl border border-[#3B1011]/10 font-sans">

      {/* CSS For Custom Floating Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(30px) rotate(-5deg) scale(1.05); }
        }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 12s ease-in-out infinite; }
        
        .noise-overlay {
          position: absolute;
          inset: 0;
          opacity: 0.04;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
      `}} />

      {/* Floating 3D Textured Background Elements */}
      <div className="noise-overlay z-0"></div>

      {/* 3D Texture Image 1 (Top Right) */}
      <img
        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop"
        alt="3D Texture"
        className="absolute -top-10 -right-20 w-96 h-96 object-cover rounded-full opacity-15 mix-blend-multiply animate-float-slow pointer-events-none shadow-2xl blur-[2px]"
      />

      {/* 3D Texture Image 2 (Bottom Left) */}
      <img
        src="https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=600&auto=format&fit=crop"
        alt="3D Texture"
        className="absolute -bottom-20 -left-20 w-[28rem] h-[28rem] object-cover rounded-full opacity-10 mix-blend-multiply animate-float-slower pointer-events-none shadow-2xl blur-[1px]"
      />

      {/* Glowing Accents */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#7B2C2D]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#EADDC5]/50 rounded-full blur-3xl pointer-events-none"></div>

      {/* FOREGROUND CONTENT */}
      <div className="relative z-10 p-8 lg:p-12 space-y-10">

        {/* 1. Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#3B1011]/10 pb-6 gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7B2C2D] mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#7B2C2D] animate-pulse"></span> OVERVIEW
            </p>
            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-[#3B1011] tracking-tight">
              Hello, {userName}
            </h1>
          </div>
          <div className="flex items-center gap-4 text-[#3B1011]">
            <Link to="/planner" className="bg-white border border-[#3B1011]/10 hover:border-[#7B2C2D] hover:text-[#7B2C2D] p-3 rounded-full transition-all shadow-sm" title="Outfit Planner">
              <Calendar size={20} />
            </Link>
            <button className="bg-white border border-[#3B1011]/10 hover:border-[#7B2C2D] hover:text-[#7B2C2D] p-3 rounded-full transition-all shadow-sm" title="Notifications">
              <Bell size={20} />
            </button>
            <Link to="/settings" className="h-12 w-12 bg-[#3B1011] text-[#FDFBF7] rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-md ml-2 hover:scale-105 transition-transform" title="Settings">
              <User size={22} />
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: AI Stylist & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-serif text-2xl font-semibold text-[#3B1011]">AI Stylist</h2>
                <Link to="/discover" className="text-xs font-bold tracking-wider uppercase text-[#7B2C2D] hover:text-[#3B1011] flex items-center gap-1 transition-colors">
                  View all <ChevronRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Outfit Suggestion */}
                <Link to="/weather" className="bg-white hover:bg-[#F4EBD9] transition-all p-5 rounded-2xl flex flex-col items-start justify-between h-36 relative overflow-hidden group border border-[#3B1011]/10 shadow-sm hover:border-[#7B2C2D]/50 hover:shadow-md">
                  <span className="font-bold tracking-wide text-sm text-[#3B1011] z-10 uppercase">Outfit<br />suggestion</span>
                  <Shirt className="absolute right-4 bottom-4 text-[#7B2C2D] w-14 h-14 group-hover:scale-110 group-hover:-rotate-6 transition-transform opacity-30 group-hover:opacity-100" />
                </Link>

                {/* Style Chat */}
                <button onClick={() => navigate('/lookbook')} className="bg-[#3B1011] hover:bg-[#5C1A1B] transition-all p-5 rounded-2xl flex flex-col items-start justify-between h-36 relative overflow-hidden group shadow-md hover:shadow-lg text-left">
                  <span className="font-bold tracking-wide text-sm text-[#FDFBF7] z-10 uppercase">Style<br />chat</span>
                  <MessageCircle className="absolute right-4 bottom-4 text-[#EADDC5] w-12 h-12 group-hover:scale-110 group-hover:rotate-6 transition-transform opacity-40 group-hover:opacity-100" />
                </button>
              </div>

              {/* Mini Tools Grid */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: Palette, label: 'COLOR', route: '/preferences' },
                  { icon: User, label: 'FIT', route: '/preferences' },
                  { icon: Star, label: 'RATE', route: '/lookbook' },
                  { icon: Eye, label: 'TRY ON', route: '/builder' },
                ].map((tool, idx) => (
                  <Link key={idx} to={tool.route} className="bg-white hover:bg-[#F4EBD9] transition-all py-4 rounded-xl flex flex-col items-center justify-center gap-2 border border-[#3B1011]/10 shadow-sm group hover:border-[#7B2C2D]/30">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center mb-1 bg-[#FDFBF7] group-hover:bg-white transition-colors border border-[#3B1011]/5">
                      <tool.icon size={20} className="text-[#3B1011] group-hover:text-[#7B2C2D] transition-colors" strokeWidth={1.5} />
                    </div>
                    <span className="text-[9px] font-bold tracking-widest text-[#3B1011]/60 group-hover:text-[#3B1011] transition-colors">{tool.label}</span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Wardrobe Summary - Dark High Contrast Box */}
            <section className="bg-gradient-to-br from-[#3B1011] to-[#2A0B0C] p-7 rounded-2xl border border-[#5C1A1B] shadow-xl relative overflow-hidden">
              {/* Subtle background icon */}
              <Shirt className="absolute -right-4 -bottom-4 w-32 h-32 text-[#5C1A1B] opacity-50 pointer-events-none" />

              <h3 className="text-[10px] font-bold tracking-widest uppercase text-[#EADDC5] mb-5">Wardrobe Summary</h3>
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center text-sm border-b border-[#5C1A1B] pb-3">
                  <span className="text-[#FDFBF7]/80 font-medium">Total Items</span>
                  <span className="font-serif font-bold text-xl text-[#FDFBF7]">{stats.totalGarments}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-[#5C1A1B] pb-3">
                  <span className="text-[#FDFBF7]/80 font-medium">Saved Outfits</span>
                  <span className="font-serif font-bold text-xl text-[#FDFBF7]">{stats.savedOutfits}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#FDFBF7]/80 font-medium">Times Worn</span>
                  <span className="font-serif font-bold text-xl text-[#EADDC5]">{stats.wearEvents}</span>
                </div>
              </div>
              <Link to="/wardrobe" className="block w-full mt-6 py-3 bg-[#FDFBF7] border border-transparent rounded-sm text-xs font-bold tracking-[0.2em] uppercase text-[#3B1011] hover:bg-[#EADDC5] transition-colors text-center shadow-md">
                Manage Wardrobe
              </Link>
            </section>
          </div>

          {/* Right Column: Daily Weather & Outfit Canvas */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-[#3B1011]/10 shadow-lg h-full flex flex-col relative overflow-hidden">

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10">
                <div>
                  <h2 className="font-serif text-2xl lg:text-3xl font-bold text-[#3B1011]">
                    Casual Daily Look for {weather.condition}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold tracking-widest uppercase text-[#3B1011]/60 mt-3">
                    <span className="flex items-center gap-1.5 bg-[#F4EBD9] text-[#3B1011] px-3 py-1.5 rounded-full border border-[#3B1011]/10 shadow-sm"><Calendar size={14} /> {getTodayFormatted()}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#7B2C2D]" /> {weather.location}</span>
                    <span className="flex items-center gap-1.5"><CloudSun size={14} className="text-[#7B2C2D]" /> {weather.temp}</span>
                  </div>
                </div>
                <button
                  onClick={handleRefresh}
                  className={`p-3 bg-white rounded-full text-[#3B1011] hover:text-[#7B2C2D] hover:bg-[#F4EBD9] border border-[#3B1011]/10 shadow-sm transition-all ${isRefreshing ? 'animate-spin border-[#7B2C2D] text-[#7B2C2D]' : ''}`}
                  aria-label="Refresh suggestions"
                >
                  <RefreshCw size={18} />
                </button>
              </div>

              {/* Lookbook Canvas Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 relative z-10">

                {/* Look 1 */}
                <div className="h-[400px] bg-[#FDFBF7] border border-[#3B1011]/10 rounded-2xl p-6 relative group hover:border-[#7B2C2D]/40 hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden">
                  <div className="absolute inset-0 bg-[#EADDC5]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase text-[#3B1011] shadow-sm border border-[#3B1011]/10 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    Look 01
                  </div>

                  {/* Outfit Layout Pieces */}
                  <div className="absolute top-8 left-8 w-32 h-32 bg-white rounded-xl flex items-center justify-center text-xs font-bold tracking-widest uppercase text-[#3B1011]/40 shadow-sm border border-[#3B1011]/5 group-hover:border-[#7B2C2D]/20 transition-colors">Top</div>
                  <div className="absolute top-12 right-8 w-36 h-40 bg-white rounded-xl flex items-center justify-center text-xs font-bold tracking-widest uppercase text-[#3B1011]/40 shadow-sm border border-[#3B1011]/5 group-hover:border-[#7B2C2D]/20 transition-colors z-10">Jacket</div>
                  <div className="absolute bottom-8 left-12 w-32 h-48 bg-white rounded-xl flex items-center justify-center text-xs font-bold tracking-widest uppercase text-[#3B1011]/40 shadow-sm border border-[#3B1011]/5 group-hover:border-[#7B2C2D]/20 transition-colors">Pants</div>
                  <div className="absolute bottom-12 right-12 w-28 h-20 bg-white rounded-xl flex items-center justify-center text-xs font-bold tracking-widest uppercase text-[#3B1011]/40 shadow-sm border border-[#3B1011]/5 group-hover:border-[#7B2C2D]/20 transition-colors">Shoes</div>
                </div>

                {/* Look 2 */}
                <div className="h-[400px] bg-[#FDFBF7] border border-[#3B1011]/10 rounded-2xl p-6 relative group hover:border-[#7B2C2D]/40 hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden">
                  <div className="absolute inset-0 bg-[#EADDC5]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase text-[#3B1011] shadow-sm border border-[#3B1011]/10 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    Look 02
                  </div>

                  {/* Outfit Layout Pieces */}
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 w-40 h-44 bg-white rounded-xl flex items-center justify-center text-xs font-bold tracking-widest uppercase text-[#3B1011]/40 shadow-sm border border-[#3B1011]/5 group-hover:border-[#7B2C2D]/20 transition-colors z-10">Shirt</div>
                  <div className="absolute bottom-12 left-12 w-36 h-48 bg-white rounded-xl flex items-center justify-center text-xs font-bold tracking-widest uppercase text-[#3B1011]/40 shadow-sm border border-[#3B1011]/5 group-hover:border-[#7B2C2D]/20 transition-colors">Skirt</div>
                  <div className="absolute bottom-24 right-12 w-28 h-28 bg-white rounded-xl flex items-center justify-center text-xs font-bold tracking-widest uppercase text-[#3B1011]/40 shadow-sm border border-[#3B1011]/5 group-hover:border-[#7B2C2D]/20 transition-colors z-20">Bag</div>
                </div>
              </div>

              <div className="mt-8 flex justify-end relative z-10">
                <button className="px-8 py-3.5 bg-[#3B1011] text-[#FDFBF7] text-xs font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-[#5C1A1B] hover:scale-105 transition-all duration-300 shadow-lg border border-[#3B1011]">
                  Save for Today
                </button>
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}