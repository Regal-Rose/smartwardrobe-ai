import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, User, Shirt, Wand2, Loader2, RefreshCcw, Grid, X } from 'lucide-react';

export function OutfitBuilderPage() {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const [personFile, setPersonFile] = useState<File | null>(null);
  const [garmentFile, setGarmentFile] = useState<File | null>(null);
  const [personPreview, setPersonPreview] = useState<string | null>(null);
  const [garmentPreview, setGarmentPreview] = useState<string | null>(null);

  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("upper_body");

  // For the Wardrobe Picker Modal
  const [savedClothes, setSavedClothes] = useState<any[]>([]);
  const [showWardrobeModal, setShowWardrobeModal] = useState(false);

  const personInputRef = useRef<HTMLInputElement>(null);
  const garmentInputRef = useRef<HTMLInputElement>(null);

  // Fetch saved clothes when the page loads
  useEffect(() => {
    fetch(`${BASE_URL}/api/v1/garments`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        const items = Array.isArray(data) ? data : data.items || [];
        setSavedClothes(items.map((g: any) => ({ ...g, image_url: g.imageData || g.image_url || '' })));
      })
      .catch(err => console.error("Could not load wardrobe", err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'person' | 'garment') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    if (type === 'person') {
      setPersonFile(file);
      setPersonPreview(previewUrl);
    } else {
      setGarmentFile(file);
      setGarmentPreview(previewUrl);
    }
  };

  // Convert a saved wardrobe URL into a File object
  const handleSelectSavedGarment = async (imageUrl: string) => {
    try {
      setError(null);
      let blob: Blob;
      if (imageUrl.startsWith('data:')) {
        const res = await fetch(imageUrl);
        blob = await res.blob();
      } else {
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error("Failed to fetch image");
        blob = await response.blob();
      }
      const file = new File([blob], 'wardrobe_item.png', { type: blob.type || 'image/png' });

      setGarmentFile(file);
      setGarmentPreview(imageUrl);
      setShowWardrobeModal(false);
    } catch (_err) {
      console.error(_err);
      setError("Failed to load the selected garment image.");
    }
  };

  const handleTryOn = async () => {
    if (!personFile || !garmentFile) {
      setError("Please upload both a person and a garment image.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultImage(null);

    const formData = new FormData();
    formData.append("human_image", personFile);
    formData.append("garment_image", garmentFile);
    formData.append("category", category);
    formData.append("description", "A stylish garment");

    try {
      const response = await fetch(`${BASE_URL}/api/try-on`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (response.ok && data.result_url) {
        setResultImage(data.result_url);
      } else {
        setError(data.error || "Failed to generate try-on image.");
      }
    } catch {
      setError("Could not connect to the backend server. Make sure it is running.");
    } finally {
      setIsLoading(false);
    }
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
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(20px) rotate(-2deg) scale(1.02); }
        }
        .animate-float-slow { animation: float-slow 16s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 20s ease-in-out infinite; }
        
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
        className="absolute top-0 right-0 w-[500px] h-[500px] object-cover rounded-full opacity-[0.05] mix-blend-multiply animate-float-slow pointer-events-none blur-[2px]"
      />

      <img
        src="https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=600&auto=format&fit=crop"
        alt="3D Texture"
        className="absolute -bottom-20 -left-20 w-[600px] h-[600px] object-cover rounded-full opacity-[0.04] mix-blend-multiply animate-float-slower pointer-events-none blur-[1px]"
      />

      <div className="relative z-10 flex flex-col h-full p-8 lg:p-12 overflow-y-auto hide-scrollbar">

        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7B2C2D] mb-3 flex items-center gap-2">
              <Wand2 size={12} /> 3D DRAPE & SILHOUETTE PHYSICS
            </p>
            <h1 className="font-serif text-5xl lg:text-6xl font-bold text-[#3B1011] tracking-tight">
              Virtual Try-On<span className="text-[#7B2C2D]">.</span>
            </h1>
            <p className="text-sm font-medium text-[#5C1A1B] mt-4 opacity-80 max-w-md">
              Witness how fabrics drape across your shoulders before a single thread touches your skin.
            </p>
          </div>
        </header>

        {error && (
          <div className="bg-[#3B1011] text-[#F4EBD9] p-4 text-xs font-semibold tracking-wider uppercase border border-[#7B2C2D] mb-8 rounded-sm">
            {error}
          </div>
        )}

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">

          {/* LEFT: INPUT CONTROLS */}
          <div className="lg:col-span-4 space-y-6">

            {/* Person Upload */}
            <div
              onClick={() => personInputRef.current?.click()}
              className="border border-[#3B1011]/20 rounded-2xl p-6 bg-white/60 backdrop-blur-sm hover:bg-[#EADDC5]/50 hover:border-[#7B2C2D]/50 transition-all cursor-pointer text-center relative h-56 flex flex-col items-center justify-center group shadow-sm"
            >
              <input type="file" ref={personInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'person')} />
              {personPreview ? (
                <img src={personPreview} alt="Person" className="absolute inset-0 w-full h-full object-cover p-2 rounded-2xl grayscale sepia-[0.2] group-hover:grayscale-0 group-hover:sepia-0 transition-all duration-500" />
              ) : (
                <>
                  <div className="w-12 h-12 bg-[#FDFBF7] rounded-full flex items-center justify-center shadow-sm border border-[#3B1011]/10 mb-3 group-hover:scale-110 transition-transform">
                    <User size={20} className="text-[#3B1011]" />
                  </div>
                  <h3 className="text-xs font-bold tracking-widest uppercase text-[#3B1011]">Upload Subject</h3>
                  <p className="text-[10px] text-[#5C1A1B]/70 mt-1 uppercase tracking-wider">Full body or waist-up</p>
                </>
              )}
            </div>

            {/* Garment Selection Area */}
            <div>
              <div
                onClick={() => garmentInputRef.current?.click()}
                className="border border-[#3B1011]/20 rounded-2xl p-6 bg-white/60 backdrop-blur-sm hover:bg-[#EADDC5]/50 hover:border-[#7B2C2D]/50 transition-all cursor-pointer text-center relative h-56 flex flex-col items-center justify-center group shadow-sm"
              >
                <input type="file" ref={garmentInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'garment')} />
                {garmentPreview ? (
                  <img src={garmentPreview} alt="Garment" className="absolute inset-0 w-full h-full object-cover p-2 rounded-2xl grayscale sepia-[0.2] group-hover:grayscale-0 group-hover:sepia-0 transition-all duration-500" />
                ) : (
                  <>
                    <div className="w-12 h-12 bg-[#FDFBF7] rounded-full flex items-center justify-center shadow-sm border border-[#3B1011]/10 mb-3 group-hover:scale-110 transition-transform">
                      <Shirt size={20} className="text-[#3B1011]" />
                    </div>
                    <h3 className="text-xs font-bold tracking-widest uppercase text-[#3B1011]">Upload Garment</h3>
                    <p className="text-[10px] text-[#5C1A1B]/70 mt-1 uppercase tracking-wider">Flat lay isolation</p>
                  </>
                )}
              </div>

              {/* "Or pick from Wardrobe" divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-[#3B1011]/10"></div>
                <span className="text-[9px] text-[#3B1011]/50 uppercase tracking-[0.2em] font-bold">OR</span>
                <div className="flex-1 h-px bg-[#3B1011]/10"></div>
              </div>

              <button
                onClick={() => setShowWardrobeModal(true)}
                className="w-full py-4 bg-white/60 backdrop-blur-sm text-[#3B1011] text-xs font-bold tracking-[0.15em] uppercase rounded-xl hover:bg-[#EADDC5] border border-[#3B1011]/10 transition-colors flex items-center justify-center gap-2 shadow-sm hover:border-[#3B1011]/30"
              >
                <Grid size={16} /> Choose from Archive
              </button>
            </div>

            {/* Category Dropdown */}
            <div className="space-y-2 mt-2">
              <label className="block text-[10px] font-bold tracking-widest uppercase text-[#5C1A1B] mb-2">Garment Architecture</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-[#3B1011]/10 bg-white/60 backdrop-blur-sm px-4 py-3.5 text-sm text-[#3B1011] outline-none focus:border-[#7B2C2D] transition-colors cursor-pointer shadow-sm"
              >
                <option value="upper_body">Upper Body (Shirts, Jackets)</option>
                <option value="lower_body">Lower Body (Pants, Skirts)</option>
                <option value="dresses">Full Body (Dresses, Jumpsuits)</option>
              </select>
            </div>

            <button
              onClick={handleTryOn}
              disabled={!personFile || !garmentFile || isLoading}
              className="w-full py-4 bg-[#3B1011] text-[#FDFBF7] text-xs font-bold tracking-[0.15em] uppercase rounded-xl hover:bg-[#5C1A1B] transition-all shadow-md disabled:opacity-50 disabled:hover:scale-100 hover:scale-[1.02] flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
              {isLoading ? "Synthesizing Physics..." : "Generate Biometric Drape"}
            </button>
          </div>

          {/* RIGHT: OUTPUT CANVAS */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="bg-[#EADDC5]/20 border border-[#3B1011]/10 rounded-3xl h-full min-h-[600px] flex items-center justify-center relative overflow-hidden p-6 shadow-inner">
              {resultImage ? (
                <div className="relative w-full h-full group flex flex-col items-center justify-center">
                  <img src={resultImage} alt="AI Generated Try-On" className="max-h-[700px] w-auto object-cover rounded-2xl shadow-xl border border-[#3B1011]/10" />

                  {/* Reset Button */}
                  <button onClick={() => setResultImage(null)} className="absolute top-6 right-6 bg-[#FDFBF7]/90 backdrop-blur-md px-4 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase text-[#3B1011] shadow-md border border-[#3B1011]/10 hover:bg-[#3B1011] hover:text-[#FDFBF7] transition-colors flex items-center gap-2 opacity-0 group-hover:opacity-100">
                    <RefreshCcw size={12} /> Reset Canvas
                  </button>
                </div>
              ) : (
                <div className="text-center text-[#5C1A1B]">
                  {isLoading ? (
                    <div className="flex flex-col items-center gap-5">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 border-2 border-[#7B2C2D]/20 rounded-full"></div>
                        <div className="absolute inset-0 border-2 border-[#7B2C2D] rounded-full border-t-transparent animate-spin"></div>
                      </div>
                      <div>
                        <p className="font-serif text-2xl text-[#3B1011] mb-1">Applying mesh physics...</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Rendering requires ~15 seconds</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <UploadCloud size={64} strokeWidth={1} />
                      <p className="font-serif text-2xl italic">The studio is empty.</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest">Input subjects to begin synthesis.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* WARDROBE PICKER MODAL OVERLAY */}
        {showWardrobeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3B1011]/40 backdrop-blur-sm p-4">
            <div className="bg-[#FDFBF7] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-[#3B1011]/10">

              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 lg:p-8 border-b border-[#3B1011]/10 bg-white">
                <div>
                  <h3 className="font-serif text-3xl font-bold text-[#3B1011]">Select from Archive</h3>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-[#5C1A1B]/70 mt-1">Click a garment to load it into the Try-On studio.</p>
                </div>
                <button onClick={() => setShowWardrobeModal(false)} className="p-2 text-[#3B1011]/40 hover:text-[#3B1011] hover:bg-[#EADDC5]/50 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* Modal Grid */}
              <div className="p-6 lg:p-8 overflow-y-auto bg-[#EADDC5]/10 flex-1 hide-scrollbar">
                {savedClothes.length === 0 ? (
                  <div className="text-center py-20 flex flex-col items-center opacity-50">
                    <Shirt size={64} strokeWidth={1} className="text-[#3B1011] mb-4" />
                    <p className="font-serif text-2xl text-[#3B1011]">Your archive is empty</p>
                    <p className="text-xs uppercase tracking-widest font-bold mt-2">Digitize clothes in the Wardrobe tab first.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {savedClothes.map((item, idx) => (
                      <button
                        key={item.id || idx}
                        onClick={() => handleSelectSavedGarment(item.image_url)}
                        className="aspect-[3/4] rounded-xl border border-[#3B1011]/10 bg-white hover:border-[#7B2C2D]/50 hover:shadow-xl overflow-hidden relative group transition-all duration-300 flex flex-col"
                      >
                        <div className="flex-1 w-full bg-[#EADDC5]/20 flex items-center justify-center p-3 relative">
                          <img src={item.image_url} alt="Wardrobe item" className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-[#3B1011]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}