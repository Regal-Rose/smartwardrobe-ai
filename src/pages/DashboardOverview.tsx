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

  // Helper function to format today's date (e.g. "Oct 21")
  const getTodayFormatted = () => {
    return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  useEffect(() => {
    let active = true;

    // 1. Fetch User Name
    checkSession().then(user => {
      if (active && user) {
        const displayName = user.name || user.firstName || (user.email ? user.email.split('@')[0] : 'User');
        setUserName(displayName.charAt(0).toUpperCase() + displayName.slice(1));
      }
    });

    // 2. Fetch Real Analytics from FastAPI
    fetch("http://localhost:8000/api/v1/analytics/wardrobe", { credentials: "include" })
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

  // 3. Fetch Live Weather based on highly accurate User Geolocation
  const fetchWeather = () => {
    const getWeatherData = async (lat: number, lon: number) => {
      try {
        // 1. Get exact village/town name using OpenStreetMap Nominatim (High granularity)
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
        const geoData = await geoRes.json();

        // Extract the most specific location name available
        const address = geoData.address || {};
        const locName = address.village || address.suburb || address.town || address.city || address.county || "Current Location";

        // 2. Hit your backend weather endpoint WITH credentials
        const weatherRes = await fetch(`http://localhost:8000/api/v1/weather?lat=${lat}&lon=${lon}`, {
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
          // Fallback location if browser blocks GPS (Parsandan coordinates)
          getWeatherData(26.61, 80.68);
        },
        // Force the browser to use GPS or highest accuracy Wi-Fi positioning
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setWeather({ temp: '--', condition: 'Geolocation not supported', location: 'Unknown' });
      setIsRefreshing(false);
    }
  };

  // Fetch weather automatically on first load
  useEffect(() => {
    fetchWeather();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchWeather();
  };

  return (
    <div className="space-y-8 bg-surface p-6 rounded-2xl border border-border-light min-h-[calc(100vh-8rem)]">

      {/* 1. Header Section */}
      <header className="flex justify-between items-end border-b border-border-light pb-6">
        <div>
          <p className="text-xs uppercase tracking-[.18em] text-ink-muted mb-1">Overview</p>
          <h1 className="heading-editorial-lg text-ink">Hello, {userName}</h1>
        </div>
        <div className="flex items-center gap-4 text-ink-muted">
          {/* Linked Calendar to Planner Page */}
          <Link to="/planner" className="hover:bg-ivory hover:text-ink p-2 rounded-full transition" title="Outfit Planner">
            <Calendar size={20} />
          </Link>

          {/* Notifications Placeholder */}
          <button className="hover:bg-ivory hover:text-ink p-2 rounded-full transition" title="Notifications">
            <Bell size={20} />
          </button>

          {/* Linked Avatar to Settings Page */}
          <Link to="/settings" className="h-10 w-10 bg-sage-deep text-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm ml-2 hover:opacity-90 transition" title="Settings">
            <User size={20} />
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: AI Stylist & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-ink">AI Stylist</h2>
              <Link to="/discover" className="text-xs text-sage-deep hover:underline flex items-center gap-1">
                View all <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Linked Outfit Suggestion to Weather/Suggestions */}
              <Link to="/weather" className="bg-blue-50/40 hover:bg-blue-50/80 transition-colors p-5 rounded-2xl flex flex-col items-start justify-between h-32 relative overflow-hidden group border border-blue-100/50">
                <span className="font-medium text-sm text-ink z-10">Outfit<br />suggestion</span>
                <Shirt className="absolute right-4 bottom-4 text-blue-400 w-12 h-12 group-hover:scale-110 group-hover:-rotate-3 transition-transform opacity-80" />
              </Link>

              {/* Linked Chat */}
              <button onClick={() => navigate('/lookbook')} className="bg-ivory hover:bg-ivory-warm transition-colors p-5 rounded-2xl flex flex-col items-start justify-between h-32 relative overflow-hidden group border border-border-light text-left">
                <span className="font-medium text-sm text-ink z-10">Style<br />chat</span>
                <MessageCircle className="absolute right-4 bottom-4 text-blue-500 w-11 h-11 group-hover:scale-110 group-hover:rotate-3 transition-transform opacity-80" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: Palette, color: 'text-rose-400', label: 'Color', route: '/preferences' },
                { icon: User, color: 'text-emerald-500', label: 'Fit', route: '/preferences' },
                { icon: Star, color: 'text-blue-600', label: 'Rate', route: '/lookbook' },
                { icon: Eye, color: 'text-ink-muted', label: 'Try On', route: '/builder' },
              ].map((tool, idx) => (
                <Link key={idx} to={tool.route} className="bg-white hover:bg-ivory transition-colors py-4 rounded-xl flex flex-col items-center justify-center gap-2 border border-border-light shadow-sm group">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center mb-1 group-hover:bg-ivory-warm transition-colors">
                    <tool.icon size={22} className={tool.color} strokeWidth={1.5} />
                  </div>
                  <span className="text-xs font-medium text-ink-muted group-hover:text-ink transition-colors">{tool.label}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="bg-ivory-warm p-6 rounded-2xl border border-border-light">
            <h3 className="text-sm font-semibold text-ink mb-4">Wardrobe Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink-muted">Total Items</span>
                <span className="font-medium text-ink">{stats.totalGarments}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink-muted">Saved Outfits</span>
                <span className="font-medium text-ink">{stats.savedOutfits}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink-muted">Times Worn</span>
                <span className="font-medium text-sage-deep">{stats.wearEvents}</span>
              </div>
            </div>
            {/* Linked Manage Wardrobe to Wardrobe Page */}
            <Link to="/wardrobe" className="block w-full mt-5 py-2.5 bg-white border border-border-light rounded-lg text-sm font-medium text-ink hover:bg-ivory transition-colors text-center shadow-sm">
              Manage Wardrobe
            </Link>
          </section>
        </div>

        {/* Right Column: Daily Weather & Outfit Canvas */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-border-light shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                {/* Dynamically adjust the title based on the live weather condition */}
                <h2 className="text-xl font-semibold text-ink">Casual Daily Look for {weather.condition}</h2>
                <div className="flex items-center gap-5 text-sm text-ink-muted mt-2">
                  <span className="flex items-center gap-1.5 bg-ivory px-3 py-1 rounded-full"><Calendar size={14} /> {getTodayFormatted()}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={14} /> {weather.location}</span>
                  <span className="flex items-center gap-1.5"><CloudSun size={14} /> {weather.temp}</span>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                className={`p-2.5 bg-ivory rounded-full text-ink-muted hover:text-ink hover:bg-ivory-warm border border-border-light transition-all ${isRefreshing ? 'animate-spin border-sage-deep text-sage-deep' : ''}`}
                aria-label="Refresh suggestions"
              >
                <RefreshCw size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
              {/* Card 1 */}
              <div className="h-[400px] bg-ivory/50 border border-border-light rounded-2xl p-6 relative group hover:border-sage/50 transition-colors cursor-pointer">
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-ink shadow-sm border border-border-light z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  Look 1
                </div>
                <div className="absolute top-8 left-8 w-32 h-32 bg-white rounded-xl flex items-center justify-center text-sm font-medium text-ink-muted shadow-sm border border-border-light/50">Top</div>
                <div className="absolute top-12 right-8 w-36 h-40 bg-white rounded-xl flex items-center justify-center text-sm font-medium text-ink-muted shadow-sm border border-border-light/50">Jacket</div>
                <div className="absolute bottom-8 left-12 w-32 h-48 bg-white rounded-xl flex items-center justify-center text-sm font-medium text-ink-muted shadow-sm border border-border-light/50">Pants</div>
                <div className="absolute bottom-12 right-12 w-28 h-20 bg-white rounded-xl flex items-center justify-center text-sm font-medium text-ink-muted shadow-sm border border-border-light/50">Shoes</div>
              </div>

              {/* Card 2 */}
              <div className="h-[400px] bg-ivory/50 border border-border-light rounded-2xl p-6 relative group hover:border-sage/50 transition-colors cursor-pointer">
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-ink shadow-sm border border-border-light z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  Look 2
                </div>
                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-40 h-44 bg-white rounded-xl flex items-center justify-center text-sm font-medium text-ink-muted shadow-sm border border-border-light/50">Shirt</div>
                <div className="absolute bottom-12 left-12 w-36 h-48 bg-white rounded-xl flex items-center justify-center text-sm font-medium text-ink-muted shadow-sm border border-border-light/50">Skirt</div>
                <div className="absolute bottom-24 right-12 w-28 h-28 bg-white rounded-xl flex items-center justify-center text-sm font-medium text-ink-muted shadow-sm border border-border-light/50">Bag</div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button className="px-5 py-2.5 bg-sage-deep text-white font-medium rounded-lg hover:bg-sage transition-colors shadow-sm">
                Save for Today
              </button>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}