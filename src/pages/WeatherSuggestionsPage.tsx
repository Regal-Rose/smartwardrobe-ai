import { useState } from 'react';
import { CloudRain, Navigation, Loader2, ThermometerSun, Wind, Droplets } from 'lucide-react';

const API = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

interface WeatherData {
  temperature: number;
  condition: string;
  season_detected: string;
  recommendations: {
    tops: any[];
    bottoms: any[];
    outerwear: any[];
    footwear: any[];
  };
}

export function WeatherSuggestionsPage() {
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(4));
        setLon(position.coords.longitude.toFixed(4));
        setLoading(false);
      },
      () => {
        setError("Unable to retrieve your location.");
        setLoading(false);
      }
    );
  };

  const fetchWeather = async () => {
    if (!lat || !lon) {
      setError("Please enter latitude and longitude.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API}/api/v1/weather?lat=${lat}&lon=${lon}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Failed to fetch weather data.");
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="heading-editorial-lg text-ink">Weather Suggestions</h1>
        <p className="text-body mt-2 max-w-2xl">
          Get outfit recommendations based on real-time weather conditions.
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border-light p-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-ink mb-1">Latitude</label>
            <input
              type="text"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="e.g. 28.6139"
              className="w-full bg-surface-warm border border-border rounded-lg px-4 py-2.5 text-ink focus:border-sage focus:ring-1 focus:ring-sage outline-none transition-all"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-ink mb-1">Longitude</label>
            <input
              type="text"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              placeholder="e.g. 77.2090"
              className="w-full bg-surface-warm border border-border rounded-lg px-4 py-2.5 text-ink focus:border-sage focus:ring-1 focus:ring-sage outline-none transition-all"
            />
          </div>
          <button
            onClick={getLocation}
            className="p-3 bg-surface-warm border border-border rounded-lg text-ink-muted hover:text-sage hover:border-sage transition-colors"
            title="Use Current Location"
          >
            <Navigation size={20} />
          </button>
          <button
            onClick={fetchWeather}
            disabled={loading}
            className="button-dark px-6 py-2.5 min-w-[140px] flex justify-center"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Fetch Weather'}
          </button>
        </div>
        {error && <p className="text-danger text-sm mt-3 font-medium">{error}</p>}
      </div>

      {weatherData && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Weather Display Card */}
          <div className="bg-sage-pale rounded-2xl p-8 border border-sage/20 relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
              <ThermometerSun size={240} />
            </div>

            <div className="relative z-10">
              <span className="text-xs font-bold tracking-wider text-sage-deep uppercase mb-2 block">Current Conditions</span>
              <div className="flex items-end gap-4 mb-6">
                <span className="text-6xl font-light text-ink tracking-tighter">{weatherData.temperature}°C</span>
                <span className="text-xl text-ink-muted mb-2 font-medium capitalize">{weatherData.condition}</span>
              </div>

              <div className="flex gap-6 text-sm text-ink-muted font-medium">
                <div className="flex items-center gap-2"><CloudRain size={16} className="text-sage" /> Perfect for {weatherData.season_detected} wear</div>
                <div className="flex items-center gap-2"><Droplets size={16} className="text-sage" /> Precipitation check</div>
                <div className="flex items-center gap-2"><Wind size={16} className="text-sage" /> Wind levels</div>
              </div>
            </div>
          </div>

          {/* Outfit Recommendations Grid */}
          <div>
            <h2 className="text-lg font-semibold text-ink mb-4 border-b border-border pb-2">Suggested Pieces from Your Wardrobe</h2>

            {/* Tops */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-ink-muted mb-3 uppercase tracking-wider">Recommended Tops</h3>
              {weatherData.recommendations.tops.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {weatherData.recommendations.tops.map(item => (
                    <div key={item.id} className="bg-surface rounded-xl border border-border overflow-hidden hover:border-sage transition-colors group">
                      <div className="aspect-square bg-surface-warm relative">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-ink-faint text-xs">No image</div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-ink truncate">{item.name}</p>
                        <p className="text-xs text-ink-muted capitalize">{item.color} • {item.subcategory}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-faint italic bg-surface-warm p-4 rounded-lg border border-border-light">No suitable tops found for this weather.</p>
              )}
            </div>

            {/* Bottoms */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-ink-muted mb-3 uppercase tracking-wider">Recommended Bottoms</h3>
              {weatherData.recommendations.bottoms.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {weatherData.recommendations.bottoms.map(item => (
                    <div key={item.id} className="bg-surface rounded-xl border border-border overflow-hidden hover:border-sage transition-colors group">
                      <div className="aspect-square bg-surface-warm relative">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-ink-faint text-xs">No image</div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-ink truncate">{item.name}</p>
                        <p className="text-xs text-ink-muted capitalize">{item.color} • {item.subcategory}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-faint italic bg-surface-warm p-4 rounded-lg border border-border-light">No suitable bottoms found for this weather.</p>
              )}
            </div>

            {/* Outerwear (Only show if there are items) */}
            {weatherData.recommendations.outerwear.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-ink-muted mb-3 uppercase tracking-wider">Suggested Outerwear</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {weatherData.recommendations.outerwear.map(item => (
                    <div key={item.id} className="bg-surface rounded-xl border border-border overflow-hidden hover:border-sage transition-colors group">
                      <div className="aspect-square bg-surface-warm relative">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-ink-faint text-xs">No image</div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-ink truncate">{item.name}</p>
                        <p className="text-xs text-ink-muted capitalize">{item.color} • {item.subcategory}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}