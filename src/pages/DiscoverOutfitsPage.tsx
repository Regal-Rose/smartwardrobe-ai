import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Heart, AlertCircle, Info, Pencil, Save, X, Compass, TrendingUp, ArrowUpRight } from 'lucide-react';
import { useServices } from '../app/ServiceProvider';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import type { Garment, Outfit, Occasion, Season, StyleType, UserPreferences } from '../types';
import { OCCASION_LABELS, SEASON_LABELS, STYLE_LABELS } from '../types';

export function DiscoverOutfitsPage() {
  const { garmentRepo, outfitRepo, preferencesRepo } = useServices();
  const location = useLocation();
  const navigate = useNavigate();
  const [garments, setGarments] = useState<Garment[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | undefined>(undefined);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingWardrobe, setLoadingWardrobe] = useState(true);
  const [generated, setGenerated] = useState(false);
  const [editing, setEditing] = useState<Outfit | null>(null);
  const [notice, setNotice] = useState('');

  const [occasion, setOccasion] = useState<Occasion>('casual');
  const [season, setSeason] = useState<Season | ''>('');
  const [style, setStyle] = useState<StyleType | ''>('');

  // Load wardrobe for generation
  useEffect(() => {
    let active = true;
    Promise.all([
      garmentRepo.list(),
      preferencesRepo.get().catch(() => undefined),
    ]).then(([g, p]) => {
      if (!active) return;
      setGarments(g);
      setPreferences(p);
      setLoadingWardrobe(false);
    }).catch(() => {
      if (active) setLoadingWardrobe(false);
    });
    return () => { active = false; };
  }, [garmentRepo, preferencesRepo]);

  useEffect(() => {
    const state = location.state as { editOutfit?: Outfit } | null;
    if (state?.editOutfit) {
      setEditing({ ...state.editOutfit, items: [...state.editOutfit.items] });
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setGenerated(false);
    try {
      const results = await outfitRepo.generate(
        {
          occasion,
          season: season || undefined,
          style: style || undefined,
        },
        garments,
        preferences,
      );
      setOutfits(results);
      setGenerated(true);
    } finally {
      setLoading(false);
    }
  }, [outfitRepo, garments, preferences, occasion, season, style]);

  const handleSave = async (outfit: Outfit) => {
    const saved = await outfitRepo.save(outfit);
    setOutfits((prev) =>
      prev.map((o) => (o.id === outfit.id ? saved : o))
    );
  };

  const handleUnsave = async (outfitId: string) => {
    await outfitRepo.unsave(outfitId);
    setOutfits((prev) =>
      prev.map((o) => (o.id === outfitId ? { ...o, isSaved: false } : o))
    );
  };

  const getGarment = (id: string) => garments.find((g) => g.id === id);

  const updateEditedItem = (index: number, garmentId: string) => {
    if (!editing) return;
    const garment = garments.find((g) => g.id === garmentId);
    if (!garment) return;
    setEditing({
      ...editing,
      items: editing.items.map((item, i) => i === index
        ? { ...item, garmentId: garment.id }
        : item),
      name: editing.items.map((item, i) => {
        const current = i === index ? garment : getGarment(item.garmentId);
        return current?.name;
      }).filter(Boolean).slice(0, 2).join(' + '),
    });
  };

  const saveEditedOutfit = async () => {
    if (!editing || editing.items.length === 0) return;
    const saved = await outfitRepo.save({ ...editing, isSaved: true, dateCreated: editing.dateCreated || new Date().toISOString() });
    setOutfits((prev) => {
      const exists = prev.some((o) => o.id === saved.id);
      return exists ? prev.map((o) => o.id === saved.id ? saved : o) : [saved, ...prev];
    });
    setEditing(null);
    setNotice('Outfit saved. It will be available in Lookbook after refresh.');
  };

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
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(25px) rotate(-3deg) scale(1.05); }
        }
        .animate-float-slow { animation: float-slow 14s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 18s ease-in-out infinite; }
        
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
        className="absolute top-20 -right-40 w-[700px] h-[700px] object-cover rounded-full opacity-[0.05] mix-blend-multiply animate-float-slow pointer-events-none blur-[2px]"
      />
      <img
        src="https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=600&auto=format&fit=crop"
        alt="3D Texture"
        className="absolute -bottom-20 -left-20 w-[500px] h-[500px] object-cover rounded-full opacity-[0.06] mix-blend-multiply animate-float-slower pointer-events-none blur-[1px]"
      />

      <div className="relative z-10 flex flex-col h-full p-8 lg:p-12 overflow-y-auto hide-scrollbar">

        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7B2C2D] mb-3 flex items-center gap-2">
              <Compass size={12} /> NEURAL CURATION & GLOBAL RUNWAY TELEMETRY
            </p>
            <h1 className="font-serif text-5xl lg:text-6xl font-bold text-[#3B1011] tracking-tight">
              Discover Engine<span className="text-[#7B2C2D]">.</span>
            </h1>
            <p className="text-sm font-medium text-[#5C1A1B] mt-4 opacity-80 max-w-md">
              Find fresh aesthetic combinations curated from your own wardrobe pieces using our rules-based stylist.
            </p>
          </div>
        </header>

        {/* Info banner */}
        <div className="flex items-start gap-3 p-5 bg-[#EADDC5]/40 rounded-xl border border-[#3B1011]/10 mb-8 backdrop-blur-sm">
          <Info size={18} className="text-[#7B2C2D] mt-0.5 shrink-0" />
          <div className="text-sm text-[#3B1011]">
            <p className="font-bold tracking-wide uppercase text-xs">Personalised outfit matching</p>
            <p className="text-xs mt-1.5 opacity-80 leading-relaxed font-medium">
              Suggestions are ranked using your wardrobe, colour coordination, occasion, season and saved style preferences.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#3B1011]/10 p-6 shadow-sm mb-8">
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#3B1011] mb-5">
            Set Styling Parameters
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-[#5C1A1B] mb-2">Occasion</label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value as Occasion)}
                className="w-full px-4 py-3 bg-white border border-[#3B1011]/10 text-[#3B1011] focus:outline-none focus:border-[#7B2C2D] transition-colors rounded-xl text-sm"
              >
                {Object.entries(OCCASION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-[#5C1A1B] mb-2">Season</label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value as Season | '')}
                className="w-full px-4 py-3 bg-white border border-[#3B1011]/10 text-[#3B1011] focus:outline-none focus:border-[#7B2C2D] transition-colors rounded-xl text-sm"
              >
                <option value="">Any Season</option>
                {Object.entries(SEASON_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-[#5C1A1B] mb-2">Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as StyleType | '')}
                className="w-full px-4 py-3 bg-white border border-[#3B1011]/10 text-[#3B1011] focus:outline-none focus:border-[#7B2C2D] transition-colors rounded-xl text-sm"
              >
                <option value="">Any Style</option>
                {Object.entries(STYLE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-start">
            <button
              onClick={handleGenerate}
              disabled={loading || loadingWardrobe || garments.length === 0}
              className="bg-[#3B1011] text-[#FDFBF7] px-8 py-4 rounded-sm flex items-center gap-2 hover:bg-[#5C1A1B] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 border border-[#3B1011] disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <Sparkles size={16} className={loading ? "animate-pulse" : ""} />
              <span className="text-xs font-bold tracking-[0.15em] uppercase">
                {loading ? 'Synthesizing...' : 'Generate Outfits'}
              </span>
            </button>
            {garments.length === 0 && !loadingWardrobe && (
              <p className="text-xs text-[#7B2C2D] mt-3 flex items-center gap-1.5 font-bold">
                <AlertCircle size={14} />
                Your archive is empty. Digitize garments first.
              </p>
            )}
          </div>
        </div>

        {notice && (
          <div className="flex items-center justify-between gap-3 bg-[#EADDC5] border border-[#3B1011]/20 px-5 py-4 rounded-xl text-sm text-[#3B1011] font-medium mb-8">
            <span>{notice}</span>
            <button onClick={() => setNotice('')} aria-label="Dismiss message" className="hover:text-[#7B2C2D]"><X size={16} /></button>
          </div>
        )}

        {/* RESULTS SECTION */}
        {generated && outfits.length === 0 && (
          <div className="bg-white/60 border border-[#3B1011]/10 rounded-2xl p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-[#EADDC5]/50 rounded-full flex items-center justify-center mb-4">
              <Sparkles size={24} className="text-[#5C1A1B]" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#3B1011] mb-2">No aesthetic alignments found</h3>
            <p className="text-[#5C1A1B] text-sm max-w-md mx-auto mb-6">
              Your archive lacks compatible garments for the "{OCCASION_LABELS[occasion]}" parameter.
            </p>
            <button onClick={() => navigate('/wardrobe')} className="text-xs font-bold tracking-widest uppercase text-[#7B2C2D] hover:text-[#3B1011] transition-colors border-b border-[#7B2C2D] pb-1">
              Expand Wardrobe
            </button>
          </div>
        )}

        {outfits.length > 0 && (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-bold text-[#3B1011]">
              {outfits.length} Curations Found
            </h2>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
              {outfits.map((outfit) => (
                <div key={outfit.id} className="bg-white rounded-2xl border border-[#3B1011]/10 p-6 shadow-sm hover:shadow-xl hover:border-[#7B2C2D]/30 transition-all duration-300">

                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#3B1011] group-hover:text-[#7B2C2D] transition-colors">
                        {outfit.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="bg-[#EADDC5]/50 text-[#3B1011] text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-sm">{STYLE_LABELS[outfit.style]}</span>
                        <span className="bg-[#EADDC5]/50 text-[#3B1011] text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-sm">{OCCASION_LABELS[outfit.occasion]}</span>
                        <span className="bg-white border border-[#3B1011]/10 text-[#3B1011]/60 text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-sm">{outfit.items.length} pieces</span>
                      </div>

                      {typeof outfit.recommendationScore === 'number' && (
                        <div className="mt-4">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-[#7B2C2D]">Taste Alignment</span>
                            <span className="text-xs font-bold text-[#3B1011]">{outfit.recommendationScore}%</span>
                            <div className="h-1 w-24 overflow-hidden rounded-full bg-[#EADDC5]">
                              <div className="h-full rounded-full bg-[#7B2C2D]" style={{ width: `${outfit.recommendationScore}%` }} />
                            </div>
                          </div>
                          {outfit.recommendationReasons?.length ? <p className="text-[10px] text-[#5C1A1B]/70 uppercase tracking-wider">{outfit.recommendationReasons.join(' // ')}</p> : null}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => { setEditing({ ...outfit, items: [...outfit.items] }); setNotice(''); }} className="p-2.5 rounded-full text-[#3B1011]/40 hover:text-[#7B2C2D] hover:bg-[#EADDC5]/50 transition-colors" aria-label="Edit outfit">
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => outfit.isSaved ? handleUnsave(outfit.id) : handleSave(outfit)}
                        className={`p-2.5 rounded-full transition-colors ${outfit.isSaved ? 'text-[#7B2C2D] bg-[#7B2C2D]/10' : 'text-[#3B1011]/40 hover:text-[#7B2C2D] hover:bg-[#EADDC5]/50'}`}
                      >
                        <Heart size={18} fill={outfit.isSaved ? "currentColor" : "none"} />
                      </button>
                    </div>
                  </div>

                  {/* Garment Images Reel */}
                  <div className="flex gap-4 overflow-x-auto hide-scrollbar pt-2 pb-2">
                    {outfit.items.map((item) => {
                      const g = getGarment(item.garmentId);
                      if (!g) return null;
                      return (
                        <div key={item.garmentId} className="flex-none w-28 group/item cursor-pointer">
                          <div className="aspect-[3/4] bg-[#EADDC5]/30 rounded-xl overflow-hidden mb-2 border border-[#3B1011]/5 group-hover/item:border-[#7B2C2D]/30 transition-colors relative">
                            {g.imageUrl ? (
                              <img src={g.imageUrl} alt={g.name} className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500" loading="lazy" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-[10px] text-[#3B1011]/30 font-serif italic">{g.name}</div>
                            )}
                          </div>
                          <p className="text-[10px] font-bold text-[#3B1011] truncate">{g.name}</p>
                          <p className="text-[9px] uppercase tracking-wider text-[#5C1A1B]/60 truncate">{item.role.replace(/-/g, ' ')}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3B1011]/40 backdrop-blur-sm p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-[#FDFBF7] p-8 shadow-2xl border border-[#3B1011]/10 font-sans hide-scrollbar">

              <div className="flex items-start justify-between gap-4 mb-8">
                <div>
                  <p className="text-[10px] tracking-[0.2em] font-bold text-[#7B2C2D] uppercase">Outfit Studio</p>
                  <h2 className="font-serif text-3xl font-bold text-[#3B1011] mt-1">Make it yours.</h2>
                  <p className="text-sm text-[#5C1A1B] mt-1 opacity-80">Swap any piece for an item in your archive.</p>
                </div>
                <button onClick={() => setEditing(null)} className="p-2 rounded-full hover:bg-[#EADDC5] text-[#3B1011] transition-colors"><X size={20} /></button>
              </div>

              <label className="block text-[10px] font-bold tracking-widest uppercase text-[#5C1A1B] mb-2">Outfit Name</label>
              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-[#3B1011]/10 text-[#3B1011] font-serif text-lg focus:outline-none focus:border-[#7B2C2D] transition-colors rounded-xl mb-8 shadow-sm"
              />

              <div className="space-y-4">
                {editing.items.map((item, index) => {
                  const current = getGarment(item.garmentId);
                  return (
                    <div key={`${item.garmentId}-${index}`} className="grid grid-cols-[80px_1fr] gap-4 items-center rounded-2xl border border-[#3B1011]/10 bg-white p-3 hover:border-[#7B2C2D]/30 transition-colors shadow-sm">
                      <div className="aspect-[3/4] rounded-lg overflow-hidden bg-[#EADDC5]/30">
                        {current?.imageUrl && <img src={current.imageUrl} alt={current.name} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="text-[10px] tracking-widest uppercase font-bold text-[#7B2C2D] mb-1">{item.role.replace(/-/g, ' ')}</p>
                        <select
                          value={item.garmentId}
                          onChange={(e) => updateEditedItem(index, e.target.value)}
                          className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#3B1011]/10 text-[#3B1011] text-sm focus:outline-none focus:border-[#7B2C2D] transition-colors rounded-lg"
                        >
                          {garments.map((g) => <option key={g.id} value={g.id}>{g.name} · {g.category.replace(/-/g, ' ')}</option>)}
                        </select>
                        <p className="text-[10px] text-[#5C1A1B]/70 uppercase tracking-wider mt-2 font-medium">
                          {current?.color ?? ''} {current?.style ? `· ${current.style}` : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-[#3B1011]/10">
                <button onClick={() => setEditing(null)} className="px-6 py-3 text-xs font-bold tracking-widest uppercase text-[#3B1011] hover:text-[#7B2C2D] transition-colors">
                  Cancel
                </button>
                <button onClick={saveEditedOutfit} className="bg-[#3B1011] text-[#FDFBF7] px-6 py-3 rounded-sm flex items-center gap-2 hover:bg-[#5C1A1B] transition-all shadow-md">
                  <Save size={16} />
                  <span className="text-xs font-bold tracking-widest uppercase">Save Changes</span>
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}