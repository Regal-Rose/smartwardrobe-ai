import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Heart, Shirt, Sparkles, WandSparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useServices } from '../app/ServiceProvider';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import type { Garment, Occasion, Outfit, OutfitItem, Season, StyleType } from '../types';

const occasions: Occasion[] = ['everyday', 'college', 'casual', 'work', 'party', 'festive', 'wedding', 'travel'];
const seasons: Season[] = ['all-season', 'summer', 'winter', 'spring', 'autumn'];
const styles: StyleType[] = ['western', 'indian', 'fusion'];

function roleFor(g: Garment): OutfitItem['role'] {
  if (g.category === 'footwear') return 'footwear';
  if (g.category === 'accessories') return 'accessory';
  if (g.category === 'outerwear') return 'layer';
  if (g.category === 'dresses' || g.subcategory === 'saree' || g.subcategory === 'lehenga') return 'dress';
  if (g.category === 'indian-ethnic' || g.category === 'fusion') return g.subcategory === 'dupatta' || g.subcategory === 'salwar' || g.subcategory === 'churidar' || g.subcategory === 'leggings' ? 'ethnic-complement' : 'ethnic-base';
  return g.category === 'bottoms' ? 'bottom' : 'top';
}

export function OutfitBuilderPage() {
  const { garmentRepo, outfitRepo } = useServices();
  const [garments, setGarments] = useState<Garment[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState('My custom look');
  const [occasion, setOccasion] = useState<Occasion>('everyday');
  const [season, setSeason] = useState<Season>('all-season');
  const [style, setStyle] = useState<StyleType>('western');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => { let active = true; garmentRepo.list().then(items => { if (active) setGarments(items); }).catch(() => { if (active) setError('Could not load your wardrobe. Please try again.'); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [garmentRepo]);
  const chosen = useMemo(() => selected.map(id => garments.find(g => g.id === id)).filter((g): g is Garment => Boolean(g)), [selected, garments]);
  const toggle = (id: string) => { setSaved(false); setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); };

  const saveOutfit = async () => {
    if (chosen.length < 2) { setError('Choose at least 2 clothing items to build an outfit.'); return; }
    if (!name.trim()) { setError('Give your outfit a name first.'); return; }
    setSaving(true); setError('');
    const outfit: Outfit = { id: `custom-${Date.now()}`, name: name.trim(), items: chosen.map(g => ({ garmentId: g.id, role: roleFor(g) })), occasion, season, style, dateCreated: new Date().toISOString(), isSaved: true };
    try { await outfitRepo.save(outfit); setSaved(true); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not save this outfit. Please try again.'); }
    finally { setSaving(false); }
  };

  return <div className="space-y-6">
    <div className="flex items-center gap-3"><Link to="/wardrobe" className="rounded-full border border-border-light p-2 text-ink-muted hover:text-ink" aria-label="Back to wardrobe"><ArrowLeft size={17}/></Link><div><p className="text-xs uppercase tracking-[.18em] text-ink-muted">Create your own look</p><h1 className="heading-editorial-lg text-ink">Outfit Builder</h1><p className="text-body mt-1">Mix pieces you already own. Your style, your rules.</p></div></div>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
    {saved && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex items-center gap-2"><Check size={16}/> Outfit saved! Find it in <Link className="underline font-semibold" to="/saved">Saved Looks</Link>.</div>}
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="rounded-2xl border border-border-light bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5"><div><h2 className="text-lg font-semibold text-ink">Your wardrobe</h2><p className="text-sm text-ink-muted mt-1">Select the pieces you want to wear together.</p></div><Badge variant="sage">{`${selected.length} selected`}</Badge></div>
        {loading ? <p className="py-12 text-center text-ink-muted">Loading your clothes…</p> : garments.length === 0 ? <div className="py-12 text-center"><Shirt size={30} className="mx-auto mb-3 text-ink-muted"/><p className="font-medium text-ink">Your wardrobe is empty</p><p className="text-sm text-ink-muted mt-1">Add some clothes before creating a look.</p><Link to="/wardrobe" className="inline-block mt-4"><Button>Add clothes</Button></Link></div> : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">{garments.map(g => { const active = selected.includes(g.id); return <button type="button" key={g.id} onClick={() => toggle(g.id)} aria-pressed={active} className={`group text-left rounded-xl overflow-hidden border transition-all ${active ? 'border-sage-deep ring-2 ring-sage/30 bg-sage/5' : 'border-border-light hover:border-sage/60'}`}><div className="relative aspect-[4/5] bg-ivory-warm"><img src={g.imageUrl} alt={g.name} className="w-full h-full object-cover" loading="lazy" onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0'; }}/><span className={`absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full ${active ? 'bg-sage-deep text-white' : 'bg-white/90 text-ink-muted border border-border-light'}`}>{active ? <Check size={14}/> : <span className="text-xs">+</span>}</span></div><div className="p-3"><p className="text-sm font-medium text-ink truncate">{g.name}</p><p className="text-xs text-ink-muted mt-1 capitalize">{g.category.replace(/-/g, ' ')}</p></div></button>; })}</div>}
      </section>
      <aside className="space-y-4">
        <section className="rounded-2xl border border-border-light bg-surface p-5"><div className="flex items-center gap-2 mb-4"><Sparkles size={18} className="text-sage-deep"/><h2 className="font-semibold text-ink">Your outfit</h2></div>
          {chosen.length === 0 ? <div className="rounded-xl border border-dashed border-border-light py-8 px-4 text-center"><WandSparkles size={26} className="mx-auto text-ink-muted mb-2"/><p className="text-sm text-ink-muted">Select clothes to see your look take shape.</p></div> : <div className="grid grid-cols-3 gap-2">{chosen.map(g => <div key={g.id} className="relative"><div className="aspect-[3/4] rounded-lg overflow-hidden bg-ivory-warm"><img src={g.imageUrl} alt={g.name} className="w-full h-full object-cover"/></div><button type="button" onClick={() => toggle(g.id)} aria-label={`Remove ${g.name}`} className="absolute -top-1.5 -right-1.5 rounded-full bg-white border border-border-light w-6 h-6 text-ink">×</button><p className="text-[11px] text-ink-muted mt-1 truncate">{g.name}</p></div>)}</div>}
          <label className="block text-xs font-medium text-ink mt-5 mb-1.5" htmlFor="outfit-name">Outfit name</label><input id="outfit-name" value={name} onChange={e => setName(e.target.value)} maxLength={70} className="w-full rounded-lg border border-border-light bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-sage-deep" placeholder="e.g. Everyday favourite"/>
          <label className="block text-xs font-medium text-ink mt-4 mb-1.5" htmlFor="outfit-occasion">Occasion</label><select id="outfit-occasion" value={occasion} onChange={e => setOccasion(e.target.value as Occasion)} className="w-full rounded-lg border border-border-light bg-white px-3 py-2.5 text-sm text-ink">{occasions.map(o => <option key={o} value={o}>{o.replace(/-/g, ' ')}</option>)}</select>
          <label className="block text-xs font-medium text-ink mt-4 mb-1.5" htmlFor="outfit-season">Season</label><select id="outfit-season" value={season} onChange={e => setSeason(e.target.value as Season)} className="w-full rounded-lg border border-border-light bg-white px-3 py-2.5 text-sm text-ink">{seasons.map(s => <option key={s} value={s}>{s.replace(/-/g, ' ')}</option>)}</select>
          <label className="block text-xs font-medium text-ink mt-4 mb-1.5" htmlFor="outfit-style">Style</label><select id="outfit-style" value={style} onChange={e => setStyle(e.target.value as StyleType)} className="w-full rounded-lg border border-border-light bg-white px-3 py-2.5 text-sm text-ink">{styles.map(s => <option key={s} value={s}>{s}</option>)}</select>
          <Button onClick={saveOutfit} disabled={saving || loading || chosen.length < 2} className="w-full mt-5"><Heart size={16}/>{saving ? 'Saving…' : 'Save outfit'}</Button>
          <p className="text-[11px] leading-relaxed text-ink-muted mt-3">Choose at least two pieces. Your outfit is saved through the app's existing outfit service.</p>
        </section>
      </aside>
    </div>
  </div>;
}
