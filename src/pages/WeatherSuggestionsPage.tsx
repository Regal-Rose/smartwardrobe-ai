import { useState, useEffect } from 'react';
import {
  CloudRain,
  Sun,
  Cloud,
  CloudLightning,
  CloudSnow,
  Thermometer,
  MapPin,
  Loader2,
  AlertCircle,
  Shirt,
  CloudSun
} from 'lucide-react';

// Define the shape of the data coming from your FastAPI backend
interface Garment {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  color: string;
  image_url: string;
}

interface WeatherData {
  temperature: number;
  condition: string;
  season_detected: string;
  recommendations: {
    tops: Garment[];
    bottoms: Garment[];
    outerwear: Garment[];
    footwear: Garment[];
  };
}

export function WeatherSuggestionsPage() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [locationName, setLocationName] = useState<string>("Locating...");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchWeather = async (lat: number, lon: number) => {
      try {
        // 1. Get highly accurate village/town name using Nominatim
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
        const geoData = await geoRes.json();
        const address = geoData.address || {};
        const locName = address.village || address.suburb || address.town || address.city || address.county || "Current Location";

        if (active) setLocationName(locName);

        // 2. Get the weather & clothing recommendations from your backend WITH credentials
        const res = await fetch(`http://localhost:8000/api/v1/weather?lat=${lat}&lon=${lon}`, {
          credentials: "include"
        });

        if (!res.ok) throw new Error("Failed to fetch weather data. Check if backend is running.");

        const data = await res.json();

        if (active) {
          setWeatherData(data);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || "Failed to load weather");
          setIsLoading(false);
        }
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Geolocation blocked or failed, using fallback.", error);
          // Fallback if user blocks GPS
          fetchWeather(26.61, 80.68);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setIsLoading(false);
    }

    return () => { active = false; };
  }, []);

  // Helper to pick the right icon based on the condition string
  const getWeatherIcon = (condition: string, size = 48) => {
    const cond = condition.toLowerCase();
    if (cond.includes('clear')) return <Sun size={size} className="text-[#3B1011]" />;
    if (cond.includes('partly')) return <CloudSun size={size} className="text-[#3B1011]" />;
    if (cond.includes('rain')) return <CloudRain size={size} className="text-[#3B1011]" />;
    if (cond.includes('thunder')) return <CloudLightning size={size} className="text-[#3B1011]" />;
    if (cond.includes('snow')) return <CloudSnow size={size} className="text-[#3B1011]" />;
    return <Cloud size={size} className="text-[#3B1011]" />;
  };

  // Horizontal scrolling list of clothes
  const GarmentRow = ({ title, items }: { title: string, items: Garment[] }) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="mb-10">
        <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#7B2C2D] mb-4 border-b border-[#3B1011]/10 pb-2">{title}</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
          {items.map((item, idx) => (
            <div key={item.id || idx} className="min-w-[140px] max-w-[140px] snap-start group cursor-pointer">
              <div className="aspect-[3/4] bg-[#EADDC5]/30 rounded-xl border border-[#3B1011]/10 flex items-center justify-center p-3 mb-3 shadow-sm group-hover:border-[#7B2C2D]/40 group-hover:shadow-md transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#3B1011]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <Shirt size={32} className="text-[#3B1011] opacity-20" />
                )}
              </div>
              <p className="text-xs font-bold text-[#3B1011] truncate group-hover:text-[#7B2C2D] transition-colors">{item.name}</p>
              <p className="text-[9px] uppercase tracking-wider text-[#5C1A1B]/70 truncate">{item.color || item.subcategory || 'Clothing'}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-[#FDFBF7] rounded-3xl border border-[#3B1011]/10 flex flex-col items-center justify-center font-sans">
        <Loader2 size={40} className="animate-spin text-[#7B2C2D] mb-4" />
        <p className="font-serif text-2xl text-[#3B1011] mb-1">Analyzing meteorology...</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#5C1A1B]/70">Scanning climate parameters</p>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-[#FDFBF7] rounded-3xl border border-[#3B1011]/10 flex flex-col items-center justify-center text-center font-sans p-6">
        <AlertCircle size={48} className="text-[#7B2C2D] mb-4 opacity-50" />
        <h2 className="font-serif text-2xl font-bold text-[#3B1011] mb-2">Atmospheric Sync Failed</h2>
        <p className="text-[#5C1A1B] text-sm max-w-md">{error}</p>
      </div>
    );
  }

  const { tops, bottoms, outerwear, footwear } = weatherData.recommendations;
  const hasRecommendations = tops.length > 0 || bottoms.length > 0 || outerwear.length > 0 || footwear.length > 0;

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
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(20px) rotate(-2deg) scale(1.05); }
        }
        .animate-float-slow { animation: float-slow 12s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 16s ease-in-out infinite; }
        
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
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] object-cover rounded-full opacity-[0.04] mix-blend-multiply animate-float-slow pointer-events-none blur-[2px]"
      />

      <div className="relative z-10 flex flex-col h-full p-8 lg:p-12 overflow-y-auto hide-scrollbar">

        {/* Weather Header Card */}
        <div className="bg-[#3B1011] p-8 lg:p-10 rounded-3xl border border-[#5C1A1B] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative overflow-hidden group mb-10">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800')] opacity-[0.03] mix-blend-screen group-hover:opacity-[0.06] transition-opacity duration-700 pointer-events-none object-cover"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-[#EADDC5] text-[10px] font-bold tracking-widest uppercase mb-4">
              <MapPin size={14} /> {locationName}
            </div>
            <h1 className="font-serif text-5xl lg:text-6xl text-[#FDFBF7] tracking-tight leading-tight">
              A {weatherData.season_detected.toLowerCase()} <br />
              <span className="italic text-[#EADDC5]">atmosphere.</span>
            </h1>
          </div>

          <div className="bg-[#FDFBF7] p-6 rounded-2xl shadow-sm border border-[#3B1011]/20 flex items-center gap-6 min-w-[240px] relative z-10">
            {getWeatherIcon(weatherData.condition, 50)}
            <div>
              <div className="flex items-start">
                <span className="font-serif text-6xl font-bold text-[#3B1011] leading-none">{Math.round(weatherData.temperature)}</span>
                <span className="text-xl font-medium text-[#7B2C2D] mt-1 ml-1">°C</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#5C1A1B] mt-2">
                {weatherData.condition}
              </p>
            </div>
          </div>
        </div>

        {/* Clothing Recommendations */}
        <div className="bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-[#3B1011]/10 shadow-sm flex-1">
          <div className="flex items-center gap-3 mb-8">
            <Thermometer className="text-[#7B2C2D]" size={20} />
            <h2 className="font-serif text-3xl font-bold text-[#3B1011]">Architectural Suggestions</h2>
          </div>

          {!hasRecommendations ? (
            <div className="text-center py-16 border border-dashed border-[#3B1011]/20 rounded-2xl bg-[#EADDC5]/20">
              <Shirt size={48} strokeWidth={1} className="mx-auto text-[#3B1011]/40 mb-4" />
              <h3 className="font-serif text-2xl font-bold text-[#3B1011]">Archive Gap Detected</h3>
              <p className="text-[#5C1A1B] text-sm mt-2 max-w-md mx-auto">
                We couldn't source any compatible {weatherData.season_detected} garments in your archive. Digitize more items to enable thermal synthesis.
              </p>
            </div>
          ) : (
            <div>
              <GarmentRow title="Base Layers & Tops" items={tops} />
              <GarmentRow title="Trousers & Bottoms" items={bottoms} />
              {outerwear.length > 0 && <GarmentRow title="Coats & Outerwear" items={outerwear} />}
              <GarmentRow title="Footwear Integration" items={footwear} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}