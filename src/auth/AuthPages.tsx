import React, { useState } from 'react';
import { ArrowRight, Lock, Mail, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- SHARED AUTH LOGIC ---
axios.defaults.withCredentials = true;

// FIX: Use Vercel backend URL if it exists, otherwise use localhost for local testing
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_URL = `${BASE_URL}/api/v1`;

export const checkSession = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/me`);
    return response.data;
  } catch (error) {
    return null;
  }
};

// --- 1. THE LANDING PAGE (YOUR EXACT DESIGN, WIRED UP) ---
const garments = [
  {
    id: 'SW-01',
    module: 'DISCOVER ENGINE',
    name: 'Discover: Sartorial Horizon & Trend Synthesis',
    gsm: 'NEURAL CURATION · GLOBAL RUNWAY TELEMETRY',
    price: '99.8% ALIGN',
    match: '99.8% TASTE ALIGNMENT',
    tag: 'AESTHETIC DISCOVERY',
    verdict: '"True style begins with educated curiosity. The Discover Engine decodes global runway shifts, archival silhouettes, and subcultural movements—filtering out fleeting noise to surface rare garments that resonate with your personal proportions and evolving aesthetic identity."',
    spec1Label: 'SYSTEM SPEC // LATENCY',
    spec1Value: '12ms Vector Index',
    spec2Label: 'INTELLIGENCE DEPTH',
    spec2Value: '40K+ Archival & Emerging Nodes'
  },
  {
    id: 'SW-02',
    module: 'VIRTUAL TRY-ON',
    name: 'Virtual Try-On: 3D Drape & Silhouette Physics',
    gsm: 'CLOTHSIM V4 · BIOMETRIC PROPORTION MAPPING',
    price: '99.4% FIT',
    match: '99.4% FIT PRECISION',
    tag: 'BIOMETRIC DRAPE',
    verdict: '"A garment only comes alive when it meets movement. Using millimeter-accurate 3D mesh reconstruction and real-time fabric tension physics, the Try-On studio lets you witness how 340GSM wool drapes across your shoulders or how raw linen catches the stride before a single thread touches your skin."',
    spec1Label: 'SYSTEM SPEC // MESH DENSITY',
    spec1Value: '120K Polygons',
    spec2Label: 'PHYSICS ENGINE',
    spec2Value: 'Real-Time Shear & Drape Tension'
  },
  {
    id: 'SW-03',
    module: 'WEATHER SYNC',
    name: 'Weather Section: Atmospheric & Thermal Intelligence',
    gsm: 'BAROMETRIC SYNC · MICRO-CLIMATE WEAVE MATCH',
    price: 'LIVE METEO',
    match: 'REAL-TIME METEOROLOGY',
    tag: 'THERMAL EQUILIBRIUM',
    verdict: '"Dressing well is an art of harmony with the elements. By cross-referencing hyper-local barometric pressure, humidity, and wind-chill against fabric GSM weight and weave breathability, the Weather module ensures effortless poise—whether stepping into a crisp 14°C morning mist or a golden-hour breeze."',
    spec1Label: 'SYSTEM SPEC // FABRIC METRIC',
    spec1Value: '150–450 GSM Sync',
    spec2Label: 'THERMAL ZONE',
    spec2Value: 'Dynamic -5°C to 34°C Adaptation'
  },
  {
    id: 'SW-04',
    module: 'LOOKBOOK ARCHIVE',
    name: 'Lookbook: Living Editorial & Capsule Taxonomy',
    gsm: 'VISUAL TAXONOMY · HIGH-CONTRAST ARCHIVING',
    price: 'INFINITE',
    match: 'INFINITE COMBINATIONS',
    tag: 'EDITORIAL DOSSIER',
    verdict: '"A great wardrobe is not a collection of isolated pieces, but an interconnected gallery of self-expression. The Lookbook transforms your closet into a curated fashion house monograph—cataloging tonal harmonies, texture juxtapositions, and signature ensembles with the reverence of a print editorial."',
    spec1Label: 'SYSTEM SPEC // COLOR HARMONY',
    spec1Value: 'CIE-LAB Delta-E',
    spec2Label: 'ARCHIVE MODE',
    spec2Value: 'Multi-Season Capsule Indexing'
  },
  {
    id: 'SW-05',
    module: 'DAY-DATE PLANNER',
    name: 'Day-Date Calendar: Intentional Chronological Styling',
    gsm: 'CHRONO-STYLING · EVENT & ROTATION LOGIC',
    price: '30-DAY SYNC',
    match: 'ZERO OUTFIT FATIGUE',
    tag: 'TEMPORAL CURATION',
    verdict: '"Time is the ultimate luxury, and anticipation is part of the ritual of dressing. The Day-Date Calendar harmonizes your social itinerary, travel schedule, and garment rest cycles—choreographing bespoke ensembles weeks in advance so you arrive at every occasion with unhurried confidence."',
    spec1Label: 'SYSTEM SPEC // ROTATION LOGIC',
    spec1Value: 'Anti-Repeat Cadence',
    spec2Label: 'CALENDAR SYNC',
    spec2Value: '30-Day Horizon & Occasion Weighting'
  },
];

export function LandingPage() {
  const [activeGarment, setActiveGarment] = useState(0);
  const garment = garments[activeGarment];
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EBD9] text-[#3B1011] font-sans selection:bg-[#7B2C2D] selection:text-[#F4EBD9]">
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap');
        
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        
        .ticker-wrap {
          width: 100%;
          overflow: hidden;
          background-color: #3B1011;
          color: #F4EBD9;
          padding: 0.75rem 0;
          border-top: 1px solid rgba(244, 235, 217, 0.2);
          border-bottom: 1px solid rgba(244, 235, 217, 0.2);
        }
        
        .ticker {
          display: inline-block;
          white-space: nowrap;
          padding-right: 100%;
          box-sizing: content-box;
          animation: ticker 40s linear infinite;
        }
        
        @keyframes ticker {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); }
        }

        .pulse-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid #5C1A1B;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0; transform: translate(-50%, -50%) scale(2); }
        }

        .cloud {
          position: absolute;
          background: rgba(244, 235, 217, 0.15);
          border-radius: 50px;
          animation: drift linear infinite;
        }
        
        .cloud::before, .cloud::after {
          content: '';
          position: absolute;
          background: rgba(244, 235, 217, 0.15);
          border-radius: 50%;
        }

        @keyframes drift {
          from { transform: translateX(-100%); }
          to { transform: translateX(100vw); }
        }
        
        .sun {
          position: absolute;
          width: 60px;
          height: 60px;
          background: radial-gradient(circle, rgba(244, 235, 217, 0.4) 0%, rgba(244, 235, 217, 0) 70%);
          border-radius: 50%;
          top: 20%;
          right: 20%;
          animation: glow 4s ease-in-out infinite alternate;
        }

        @keyframes glow {
          from { transform: scale(1); opacity: 0.6; }
          to { transform: scale(1.2); opacity: 0.9; }
        }

        .noise-bg {
          position: absolute;
          inset: 0;
          opacity: 0.08;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-up-1 { animation: fadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 0.2s; opacity: 0; }
        .animate-fade-up-2 { animation: fadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 0.5s; opacity: 0; }
        .animate-fade-up-3 { animation: fadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 0.8s; opacity: 0; }

        .spin-orbit-1 { animation: spin 12s linear infinite; transform-origin: center; }
        .spin-orbit-2 { animation: spin 20s linear infinite reverse; transform-origin: center; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />

      {/* SECTION 01: HERO */}
      <div className="min-h-screen flex flex-col relative px-6 md:px-12 pt-8 pb-12 border-b border-[#3B1011]/20 overflow-hidden">
        {/* Navigation */}
        <nav className="flex justify-between items-center z-20 mb-12 md:mb-20 border-b border-[#3B1011]/10 pb-6">
          <div className="text-xs font-semibold tracking-[0.2em] text-[#3B1011]">SMARTWARDROBE</div>
          <div className="hidden md:flex items-center space-x-10 tracking-widest text-xs font-semibold text-[#3B1011]">
            <button onClick={() => scrollTo('how-it-works')} className="hover:text-[#7B2C2D] transition-colors cursor-pointer uppercase tracking-[0.2em]">HOW ITS WORK</button>
            <button onClick={() => scrollTo('contact')} className="hover:text-[#7B2C2D] transition-colors cursor-pointer uppercase tracking-[0.2em]">CONTACT</button>
            <button onClick={() => navigate('/login')} className="hover:text-[#7B2C2D] transition-colors cursor-pointer uppercase tracking-[0.2em]">LOGIN</button>
            <button onClick={() => navigate('/register')} className="bg-[#3B1011] text-[#F4EBD9] px-6 py-3 rounded-sm transition-all duration-300 hover:bg-[#5C1A1B] hover:scale-105 cursor-pointer uppercase tracking-[0.2em] shadow-md border border-[#3B1011]">
              BUILD MY WARDROBE
            </button>
          </div>
          <div className="md:hidden font-semibold text-[#3B1011]">MENU</div>
        </nav>

        {/* Hero Content */}
        <div className="flex-grow flex flex-col justify-center relative">
          {/* Giant Title */}
          <h1 className="text-[14vw] leading-[0.8] font-bold tracking-tighter uppercase z-0 text-[#3B1011] absolute top-0 left-0 w-full text-center opacity-90">
            Smart<br />Wardrobe
          </h1>

          {/* 4 Overlapping Hero Images */}
          <div className="relative z-10 mt-[20vh] md:mt-[30vh] grid grid-cols-2 md:grid-cols-4 gap-4 px-4 pb-8">

            {/* Image 1 */}
            <div className="relative h-[300px] md:h-[450px] overflow-hidden group cursor-pointer border border-[#3B1011]/20 bg-[#EADDC5] shadow-xl">
              <div className="absolute inset-0 bg-[#3B1011] opacity-40 mix-blend-multiply transition-opacity duration-700 group-hover:opacity-0 z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800"
                alt="Model 1"
                className="w-full h-full object-cover object-center transition-all duration-700 grayscale sepia-[0.4] group-hover:grayscale-0 group-hover:sepia-0 group-hover:scale-110"
              />
            </div>

            {/* Image 2 */}
            <div className="relative h-[300px] md:h-[450px] overflow-hidden group cursor-pointer border border-[#3B1011]/20 bg-[#EADDC5] shadow-xl md:mt-16">
              <div className="absolute inset-0 bg-[#3B1011] opacity-40 mix-blend-multiply transition-opacity duration-700 group-hover:opacity-0 z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800"
                alt="Model 2"
                className="w-full h-full object-cover object-center transition-all duration-700 grayscale sepia-[0.4] group-hover:grayscale-0 group-hover:sepia-0 group-hover:scale-110"
              />
            </div>

            {/* Image 3 */}
            <div className="relative h-[300px] md:h-[450px] overflow-hidden group cursor-pointer border border-[#3B1011]/20 bg-[#EADDC5] shadow-xl">
              <div className="absolute inset-0 bg-[#3B1011] opacity-40 mix-blend-multiply transition-opacity duration-700 group-hover:opacity-0 z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800"
                alt="Model 3"
                className="w-full h-full object-cover object-center transition-all duration-700 grayscale sepia-[0.4] group-hover:grayscale-0 group-hover:sepia-0 group-hover:scale-110"
              />
            </div>

            {/* Image 4 */}
            <div className="relative h-[300px] md:h-[450px] overflow-hidden group cursor-pointer border border-[#3B1011]/20 bg-[#EADDC5] shadow-xl md:mt-16">
              <div className="absolute inset-0 bg-[#3B1011] opacity-40 mix-blend-multiply transition-opacity duration-700 group-hover:opacity-0 z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=800"
                alt="Model 4"
                className="w-full h-full object-cover object-center transition-all duration-700 grayscale sepia-[0.4] group-hover:grayscale-0 group-hover:sepia-0 group-hover:scale-110"
              />
            </div>

          </div>
        </div>

        {/* Hero Footer */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-end z-20 relative px-4">
          <div className="max-w-md mb-6 md:mb-0">
            <h2 className="text-xl font-bold tracking-tight mb-2 text-[#3B1011] uppercase">AI-DRIVEN / PERSONAL STYLING ARCHITECTURE</h2>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xs uppercase tracking-widest font-medium mb-4 max-w-xs md:ml-auto text-[#5C1A1B]">
              SmartWardrobe PROPOSES WELL-DEVELOPED, THOUGHTFUL CLOTHES WITH A DISCERNING POINT-OF-VIEW.
            </p>
            <button onClick={() => navigate('/register')} className="bg-[#3B1011] text-[#F4EBD9] px-6 py-3 text-xs tracking-widest font-semibold hover:bg-[#5C1A1B] transition-colors shadow-xl border border-[#3B1011]">
              Digitize Your Closet +
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 02: TICKER MARQUEE */}
      <div className="ticker-wrap border-y border-[#F4EBD9]/20">
        <div className="ticker text-xs font-semibold tracking-[0.3em] uppercase">
          EXPERIENCE FASHION THAT KNOWS NO BOUNDARIES &nbsp;&nbsp;|&nbsp;&nbsp; LIMITLESS STYLE WITH AI &nbsp;&nbsp;|&nbsp;&nbsp; CRAFTED FOR TRENDSETTERS EVERY DAY &nbsp;&nbsp;|&nbsp;&nbsp; ELEVATING PRESENCE &nbsp;&nbsp;|&nbsp;&nbsp; LIVING STYLISH &nbsp;&nbsp;|&nbsp;&nbsp; OUTFIT RECOMMENDATION &nbsp;&nbsp;|&nbsp;&nbsp; TREND PREDICTION &nbsp;&nbsp;|&nbsp;&nbsp; SMART SEARCH &nbsp;&nbsp;|&nbsp;&nbsp; STYLE GENERATOR &nbsp;&nbsp;|&nbsp;&nbsp; EXPERIENCE FASHION THAT KNOWS NO BOUNDARIES &nbsp;&nbsp;|&nbsp;&nbsp; LIMITLESS STYLE WITH AI
        </div>
      </div>

      {/* SECTION 04: THE PHYSICAL RACK [INTERACTIVE DASHBOARD] */}
      <div id="how-it-works" className="border-b border-[#3B1011]/20 bg-[#F4EBD9]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr]">

          {/* Left Pane: Interactive List */}
          <div className="bg-[#F4EBD9] flex flex-col border-r border-[#3B1011]/20">
            <div className="p-8 border-b border-[#3B1011]/20 flex justify-between items-center bg-[#EADDC5]">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-[#7B2C2D] rounded-full animate-pulse"></div>
                <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-[#3B1011]">THE INTELLIGENT RACK [05 MODULES]</h2>
              </div>
              <div className="text-[10px] tracking-widest text-[#5C1A1B] font-semibold text-right">CLICK TO<br />LEVITATE &rarr;</div>
            </div>

            <div className="p-8 flex-grow">
              <div className="w-full h-4 bg-gradient-to-r from-[#EADDC5] via-[#F4EBD9] to-[#EADDC5] rounded-full shadow-inner mb-6 border border-[#3B1011]/10"></div>

              <div className="flex flex-col gap-4">
                {garments.map((g, idx) => (
                  <div
                    key={g.id}
                    onClick={() => setActiveGarment(idx)}
                    className={`p-5 border cursor-pointer flex justify-between items-center transition-all duration-300 ${activeGarment === idx
                      ? 'bg-[#EADDC5] border-[#7B2C2D] shadow-md transform scale-[1.02]'
                      : 'bg-transparent border-[#3B1011]/10 hover:border-[#5C1A1B]/50'
                      }`}
                  >
                    <div className="flex items-center gap-4 pr-3">
                      <div className={`w-12 h-12 shrink-0 flex flex-col items-center justify-center rounded border ${activeGarment === idx ? 'border-[#7B2C2D] bg-[#F4EBD9]' : 'border-[#3B1011]/20 bg-[#EADDC5]'}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke={activeGarment === idx ? '#7B2C2D' : '#5C1A1B'} strokeWidth="2" className="w-6 h-6 mb-1">
                          <path d="M12 2v4M8 10a4 4 0 0 1 8 0l4 8H4l4-8z" />
                          <path d="M12 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                        </svg>
                        <div className={`w-6 h-1 rounded-full ${activeGarment === idx ? 'bg-[#7B2C2D]' : 'bg-[#5C1A1B]'}`}></div>
                      </div>
                      <div>
                        <div className="text-[10px] tracking-widest text-[#5C1A1B] mb-1 font-semibold uppercase">NODE #{g.id} &nbsp;&middot;&nbsp; {g.module}</div>
                        <div className="font-serif font-semibold text-[#3B1011] text-base md:text-lg leading-snug">{g.name}</div>
                        <div className="text-[9px] tracking-[0.15em] text-[#7B2C2D] mt-1 font-medium uppercase">{g.gsm}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-[10px] tracking-wider font-bold text-[#7B2C2D] text-right">{g.price}</div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activeGarment === idx ? 'bg-[#7B2C2D] text-[#F4EBD9]' : 'border border-[#3B1011]/30 text-[#3B1011]'
                        }`}>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Pane: Holographic Projection */}
          <div className="bg-[#3B1011] p-8 md:p-12 flex flex-col relative overflow-hidden min-h-[700px]">
            <div className="noise-bg opacity-20"></div>

            {/* Header Info */}
            <div className="relative z-10 mb-8">
              <div className="text-[10px] tracking-widest text-[#EADDC5]/70 mb-3 uppercase">NEURAL HOLOGRAPHIC PROJECTION // {garment.gsm}</div>
              <h3 className="font-serif text-3xl md:text-5xl text-[#F4EBD9] mb-6 leading-tight">{garment.name}</h3>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-1.5 rounded-full border border-[#F4EBD9]/30 text-xs tracking-widest text-[#F4EBD9] bg-[#5C1A1B]/50">NODE #{garment.id} · {garment.module}</span>
                <span className="px-4 py-1.5 rounded-full bg-[#7B2C2D] text-xs tracking-widest text-[#F4EBD9] font-bold shadow-[0_0_15px_rgba(123,44,45,0.6)]">{garment.match}</span>
              </div>
            </div>

            {/* Hologram Graphic */}
            <div className="flex-grow flex items-center justify-center relative z-0 my-10">
              <div className="absolute w-[380px] h-[380px] flex items-center justify-center opacity-80">
                <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_25px_rgba(234,221,197,0.2)]">
                  {/* Orbital Lines */}
                  <ellipse cx="100" cy="100" rx="90" ry="25" fill="none" stroke="#7B2C2D" strokeWidth="1.5" className="spin-orbit-1" />
                  <ellipse cx="100" cy="100" rx="25" ry="90" fill="none" stroke="#EADDC5" strokeWidth="1" strokeDasharray="4 4" className="spin-orbit-2 opacity-50" />

                  {/* Glowing Base Rings */}
                  <circle cx="100" cy="100" r="70" fill="none" stroke="#5C1A1B" strokeWidth="0.5" />
                  <circle cx="100" cy="100" r="50" fill="none" stroke="#7B2C2D" strokeWidth="0.5" strokeDasharray="2 6" className="animate-spin-slow" />

                  {/* Vector Shirt Projection */}
                  <path d="M 70 50 L 130 50 L 160 90 L 140 100 L 130 80 L 130 150 L 70 150 L 70 80 L 60 100 L 40 90 Z" fill="#5C1A1B" stroke="#F4EBD9" strokeWidth="2" opacity="0.9" />
                  <path d="M 100 50 L 100 150" fill="none" stroke="#EADDC5" strokeWidth="1" opacity="0.6" />
                  <path d="M 80 50 L 100 80 L 120 50" fill="none" stroke="#EADDC5" strokeWidth="1" opacity="0.6" />

                  {/* Interactive Nodes */}
                  <circle cx="100" cy="80" r="3" fill="#F4EBD9" className="animate-pulse" />
                  <circle cx="85" cy="120" r="2" fill="#EADDC5" />
                  <circle cx="115" cy="130" r="2" fill="#EADDC5" />
                </svg>
              </div>

              {/* Floating Module Tag */}
              <div className="absolute top-[8%] left-[12%] bg-[#7B2C2D] text-[#F4EBD9] text-[9px] tracking-widest px-4 py-2 rounded-full border border-[#F4EBD9]/30 animate-pulse uppercase">
                {garment.tag}
              </div>
            </div>

            {/* Info Data Boxes */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-4 mt-auto">
              <div className="bg-[#5C1A1B]/50 border border-[#EADDC5]/20 p-6 rounded transition-all duration-500 hover:bg-[#5C1A1B]/80">
                <div className="text-[10px] tracking-widest text-[#EADDC5] opacity-80 font-bold mb-3 uppercase">SARTORIAL PHILOSOPHY & ARCHITECTURAL VERDICT</div>
                <p className="text-sm text-[#F4EBD9] leading-relaxed font-serif italic">{garment.verdict}</p>
              </div>
              <div className="bg-[#5C1A1B]/50 border border-[#EADDC5]/20 p-6 rounded transition-all duration-500 hover:bg-[#5C1A1B]/80 flex flex-col justify-center">
                <div className="text-[10px] tracking-widest text-[#EADDC5] opacity-80 font-bold mb-2 uppercase">{garment.spec1Label}</div>
                <div className="text-lg text-[#F4EBD9] font-serif leading-snug">{garment.spec1Value}</div>
              </div>
              <div className="bg-[#5C1A1B]/50 border border-[#EADDC5]/20 p-6 rounded transition-all duration-500 hover:bg-[#5C1A1B]/80 flex flex-col justify-center">
                <div className="text-[10px] tracking-widest text-[#EADDC5] opacity-80 font-bold mb-2 uppercase">{garment.spec2Label}</div>
                <div className="text-base text-[#F4EBD9] font-sans leading-snug">{garment.spec2Value}</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 05: LOOKBOOK EXPANSION */}
      <div className="px-6 md:px-12 py-16 bg-[#EADDC5] border-b border-[#3B1011]/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">

          {/* Image 1 */}
          <div className="relative h-[700px] group overflow-hidden bg-[#F4EBD9] border border-[#3B1011]/10 p-3 shadow-lg rounded-sm cursor-pointer">
            <div className="noise-bg z-10 transition-opacity duration-500 group-hover:opacity-20"></div>
            <div className="absolute inset-3 bg-[#5C1A1B] mix-blend-color opacity-80 group-hover:opacity-0 transition-opacity duration-1000 z-10 pointer-events-none"></div>
            <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800" alt="Look 03 Capsule" className="w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-105 grayscale sepia-[.3] group-hover:grayscale-0 group-hover:sepia-0" />
            <div className="absolute bottom-3 left-3 right-3 bg-gradient-to-t from-[#3B1011] via-[#3B1011]/80 to-transparent p-8 pt-32 pointer-events-none transition-all duration-700 z-20">
              <div className="text-xs font-semibold tracking-widest text-[#EADDC5] mb-2 uppercase">POPLIN & FRESCO WOOL</div>
              <div className="font-serif italic text-2xl text-[#F4EBD9]">High-Rotation Daily Uniform</div>
            </div>
          </div>

          {/* Image 2 */}
          <div className="relative h-[700px] group overflow-hidden bg-[#F4EBD9] border border-[#3B1011]/10 p-3 shadow-lg rounded-sm cursor-pointer md:mt-12">
            <div className="noise-bg z-10 transition-opacity duration-500 group-hover:opacity-20"></div>
            <div className="absolute inset-3 bg-[#5C1A1B] mix-blend-color opacity-80 group-hover:opacity-0 transition-opacity duration-1000 z-10 pointer-events-none"></div>
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800" alt="Look 04 Telemetry" className="w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-105 grayscale sepia-[.3] group-hover:grayscale-0 group-hover:sepia-0" />
            <div className="absolute bottom-3 left-3 right-3 bg-gradient-to-t from-[#3B1011] via-[#3B1011]/80 to-transparent p-8 pt-32 pointer-events-none transition-all duration-700 z-20">
              <div className="text-xs font-semibold tracking-widest text-[#EADDC5] mb-2 uppercase">WEATHER-SYNCED</div>
              <div className="font-serif italic text-2xl text-[#F4EBD9]">Architectural Trench Coat</div>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 06: DOSSIER */}
      <div className="min-h-screen px-6 md:px-12 py-24 flex justify-center items-center relative overflow-hidden bg-[#3B1011]">
        <div className="noise-bg opacity-10"></div>
        <div className="w-full max-w-6xl bg-[#F4EBD9] shadow-[0_30px_60px_rgba(0,0,0,0.4)] rounded-sm flex flex-col md:flex-row min-h-[75vh] relative border border-[#EADDC5]">
          <div className="absolute left-1/2 top-0 bottom-0 w-12 -ml-6 flex flex-col justify-evenly items-center z-20 pointer-events-none hidden md:flex">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-16 h-8 border-[6px] border-[#5C1A1B] rounded-full bg-transparent shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"></div>
            ))}
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#3B1011]/20 -ml-[0.5px]"></div>
          </div>

          <div className="flex-1 p-12 md:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#3B1011]/10 relative bg-[#F4EBD9]">
            <div className="absolute top-12 left-12 w-56 h-72 bg-[#EADDC5] p-4 shadow-xl transform -rotate-2 border border-[#3B1011]/20 transition-all duration-700 hover:scale-105 hover:-rotate-6 hover:shadow-2xl hover:z-30 cursor-crosshair group">
              <div className="w-10 h-10 bg-[#3B1011] absolute -top-5 left-1/2 -ml-5 rounded-sm shadow-md clip-path-polygon-[0_0,100%_0,80%_100%,20%_100%] flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-1">
                <div className="w-4 h-1 bg-[#F4EBD9]/50 rounded-full"></div>
              </div>
              <img src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80" alt="Suit Archetype" className="w-full h-full object-cover grayscale sepia-[.5] mix-blend-multiply opacity-90 border border-[#3B1011]/20 transition-all duration-700 group-hover:grayscale-0 group-hover:sepia-0 group-hover:mix-blend-normal group-hover:opacity-100" />
            </div>

            <div className="mt-auto pt-80">
              <div className="flex justify-between items-center py-4 border-b border-[#3B1011]/20 text-xs tracking-widest font-bold text-[#7B2C2D] transition-all duration-500 transform hover:translate-x-4 hover:bg-[#EADDC5] hover:text-[#5C1A1B] px-4 cursor-pointer rounded-r-lg border-l-4 border-l-transparent hover:border-l-[#7B2C2D]">
                <span className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-[#7B2C2D] animate-pulse"></span> COLOR TONE MATCHING</span>
                <span>\ 01</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-[#3B1011]/20 text-xs tracking-widest font-semibold text-[#5C1A1B] transition-all duration-500 transform hover:translate-x-4 hover:bg-[#EADDC5] hover:text-[#7B2C2D] px-4 cursor-pointer rounded-r-lg border-l-4 border-l-transparent hover:border-l-[#7B2C2D]">
                <span>DAILY OUTFIT GENERATION</span>
                <span>\ 02</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-[#3B1011]/20 text-xs tracking-widest font-semibold text-[#5C1A1B] transition-all duration-500 transform hover:translate-x-4 hover:bg-[#EADDC5] hover:text-[#7B2C2D] px-4 cursor-pointer rounded-r-lg border-l-4 border-l-transparent hover:border-l-[#7B2C2D]">
                <span>ADAPTIVE STYLE SUGGESTIONS</span>
                <span>\ 03</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-[#3B1011]/20 text-xs tracking-widest font-semibold text-[#5C1A1B] transition-all duration-500 transform hover:translate-x-4 hover:bg-[#EADDC5] hover:text-[#7B2C2D] px-4 cursor-pointer rounded-r-lg border-l-4 border-l-transparent hover:border-l-[#7B2C2D]">
                <span>A WARDROBE THAT EVOLVES</span>
                <span>\ 04</span>
              </div>
            </div>
          </div>

          <div className="flex-1 p-12 md:p-16 flex flex-col justify-center bg-[#F4EBD9]">
            <h2 className="text-5xl md:text-7xl font-sans font-bold tracking-tighter leading-none mb-10 text-[#3B1011]">
              the house<br />
              <span className="font-serif italic text-[#7B2C2D]">of SmartWardrobe</span>
            </h2>
            <p className="text-base leading-relaxed mb-16 max-w-md text-[#5C1A1B] font-medium text-justify">
              SmartWardrobe utilizes advanced AI to continuously analyze your personal color tone, lifestyle, and daily schedule. It intuitively designs your day-to-day outfits, suggesting tailored style combinations that ensure you are impeccably dressed. The result is an intelligent wardrobe that anticipates your needs and effortlessly elevates your daily presence.
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER (CONTACT anchor) */}
      <footer id="contact" className="bg-[#3B1011] text-[#F4EBD9] py-32 px-6 md:px-16 border-t border-[#F4EBD9]/10 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none opacity-[0.03] z-0 select-none">
          <span className="font-serif italic text-[20vw] whitespace-nowrap text-[#F4EBD9]">SmartWardrobe</span>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center relative z-10">
          <div className="flex flex-col gap-8 text-left group cursor-default">
            <h3 className="font-serif italic text-4xl md:text-5xl lg:text-6xl leading-tight text-[#EADDC5] animate-fade-up-1">
              "Every culture has its own kind of style."
            </h3>
            <div className="h-px w-24 bg-[#7B2C2D] animate-fade-up-2"></div>
            <p className="font-sans font-bold text-lg md:text-xl tracking-[0.2em] uppercase text-[#F4EBD9] animate-fade-up-2">
              Dress well &mdash; waste less &mdash; be yourself.
            </p>
            <p className="font-serif text-xl md:text-2xl text-[#EADDC5] opacity-80 animate-fade-up-3 leading-relaxed">
              Know your closet, find new pairings,<br />dress like yourself.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- 2. THE ACTUAL LOGIN / REGISTER FORMS ---
export function AuthPage({ mode = 'login' }: { mode?: 'login' | 'register' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'register') {
        await axios.post(`${API_URL}/auth/register`, { email, password, name });
        await axios.post(`${API_URL}/auth/login`, { email, password });
      } else {
        await axios.post(`${API_URL}/auth/login`, { email, password });
      }
      navigate('/overview');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F4EBD9] font-sans text-[#3B1011] selection:bg-[#7B2C2D] selection:text-[#F4EBD9]">
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        .noise-bg {
          position: absolute;
          inset: 0;
          opacity: 0.05;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
      `}} />

      {/* LEFT SIDE: Editorial Imagery */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden group">
        <div className="absolute inset-0 bg-[#3B1011] opacity-50 mix-blend-multiply z-10 transition-opacity duration-1000 group-hover:opacity-0 pointer-events-none"></div>
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200"
          alt="Editorial Look"
          className="absolute inset-0 w-full h-full object-cover grayscale sepia-[0.4] transition-all duration-1000 group-hover:grayscale-0 group-hover:sepia-0 group-hover:scale-105"
        />
        <div className="absolute inset-0 z-20 p-12 flex flex-col justify-between pointer-events-none">
          <Link to="/" className="text-xs font-semibold tracking-[0.2em] text-[#F4EBD9] pointer-events-auto hover:text-[#EADDC5] transition-colors">
            SMARTWARDROBE
          </Link>
          <div className="max-w-md">
            <h2 className="font-serif italic text-4xl xl:text-5xl text-[#F4EBD9] leading-tight mb-6">
              "Every culture has its own kind of style."
            </h2>
            <div className="h-px w-24 bg-[#7B2C2D] mb-6"></div>
            <p className="font-sans font-bold text-sm tracking-[0.2em] uppercase text-[#EADDC5]">
              Dress well &mdash; waste less &mdash; be yourself.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Authentication Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 relative border-l border-[#3B1011]/10">
        <div className="noise-bg"></div>

        <div className="mx-auto w-full max-w-md relative z-10">

          {/* Mobile Logo */}
          <div className="lg:hidden mb-12">
            <Link to="/" className="text-xs font-semibold tracking-[0.2em] text-[#3B1011]">SMARTWARDROBE</Link>
          </div>

          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#3B1011] tracking-tight mb-2">
            {mode === 'login' ? 'Welcome back.' : 'Join the house.'}
          </h2>
          <p className="text-[#5C1A1B] text-sm md:text-base mb-10 font-medium opacity-80">
            {mode === 'login'
              ? 'Enter your credentials to access your digitized closet.'
              : 'Create an account to begin archiving your wardrobe.'}
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-[#3B1011] text-[#F4EBD9] p-4 text-xs font-semibold tracking-wider uppercase border border-[#7B2C2D]">
                {error}
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-[#5C1A1B] mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-4 py-3 bg-[#EADDC5] border border-[#3B1011]/20 text-[#3B1011] focus:outline-none focus:border-[#7B2C2D] focus:ring-1 focus:ring-[#7B2C2D] transition-colors rounded-sm"
                  placeholder="Jane Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-[#5C1A1B] mb-2">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#3B1011]/50" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-[#EADDC5] border border-[#3B1011]/20 text-[#3B1011] focus:outline-none focus:border-[#7B2C2D] focus:ring-1 focus:ring-[#7B2C2D] transition-colors rounded-sm"
                  placeholder="studio@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-[#5C1A1B] mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#3B1011]/50" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-[#EADDC5] border border-[#3B1011]/20 text-[#3B1011] focus:outline-none focus:border-[#7B2C2D] focus:ring-1 focus:ring-[#7B2C2D] transition-colors rounded-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {mode === 'login' && (
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#7B2C2D] focus:ring-[#7B2C2D] border-[#3B1011]/20 rounded-sm bg-[#EADDC5]"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-xs font-medium text-[#5C1A1B]">
                    Remember me
                  </label>
                </div>

                <Link to="/forgot-password" className="text-xs font-bold tracking-wider uppercase text-[#7B2C2D] hover:text-[#3B1011] transition-colors">
                  Forgot password?
                </Link>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-4 px-4 border border-[#3B1011] rounded-sm shadow-md text-xs font-bold tracking-[0.2em] uppercase text-[#F4EBD9] bg-[#3B1011] hover:bg-[#5C1A1B] hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : mode === 'login' ? (
                  'LOGIN'
                ) : (
                  'CREATE WARDROBE'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            {mode === 'login' ? (
              <p className="text-xs font-medium text-[#5C1A1B]">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold tracking-wider uppercase text-[#7B2C2D] hover:text-[#3B1011] transition-colors ml-2">
                  Sign up
                </Link>
              </p>
            ) : (
              <p className="text-xs font-medium text-[#5C1A1B]">
                Already have an account?{' '}
                <Link to="/login" className="font-bold tracking-wider uppercase text-[#7B2C2D] hover:text-[#3B1011] transition-colors ml-2">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}