import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2, CalendarCheck2, Shirt, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useServices } from '../app/ServiceProvider';
import { Button } from '../components/ui/Button';
import type { Outfit } from '../types';

// Updated to match your FastAPI Pydantic backend model
type PlannedOutfit = { id?: number; date: string; outfit_id: number; description: string };

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

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
        const res = await fetch(`http://localhost:8000/api/planner/${monthStr}`);
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
      const res = await fetch("http://localhost:8000/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Fetch the updated plans to ensure we have the new database ID for deletion
        const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
        const refreshRes = await fetch(`http://localhost:8000/api/planner/${monthStr}`);
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
    // If the plan has a database ID, delete it from the backend
    if (plan.id) {
      try {
        const response = await fetch(`http://localhost:8000/api/planner/${plan.id}`, {
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

    // Remove it from the UI state
    setPlans(prev => prev.filter(p => !(p.date === plan.date && p.outfit_id === plan.outfit_id)));
    setSuccess('Planned outfit permanently removed.');
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[.18em] text-ink-muted">Plan ahead, get dressed with ease</p>
          <h1 className="heading-editorial-lg text-ink">Outfit Planner</h1>
          <p className="text-body mt-1">A little planning. A lot less “what should I wear?”</p>
        </div>
        <Link to="/saved"><Button variant="secondary"><Sparkles size={16} /> Browse saved looks</Button></Link>
      </div>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
      {success && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{success}</div>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-2xl border border-border-light bg-surface p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded-full border border-border-light p-2 hover:bg-ivory" aria-label="Previous month"><ChevronLeft size={18} /></button>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-ink">{monthNames[month.getMonth()]} {month.getFullYear()}</h2>
              <button type="button" onClick={() => { const now = new Date(); setMonth(new Date(now.getFullYear(), now.getMonth(), 1)); setSelectedDate(dateKey(now)); }} className="text-xs text-sage-deep underline underline-offset-2 mt-1">Today</button>
            </div>
            <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded-full border border-border-light p-2 hover:bg-ivory" aria-label="Next month"><ChevronRight size={18} /></button>
          </div>
          <div className="grid grid-cols-7 mb-2">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="py-2 text-center text-[11px] sm:text-xs uppercase tracking-wider text-ink-muted">{day}</div>)}</div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {days.map((cell, i) => {
              const hasPlan = cell ? plans.some(p => p.date === cell.date) : false;
              const isSelected = cell?.date === selectedDate;
              const isToday = cell?.date === dateKey(new Date());
              return (
                <button key={cell?.date ?? `blank-${i}`} type="button" disabled={!cell} onClick={() => cell && (setSelectedDate(cell.date), setError(''), setSuccess(''))} className={`relative min-h-[54px] sm:min-h-[82px] rounded-xl p-1 sm:p-2 text-sm transition-colors ${!cell ? 'cursor-default' : isSelected ? 'bg-sage-deep text-white' : 'bg-ivory-warm hover:bg-sage/20 text-ink'} ${isToday && !isSelected ? 'ring-1 ring-sage-deep' : ''}`}>
                  <span className="font-medium">{cell?.day ?? ''}</span>
                  {hasPlan && <span className={`absolute bottom-2 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-sage-deep'}`} />}
                  {cell && plans.filter(p => p.date === cell.date).length > 1 && <span className={`absolute top-1 right-1 text-[9px] ${isSelected ? 'text-white/80' : 'text-sage-deep'}`}>{plans.filter(p => p.date === cell.date).length}</span>}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-ink-muted"><span className="h-2 w-2 rounded-full bg-sage-deep" /> Planned outfit <span className="ml-auto">Select a date to plan your look</span></div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border-light bg-surface p-5">
            <div className="flex items-center gap-2 mb-1"><CalendarDays size={18} className="text-sage-deep" /><h2 className="font-semibold text-ink">Plan your day</h2></div>
            <p className="text-sm text-ink-muted mb-4">{formatDate(selectedDate)}</p>
            {loading ? <p className="py-5 text-sm text-ink-muted">Loading saved looks…</p> : outfits.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border-light p-5 text-center">
                <Shirt size={25} className="mx-auto text-ink-muted mb-2" />
                <p className="text-sm font-medium text-ink">No saved outfits yet</p>
                <p className="text-xs text-ink-muted mt-1">Build and save a look before planning it.</p>
                <Link to="/builder" className="inline-block mt-3"><Button><Plus size={15} /> Create an outfit</Button></Link>
              </div>
            ) : (
              <>
                <label htmlFor="planner-outfit" className="block text-xs font-medium text-ink mb-1.5">Saved outfit</label>
                <select id="planner-outfit" value={outfitId} onChange={e => setOutfitId(e.target.value)} className="w-full rounded-lg border border-border-light bg-white px-3 py-2.5 text-sm text-ink">
                  <option value="">Choose a look…</option>
                  {outfits.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
                {selectedOutfit && (
                  <div className="mt-3 rounded-xl bg-ivory-warm p-3">
                    <p className="font-medium text-sm text-ink">{selectedOutfit.name}</p>
                    <p className="text-xs text-ink-muted mt-1 capitalize">{selectedOutfit.occasion.replace(/-/g, ' ')} · {selectedOutfit.items.length} pieces</p>
                  </div>
                )}
                <label htmlFor="planner-note" className="block text-xs font-medium text-ink mt-4 mb-1.5">Note (optional)</label>
                <input id="planner-note" value={note} onChange={e => setNote(e.target.value)} maxLength={120} placeholder="e.g. Pack a light jacket" className="w-full rounded-lg border border-border-light bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-sage-deep" />
                <Button onClick={addPlan} className="w-full mt-4"><CalendarCheck2 size={16} /> Add to calendar</Button>
              </>
            )}
          </section>

          <section className="rounded-2xl border border-border-light bg-surface p-5">
            <h2 className="font-semibold text-ink mb-3">Planned for this day <span className="text-ink-muted font-normal">({selectedPlans.length})</span></h2>
            {selectedPlans.length === 0 ? <p className="text-sm text-ink-muted py-3">Nothing planned yet. Pick a saved look above to get started.</p> : (
              <div className="space-y-3">
                {selectedPlans.map(plan => {
                  // Convert both to strings to ensure they match correctly
                  const outfit = outfits.find(o => String(o.id) === String(plan.outfit_id));
                  return (
                    <div key={`${plan.date}-${plan.outfit_id}`} className="flex items-start gap-3 rounded-xl bg-ivory-warm p-3">
                      <div className="rounded-lg bg-white p-2 text-sage-deep"><Shirt size={18} /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{outfit?.name ?? 'Saved outfit'}</p>
                        {plan.description && <p className="text-xs text-ink-muted mt-1">{plan.description}</p>}
                        <p className="text-[11px] text-ink-muted mt-1 capitalize">{outfit?.occasion?.replace(/-/g, ' ') ?? 'Outfit'}</p>
                      </div>
                      <button type="button" onClick={() => removePlan(plan)} aria-label={`Remove ${outfit?.name ?? 'planned outfit'}`} className="p-1.5 text-ink-muted hover:text-red-600">
                        <Trash2 size={15} />
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
  );
}