import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Trash2, CalendarCheck2, Shirt, Sparkles, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useServices } from '../app/ServiceProvider';
import type { Outfit } from '../types';

// Updated to match your FastAPI Pydantic backend model
type PlannedOutfit = { id?: number; date: string; outfit_id: number; description: string };

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// FIX: Use Vercel backend URL if it exists, otherwise use localhost for local testing
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function OutfitPlannerPage() {
  const { outfitRepo } = useServices();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [plans, setPlans] = useState<PlannedOutfit[]>([]);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()));
  const [outfitId, setOutfitId] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Fetch available saved outfits
  useEffect(() => {
    let active = true;
    outfitRepo.listSaved().then(items => {
      if (active) setOutfits(items);
    }).catch(() => {
      if (active) setError('Could not load saved outfits. Check that the backend is running.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [outfitRepo]);

  // 2. Fetch planned outfits from FastAPI whenever the calendar month changes
  useEffect(() => {
    let active = true;
    const fetchPlans = async () => {
      try {
        const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
        const res = await fetch(`${BASE_URL}/api/planner/${monthStr}`);
        if (res.ok) {
          const data = await res.json();
          if (active) setPlans(data.planned_outfits || []);
        }
      } catch (err) {
        console.error("Failed to fetch planned outfits:", err);
      }
    };
    fetchPlans();
    return () => { active = false; };
  }, [month]);

  const days = useMemo(() => {
    const firstWeekday = month.getDay();
    const totalDays = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells: Array<{ date: string; day: number } | null> = Array(firstWeekday).fill(null);
    for (let day = 1; day <= totalDays; day++) cells.push({ date: dateKey(new Date(month.getFullYear(), month.getMonth(), day)), day });
    while (cells.length % 7) cells.push(null);
    return cells;
  }, [month]);

  const selectedPlans = plans.filter(p => p.date === selectedDate);
  const selectedOutfit = outfits.find(o => String(o.id) === String(outfitId));
  const formatDate = (key: string) => new Date(`${key}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // 3. Send new planned outfit to FastAPI database
  const addPlan = async () => {
    if (!outfitId) { setError('Choose a saved outfit first.'); return; }

    const payload = {
      date: selectedDate,
      outfit_id: parseInt(outfitId, 10),
      description: note.trim()
    };

    try {
      const res = await fetch(`${BASE_URL}/api/planner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Fetch the updated plans to ensure we have the new database ID for deletion
        const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
        const refreshRes = await fetch(`${BASE_URL}/api/planner/${monthStr}`);
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setPlans(data.planned_outfits || []);
        } else {
          setPlans(prev => [...prev.filter(p => !(p.date === selectedDate && p.outfit_id === payload.outfit_id)), payload]);
        }

        setNote(''); setError(''); setSuccess('Outfit added to your calendar database.');
      } else {
        setError('Failed to save outfit to database.');
      }
    } catch (err) {
      setError('Could not connect to backend.');
    }
  };

  // 4. Send DELETE request to FastAPI database
  const removePlan = async (plan: PlannedOutfit) => {
    if (plan.id) {
      try {
        const response = await fetch(`${BASE_URL}/api/planner/${plan.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          setError("Failed to delete from database");
          return;
        }
      } catch (error) {
        setError("Error connecting to backend.");
        return;
      }
    }

    setPlans(prev => prev.filter(p => !(p.date === plan.date && p.outfit_id === plan.outfit_id)));
    setSuccess('Planned outfit permanently removed.');
    setError('');
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
          50% { transform: translateY(30px) rotate(-3deg) scale(1.05); }
        }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 14s ease-in-out infinite; }
        
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
        className="absolute -top-40 -left-20 w-[600px] h-[600px] object-cover rounded-full opacity-[0.05] mix-blend-multiply animate-float-slow pointer-events-none blur-[2px]"
      />
      <img
        src="https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=600&auto=format&fit=crop"
        alt="3D Texture"
        className="absolute bottom-10 -right-20 w-[400px] h-[400px] object-cover rounded-full opacity-[0.06] mix-blend-multiply animate-float-slower pointer-events-none blur-[1px]"
      />

      <div className="relative z-10 flex flex-col h-full p-8 lg:p-12 overflow-y-auto hide-scrollbar">

        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7B2C2D] mb-3 flex items-center gap-2">
              <CalendarDays size={12} /> INTENTIONAL CHRONOLOGICAL STYLING
            </p>
            <h1 className="font-serif text-5xl lg:text-6xl font-bold text-[#3B1011] tracking-tight">
              Planner<span className="text-[#7B2C2D]">.</span>
            </h1>
            <p className="text-sm font-medium text-[#5C1A1B] mt-4 opacity-80 max-w-md">
              Choreograph your ensembles in advance. Harmonize your itinerary with your wardrobe rest cycles.
            </p>
          </div>

          <div className="flex gap-4">
            <Link to="/lookbook" className="bg-white/60 backdrop-blur-sm text-[#3B1011] px-6 py-3.5 rounded-sm flex items-center gap-2 hover:bg-[#EADDC5] transition-all duration-300 shadow-sm border border-[#3B1011]/20">
              <Sparkles size={16} className="text-[#7B2C2D]" />
              <span className="text-xs font-bold tracking-[0.15em] uppercase">Archived Looks</span>
            </Link>
          </div>
        </header>

        {error && (
          <div className="bg-[#3B1011] text-[#F4EBD9] p-4 text-xs font-semibold tracking-wider uppercase border border-[#7B2C2D] mb-6 rounded-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {success && (
          <div className="bg-[#EADDC5] text-[#3B1011] p-4 text-xs font-bold tracking-wider uppercase border border-[#3B1011]/20 mb-6 rounded-sm flex items-center gap-2">
            <CalendarCheck2 size={16} /> {success}
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px] flex-1">

          {/* LEFT: CALENDAR GRID */}
          <section className="rounded-3xl border border-[#3B1011]/10 bg-white/60 backdrop-blur-md p-6 lg:p-8 shadow-sm flex flex-col">

            {/* Calendar Controls */}
            <div className="flex items-center justify-between gap-3 mb-8 bg-[#FDFBF7] border border-[#3B1011]/10 p-3 rounded-2xl shadow-inner">
              <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded-xl p-2 hover:bg-[#EADDC5] text-[#3B1011] transition-colors" aria-label="Previous month">
                <ChevronLeft size={20} />
              </button>
              <div className="text-center flex flex-col items-center">
                <h2 className="font-serif text-2xl font-bold text-[#3B1011]">{monthNames[month.getMonth()]} {month.getFullYear()}</h2>
                <button type="button" onClick={() => { const now = new Date(); setMonth(new Date(now.getFullYear(), now.getMonth(), 1)); setSelectedDate(dateKey(now)); }} className="text-[10px] font-bold uppercase tracking-widest text-[#7B2C2D] mt-1 hover:text-[#3B1011] transition-colors">
                  Return to Today
                </button>
              </div>
              <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded-xl p-2 hover:bg-[#EADDC5] text-[#3B1011] transition-colors" aria-label="Next month">
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 mb-4 border-b border-[#3B1011]/10 pb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C1A1B]/70">{day}</div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2 flex-1 min-h-[400px]">
              {days.map((cell, i) => {
                const hasPlan = cell ? plans.some(p => p.date === cell.date) : false;
                const isSelected = cell?.date === selectedDate;
                const isToday = cell?.date === dateKey(new Date());

                return (
                  <button
                    key={cell?.date ?? `blank-${i}`}
                    type="button"
                    disabled={!cell}
                    onClick={() => cell && (setSelectedDate(cell.date), setError(''), setSuccess(''))}
                    className={`relative min-h-[80px] rounded-xl p-2 text-sm transition-all duration-300 border ${!cell
                      ? 'cursor-default border-transparent'
                      : isSelected
                        ? 'bg-[#3B1011] text-[#FDFBF7] border-[#3B1011] shadow-md transform scale-[1.02]'
                        : 'bg-[#FDFBF7] hover:bg-[#EADDC5]/50 text-[#3B1011] border-[#3B1011]/10 hover:border-[#7B2C2D]/30'
                      } ${isToday && !isSelected ? 'ring-1 ring-[#7B2C2D]' : ''}`}
                  >
                    <span className={`absolute top-2 left-3 font-serif text-lg ${isSelected ? 'text-[#FDFBF7]' : 'text-[#3B1011]'}`}>
                      {cell?.day ?? ''}
                    </span>

                    {hasPlan && (
                      <div className="absolute inset-x-2 bottom-2 h-1.5 flex gap-1 justify-center">
                        {plans.filter(p => p.date === cell?.date).map((_, idx) => (
                          <span key={idx} className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-[#EADDC5]' : 'bg-[#7B2C2D]'}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* RIGHT: SIDEBAR PANELS */}
          <aside className="space-y-6 flex flex-col h-full">

            {/* Panel 1: Plan an Outfit */}
            <section className="rounded-3xl border border-[#3B1011]/10 bg-[#EADDC5]/30 backdrop-blur-sm p-6 lg:p-8 shadow-inner">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays size={18} className="text-[#7B2C2D]" />
                <h2 className="font-serif text-2xl font-bold text-[#3B1011]">Schedule Look</h2>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#5C1A1B]/70 mb-6 border-b border-[#3B1011]/10 pb-4">
                {formatDate(selectedDate)}
              </p>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-8 opacity-50">
                  <Shirt size={32} className="animate-pulse mb-2 text-[#3B1011]" />
                  <p className="text-xs uppercase tracking-widest font-bold">Accessing Archive...</p>
                </div>
              ) : outfits.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#3B1011]/20 p-6 text-center bg-white/40">
                  <Shirt size={32} strokeWidth={1.5} className="mx-auto text-[#3B1011]/40 mb-3" />
                  <p className="font-serif text-lg font-bold text-[#3B1011]">No Archived Looks</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[#5C1A1B]/60 mt-2 mb-4">Digitize a look first.</p>
                  <Link to="/builder" className="inline-block bg-[#3B1011] text-[#FDFBF7] px-4 py-2 rounded-sm text-[10px] font-bold tracking-widest uppercase hover:bg-[#5C1A1B] transition-colors">
                    Virtual Try-On
                  </Link>
                </div>
              ) : (
                <>
                  <label htmlFor="planner-outfit" className="block text-[10px] font-bold tracking-widest uppercase text-[#5C1A1B] mb-2">Select from Archive</label>
                  <select id="planner-outfit" value={outfitId} onChange={e => setOutfitId(e.target.value)} className="w-full rounded-xl border border-[#3B1011]/10 bg-white px-4 py-3 text-sm text-[#3B1011] focus:outline-none focus:border-[#7B2C2D] shadow-sm mb-4">
                    <option value="">Choose a look…</option>
                    {outfits.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>

                  {selectedOutfit && (
                    <div className="mb-4 rounded-xl bg-white border border-[#3B1011]/5 p-4 shadow-sm">
                      <p className="font-serif font-bold text-lg text-[#3B1011]">{selectedOutfit.name}</p>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-[#5C1A1B]/70 mt-1">{selectedOutfit.occasion.replace(/-/g, ' ')} · {selectedOutfit.items.length} pieces</p>
                    </div>
                  )}

                  <label htmlFor="planner-note" className="block text-[10px] font-bold tracking-widest uppercase text-[#5C1A1B] mb-2">Itinerary Notes</label>
                  <input id="planner-note" value={note} onChange={e => setNote(e.target.value)} maxLength={120} placeholder="e.g. Board meeting at 10 AM" className="w-full rounded-xl border border-[#3B1011]/10 bg-white px-4 py-3 text-sm text-[#3B1011] outline-none focus:border-[#7B2C2D] shadow-sm mb-6" />

                  <button onClick={addPlan} className="w-full bg-[#3B1011] text-[#FDFBF7] px-6 py-4 rounded-xl text-xs font-bold tracking-[0.15em] uppercase hover:bg-[#5C1A1B] transition-all shadow-md flex items-center justify-center gap-2">
                    <CalendarCheck2 size={16} /> Assign to Date
                  </button>
                </>
              )}
            </section>

            {/* Panel 2: Planned for this day */}
            <section className="rounded-3xl border border-[#3B1011]/10 bg-white/60 backdrop-blur-md p-6 lg:p-8 shadow-sm flex-1">
              <h2 className="font-serif text-xl font-bold text-[#3B1011] mb-1">Itinerary Log</h2>
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#5C1A1B]/70 mb-6 border-b border-[#3B1011]/10 pb-4">
                {selectedPlans.length} looks scheduled
              </p>

              {selectedPlans.length === 0 ? (
                <p className="text-sm text-[#5C1A1B] italic opacity-70">Nothing planned yet. Assign a look to this date.</p>
              ) : (
                <div className="space-y-4">
                  {selectedPlans.map(plan => {
                    const outfit = outfits.find(o => String(o.id) === String(plan.outfit_id));
                    return (
                      <div key={`${plan.date}-${plan.outfit_id}`} className="flex items-start gap-4 rounded-xl bg-[#FDFBF7] border border-[#3B1011]/5 p-4 shadow-sm group hover:border-[#7B2C2D]/30 transition-colors">
                        <div className="rounded-lg bg-[#EADDC5]/40 p-2 text-[#7B2C2D] shrink-0">
                          <Shirt size={20} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-serif font-bold text-lg text-[#3B1011] truncate">{outfit?.name ?? 'Archived Outfit'}</p>
                          {plan.description && <p className="text-xs text-[#5C1A1B] mt-1 italic">{plan.description}</p>}
                          <p className="text-[9px] font-bold tracking-widest uppercase text-[#5C1A1B]/60 mt-2">
                            {outfit?.occasion?.replace(/-/g, ' ') ?? 'Ensemble'}
                          </p>
                        </div>
                        <button type="button" onClick={() => removePlan(plan)} aria-label={`Remove ${outfit?.name ?? 'planned outfit'}`} className="p-2 text-[#3B1011]/30 hover:text-[#7B2C2D] hover:bg-[#EADDC5]/50 rounded-full transition-colors shrink-0 opacity-0 group-hover:opacity-100">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

          </aside>
        </div>
      </div>
    </div>
  );
}