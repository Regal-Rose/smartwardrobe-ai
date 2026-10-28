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
        // 1. Get highly accurate village/town name (like Parsandan) using Nominatim
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
        const geoData = await geoRes.json();
        const address = geoData.address || {};
        const locName = address.village || address.suburb || address.town || address.city || address.county || "Current Location";

        if (active) setLocationName(locName);

        // 2. Get the weather & clothing recommendations from your backend WITH credentials
        const res = await fetch(`http://localhost:8000/api/v1/weather?lat=${lat}&lon=${lon}`, {
          credentials: "include" // <--- This fixes the error!
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
          // Fallback to Parsandan if user blocks GPS
          fetchWeather(26.61, 80.68);
        },
        // Force high accuracy mode
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
    if (cond.includes('clear')) return <Sun size={size} className="text-amber-500" />;
    if (cond.includes('partly')) return <CloudSun size={size} className="text-amber-500" />;
    if (cond.includes('rain')) return <CloudRain size={size} className="text-blue-500" />;
    if (cond.includes('thunder')) return <CloudLightning size={size} className="text-purple-600" />;
    if (cond.includes('snow')) return <CloudSnow size={size} className="text-sky-400" />;
    return <Cloud size={size} className="text-gray-400" />;
  };

  // Helper component to render a horizontal scrolling list of clothes
  const GarmentRow = ({ title, items }: { title: string, items: Garment[] }) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-ink mb-4 capitalize">{title}</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
          {items.map((item, idx) => (
            <div key={item.id || idx} className="min-w-[140px] max-w-[140px] snap-start">
              <div className="aspect-square bg-white rounded-2xl border border-border-light flex items-center justify-center p-3 mb-2 shadow-sm">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
                ) : (
                  <Shirt size={32} className="text-ink-muted opacity-30" />
                )}
              </div>
              <p className="text-sm font-medium text-ink truncate">{item.name}</p>
              <p className="text-xs text-ink-muted capitalize">{item.color || item.subcategory || 'Clothing'}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-surface p-6 rounded-2xl border border-border-light flex flex-col items-center justify-center">
        <Loader2 size={40} className="animate-spin text-sage-deep mb-4" />
        <p className="text-ink font-medium">Analyzing weather patterns...</p>
        <p className="text-sm text-ink-muted mt-1">Finding the perfect clothes for your climate.</p>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-surface p-6 rounded-2xl border border-border-light flex flex-col items-center justify-center text-center">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-ink mb-2">Could not load weather</h2>
        <p className="text-ink-muted mb-4">{error}</p>
      </div>
    );
  }

  const { tops, bottoms, outerwear, footwear } = weatherData.recommendations;
  const hasRecommendations = tops.length > 0 || bottoms.length > 0 || outerwear.length > 0 || footwear.length > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Weather Header Card */}
      <div className="bg-gradient-to-br from-ivory to-ivory-warm p-8 rounded-3xl border border-border-light shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 text-ink-muted font-medium mb-3">
            <MapPin size={18} />
            <span>{locationName}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-ink tracking-tight">
            It's a {weatherData.season_detected} day.
          </h1>
          <p className="text-ink-muted mt-3 text-lg">
            Here is what we recommend wearing based on your wardrobe.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light flex items-center gap-6 min-w-[250px]">
          {getWeatherIcon(weatherData.condition, 56)}
          <div>
            <div className="flex items-start">
              <span className="text-5xl font-bold text-ink">{Math.round(weatherData.temperature)}</span>
              <span className="text-2xl font-medium text-ink-muted mt-1">°C</span>
            </div>
            <p className="text-sm font-medium text-ink-muted capitalize mt-1">
              {weatherData.condition}
            </p>
          </div>
        </div>
      </div>

      {/* Clothing Recommendations */}
      <div className="bg-surface p-6 md:p-8 rounded-3xl border border-border-light shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <Thermometer className="text-sage-deep" size={24} />
          <h2 className="text-2xl font-semibold text-ink">Smart Wardrobe Picks</h2>
        </div>

        {!hasRecommendations ? (
          <div className="text-center py-12 border-2 border-dashed border-border-light rounded-2xl bg-ivory/50">
            <Shirt size={48} className="mx-auto text-ink-muted mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-ink">Not enough clothes for this season</h3>
            <p className="text-sm text-ink-muted mt-2">
              We couldn't find any {weatherData.season_detected} clothing in your wardrobe. <br />
              Go to the Wardrobe tab and add some items to get recommendations!
            </p>
          </div>
        ) : (
          <div>
            <GarmentRow title="Tops & Shirts" items={tops} />
            <GarmentRow title="Bottoms" items={bottoms} />
            {outerwear.length > 0 && <GarmentRow title="Outerwear & Layers" items={outerwear} />}
            <GarmentRow title="Footwear" items={footwear} />
          </div>
        )}
      </div>

    </div>
  );
}