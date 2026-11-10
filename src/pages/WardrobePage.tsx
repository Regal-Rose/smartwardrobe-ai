import { useState } from 'react';
import { Plus, Search, Grid3X3, GalleryHorizontalEnd, X, SlidersHorizontal } from 'lucide-react';
import { useWardrobe } from '../hooks/useWardrobe';

import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/ui/EmptyState';
import { GarmentGrid } from '../components/wardrobe/GarmentGrid';
import { GarmentRail } from '../components/wardrobe/GarmentRail';
import { GarmentDetail } from '../components/wardrobe/GarmentDetail';
import { AddClothesModal } from '../components/wardrobe/AddClothesModal';
import {
  CATEGORIES,
  STYLE_LABELS,
  COLOR_LABELS,
  SEASON_LABELS,
  type StyleType,
  type GarmentColor,
  type Season,
  type GarmentCategory,
} from '../types';

export function WardrobePage() {
  const wardrobe = useWardrobe();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const categoryOptions = CATEGORIES.map((c) => ({
    value: c.value,
    label: c.label,
  }));

  const styleOptions = [
    { value: 'all', label: 'All Styles' },
    ...Object.entries(STYLE_LABELS).map(([k, v]) => ({ value: k, label: v })),
  ];

  const colorOptions = [
    { value: 'all', label: 'All Colours' },
    ...Object.entries(COLOR_LABELS).map(([k, v]) => ({ value: k, label: v })),
  ];

  const seasonOptions = [
    { value: 'all', label: 'All Seasons' },
    ...Object.entries(SEASON_LABELS).map(([k, v]) => ({ value: k, label: v })),
  ];

  const sortOptions = [
    { value: 'recently-added', label: 'Recently Added' },
    { value: 'alphabetical', label: 'Alphabetical' },
    { value: 'category', label: 'By Category' },
  ];

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
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />

      {/* Floating 3D Textured Background Elements */}
      <div className="noise-overlay z-0"></div>

      <img
        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop"
        alt="3D Texture"
        className="absolute -top-32 -right-32 w-[500px] h-[500px] object-cover rounded-full opacity-[0.05] mix-blend-multiply animate-float-slow pointer-events-none blur-[2px]"
      />

      <img
        src="https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=600&auto=format&fit=crop"
        alt="3D Texture"
        className="absolute -bottom-40 -left-20 w-[600px] h-[600px] object-cover rounded-full opacity-[0.04] mix-blend-multiply animate-float-slower pointer-events-none blur-[1px]"
      />

      <div className="relative z-10 flex flex-col h-full p-8 lg:p-12 overflow-y-auto hide-scrollbar">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7B2C2D] mb-3">
              A COLLECTION OF YOUR OWN
            </p>
            <h1 className="font-serif text-5xl lg:text-6xl font-bold text-[#3B1011] tracking-tight">
              My wardrobe<span className="text-[#7B2C2D]">.</span>
            </h1>
            <p className="text-sm font-medium text-[#5C1A1B] mt-4 opacity-80">
              {wardrobe.totalCount > 0
                ? `${wardrobe.totalCount} piece${wardrobe.totalCount !== 1 ? 's' : ''} in your archive.`
                : 'A curated archive of everything you love to wear.'}
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            id="add-clothes-button"
            className="bg-[#3B1011] text-[#FDFBF7] px-6 py-3.5 rounded-sm flex items-center justify-center gap-2 hover:bg-[#5C1A1B] transition-all duration-300 shadow-lg border border-[#3B1011] shrink-0"
          >
            <Plus size={16} />
            <span className="text-xs font-bold tracking-[0.15em] uppercase">Add Clothes</span>
          </button>
        </div>

        {/* Search & controls bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">

          {/* Search */}
          <div className="relative flex-1 max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#3B1011]/40" />
            </div>
            <input
              type="search"
              placeholder="Search garments..."
              value={wardrobe.filters.search || ''}
              onChange={(e) => wardrobe.updateFilters({ search: e.target.value })}
              className="block w-full pl-11 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-[#3B1011]/10 text-[#3B1011] focus:outline-none focus:border-[#7B2C2D] focus:ring-1 focus:ring-[#7B2C2D] transition-all rounded-xl shadow-sm placeholder:text-[#3B1011]/40"
              id="wardrobe-search"
              aria-label="Search garments"
            />
          </div>

          {/* View toggle + filter toggle */}
          <div className="flex items-center gap-3">
            <div className="flex bg-white/60 backdrop-blur-sm border border-[#3B1011]/10 rounded-xl p-1 shadow-sm">
              <button
                type="button"
                onClick={() => wardrobe.setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${wardrobe.viewMode === 'grid'
                  ? 'bg-[#EADDC5] text-[#3B1011]'
                  : 'text-[#3B1011]/40 hover:text-[#3B1011]'
                  }`}
                aria-label="Grid view"
                id="grid-view-button"
              >
                <Grid3X3 size={18} />
              </button>
              <button
                type="button"
                onClick={() => wardrobe.setViewMode('rail')}
                className={`p-2 rounded-lg transition-colors ${wardrobe.viewMode === 'rail'
                  ? 'bg-[#EADDC5] text-[#3B1011]'
                  : 'text-[#3B1011]/40 hover:text-[#3B1011]'
                  }`}
                aria-label="Rail view"
                id="rail-view-button"
              >
                <GalleryHorizontalEnd size={18} />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              id="toggle-filters-button"
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all shadow-sm text-xs font-bold tracking-wider uppercase ${showFilters || wardrobe.hasActiveFilters
                ? 'bg-[#3B1011] text-[#FDFBF7] border border-[#3B1011]'
                : 'bg-white/60 backdrop-blur-sm border border-[#3B1011]/10 text-[#3B1011] hover:bg-[#EADDC5] hover:border-[#3B1011]/20'
                }`}
            >
              <SlidersHorizontal size={14} />
              Filters
            </button>

            {wardrobe.hasActiveFilters && (
              <button
                onClick={wardrobe.clearFilters}
                id="clear-filters-button"
                className="flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-[#EADDC5] transition-colors text-xs font-bold tracking-wider uppercase text-[#7B2C2D] border border-transparent hover:border-[#7B2C2D]/30"
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-5 gap-4 p-6 bg-white/60 backdrop-blur-md rounded-2xl border border-[#3B1011]/10 shadow-sm animate-[slideUp_0.2s_ease-out] mb-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest uppercase text-[#5C1A1B]">Category</label>
              <Select
                options={categoryOptions}
                value={wardrobe.filters.category || 'all'}
                onChange={(e) => wardrobe.updateFilters({ category: e.target.value as GarmentCategory | 'all' })}
                id="filter-category"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest uppercase text-[#5C1A1B]">Style</label>
              <Select
                options={styleOptions}
                value={wardrobe.filters.style || 'all'}
                onChange={(e) => wardrobe.updateFilters({ style: e.target.value as StyleType | 'all' })}
                id="filter-style"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest uppercase text-[#5C1A1B]">Colour</label>
              <Select
                options={colorOptions}
                value={wardrobe.filters.color || 'all'}
                onChange={(e) => wardrobe.updateFilters({ color: e.target.value as GarmentColor | 'all' })}
                id="filter-color"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest uppercase text-[#5C1A1B]">Season</label>
              <Select
                options={seasonOptions}
                value={wardrobe.filters.season || 'all'}
                onChange={(e) => wardrobe.updateFilters({ season: e.target.value as Season | 'all' })}
                id="filter-season"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest uppercase text-[#5C1A1B]">Sort By</label>
              <Select
                options={sortOptions}
                value={wardrobe.filters.sort || 'recently-added'}
                onChange={(e) => wardrobe.updateFilters({ sort: e.target.value as 'recently-added' | 'alphabetical' | 'category' })}
                id="filter-sort"
              />
            </div>
          </div>
        )}

        {/* Category quick-filters */}
        <div className="mb-8 border-b border-[#3B1011]/10">
          <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#3B1011]/40 mb-3">Browse your pieces</p>
          <div className="flex gap-8 overflow-x-auto hide-scrollbar pb-px">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => wardrobe.updateFilters({ category: cat.value })}
                className={`pb-4 text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-colors relative ${wardrobe.filters.category === cat.value
                  ? 'text-[#3B1011]'
                  : 'text-[#3B1011]/40 hover:text-[#7B2C2D]'
                  }`}
                id={`category-${cat.value}`}
              >
                {cat.label}
                {wardrobe.filters.category === cat.value && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#3B1011]"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1">
          {wardrobe.loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[3/4] rounded-xl bg-[#EADDC5]/20 animate-pulse border border-[#3B1011]/5" />
                  <div className="h-4 w-3/4 rounded bg-[#3B1011]/10 animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-[#3B1011]/5 animate-pulse" />
                </div>
              ))}
            </div>
          ) : wardrobe.error ? (
            <div className="bg-white/60 backdrop-blur-sm border border-[#3B1011]/10 rounded-2xl p-12 text-center">
              <EmptyState
                title="Something went wrong"
                description={wardrobe.error}
                action={
                  <button onClick={wardrobe.refresh} className="text-xs font-bold tracking-widest uppercase text-[#7B2C2D] border-b border-[#7B2C2D] pb-1 hover:text-[#3B1011] transition-colors">
                    Try Again
                  </button>
                }
              />
            </div>
          ) : wardrobe.garments.length === 0 && !wardrobe.hasActiveFilters ? (
            <div className="bg-white/60 backdrop-blur-sm border border-[#3B1011]/10 rounded-2xl p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-[#EADDC5]/30 rounded-full flex items-center justify-center mb-4">
                <Plus size={24} className="text-[#3B1011]/50" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#3B1011] mb-2">Your archive is empty</h3>
              <p className="text-[#5C1A1B] text-sm max-w-md mx-auto mb-6">
                Add your first garment to start building your digital wardrobe and discovering outfit combinations.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[#3B1011] text-[#FDFBF7] px-6 py-3 rounded-sm flex items-center gap-2 hover:bg-[#5C1A1B] transition-all shadow-md"
              >
                <Plus size={16} /> <span className="text-xs font-bold tracking-widest uppercase">Add First Piece</span>
              </button>
            </div>
          ) : wardrobe.garments.length === 0 && wardrobe.hasActiveFilters ? (
            <div className="bg-white/60 backdrop-blur-sm border border-[#3B1011]/10 rounded-2xl p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-[#EADDC5]/30 rounded-full flex items-center justify-center mb-4">
                <Search size={24} className="text-[#3B1011]/50" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#3B1011] mb-2">No matches found</h3>
              <p className="text-[#5C1A1B] text-sm max-w-md mx-auto mb-6">
                Try adjusting your filters or search query to find what you're looking for.
              </p>
              <button
                onClick={wardrobe.clearFilters}
                className="text-xs font-bold tracking-widest uppercase text-[#7B2C2D] border-b border-[#7B2C2D] pb-1 hover:text-[#3B1011] transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : wardrobe.viewMode === 'grid' ? (
            <GarmentGrid
              garments={wardrobe.garments}
              onSelect={wardrobe.setSelectedGarment}
            />
          ) : (
            <GarmentRail
              garments={wardrobe.garments}
              onSelect={wardrobe.setSelectedGarment}
            />
          )}
        </div>

      </div>

      {/* Modals & Detail Overlays */}
      {wardrobe.selectedGarment && (
        <GarmentDetail
          garment={wardrobe.selectedGarment}
          onClose={() => wardrobe.setSelectedGarment(null)}
          onUpdate={wardrobe.updateGarment}
          onDelete={wardrobe.deleteGarment}
        />
      )}

      <AddClothesModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={async (input) => { await wardrobe.addGarment(input); }}
      />
    </div>
  );
}