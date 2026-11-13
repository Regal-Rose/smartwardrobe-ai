import { useState } from 'react';
import { Sparkles, Image as ImageIcon, Loader2, Download, RefreshCcw, BookOpen } from 'lucide-react';

export function LookbookPage() {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const [prompt, setPrompt] = useState("");
  const [occasion, setOccasion] = useState("casual");
  const [style, setStyle] = useState("western");

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please describe what kind of look you want to see.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/api/v1/lookbook`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          occasion: occasion,
          style: style
        })
      });

      const data = await response.json();

      if (response.ok && data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else {
        setError(data.error || "Failed to generate image.");
      }
    } catch {
      setError("Could not connect to the backend server.");
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
          50% { transform: translateY(25px) rotate(-2deg) scale(1.02); }
        }
        .animate-float-slow { animation: float-slow 15s ease-in-out infinite; }
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
        className="absolute -top-20 -left-20 w-[800px] h-[800px] object-cover rounded-full opacity-[0.04] mix-blend-multiply animate-float-slow pointer-events-none blur-[3px]"
      />

      <div className="relative z-10 flex flex-col h-full p-8 lg:p-12 overflow-y-auto hide-scrollbar">

        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7B2C2D] mb-3 flex items-center gap-2">
              <BookOpen size={12} /> GENERATIVE INSPIRATION
            </p>
            <h1 className="font-serif text-5xl lg:text-6xl font-bold text-[#3B1011] tracking-tight">
              AI Lookbook<span className="text-[#7B2C2D]">.</span>
            </h1>
            <p className="text-sm font-medium text-[#5C1A1B] mt-4 opacity-80 max-w-md">
              Generate high-quality fashion editorial images for style inspiration using neural imaging.
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

          {/* LEFT CONTROLS (5/12) */}
          <div className="lg:col-span-5 space-y-6">

            <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#3B1011]/10 p-6 shadow-sm">
              <div className="space-y-3 mb-6">
                <label className="text-[10px] font-bold tracking-widest uppercase text-[#5C1A1B]">Sartorial Description</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. A minimalist autumn outfit with a beige trench coat and chunky boots..."
                  className="w-full h-32 rounded-xl border border-[#3B1011]/10 bg-white p-4 text-sm text-[#3B1011] outline-none focus:border-[#7B2C2D] transition-colors resize-none shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-[#5C1A1B]">Occasion</label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full rounded-xl border border-[#3B1011]/10 bg-white px-4 py-3 text-sm text-[#3B1011] outline-none focus:border-[#7B2C2D] transition-colors cursor-pointer shadow-sm"
                  >
                    <option value="casual">Casual / Everyday</option>
                    <option value="work">Office / Workwear</option>
                    <option value="party">Party / Evening</option>
                    <option value="formal">Formal / Event</option>
                    <option value="vacation">Vacation / Resort</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-[#5C1A1B]">Style</label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full rounded-xl border border-[#3B1011]/10 bg-white px-4 py-3 text-sm text-[#3B1011] outline-none focus:border-[#7B2C2D] transition-colors cursor-pointer shadow-sm"
                  >
                    <option value="western">Western</option>
                    <option value="indian">Indian / Ethnic</option>
                    <option value="fusion">Indo-Western Fusion</option>
                    <option value="streetwear">Streetwear</option>
                    <option value="minimalist">Minimalist / Old Money</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className="w-full mt-8 py-4 bg-[#3B1011] text-[#FDFBF7] font-medium rounded-xl hover:bg-[#5C1A1B] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span className="text-xs font-bold tracking-[0.15em] uppercase">
                  {isLoading ? "Designing Look..." : "Generate Inspiration"}
                </span>
              </button>
            </div>

            <div className="bg-[#EADDC5]/40 backdrop-blur-sm p-5 rounded-2xl border border-[#3B1011]/10 shadow-sm text-sm text-[#5C1A1B] leading-relaxed">
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#7B2C2D] block mb-1">Architectural Tip</span>
              Be descriptive! Mention specific colors, fabrics (like linen, leather, or silk), and the overall vibe you are going for to get the best results from the neural imaging engine.
            </div>
          </div>

          {/* RIGHT CANVAS (7/12) */}
          <div className="lg:col-span-7">
            <div className="bg-[#EADDC5]/20 border border-[#3B1011]/10 rounded-3xl h-full min-h-[500px] flex items-center justify-center relative overflow-hidden p-6 shadow-inner">

              {generatedImage ? (
                <div className="relative w-full h-full group flex flex-col items-center justify-center">
                  <img
                    src={generatedImage}
                    alt="AI Generated Lookbook"
                    className="max-h-[600px] w-auto object-cover rounded-2xl shadow-xl border border-[#3B1011]/10 group-hover:scale-[1.01] transition-transform duration-500"
                  />

                  {/* Floating Action Buttons */}
                  <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = generatedImage;
                        link.download = `smartwardrobe-look-${Date.now()}.jpg`;
                        link.click();
                      }}
                      className="bg-[#FDFBF7]/90 backdrop-blur-md px-4 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase text-[#3B1011] shadow-md border border-[#3B1011]/10 hover:bg-[#3B1011] hover:text-[#FDFBF7] transition-colors flex items-center gap-2"
                    >
                      <Download size={14} /> Download
                    </button>
                    <button
                      onClick={() => setGeneratedImage(null)}
                      className="bg-[#FDFBF7]/90 backdrop-blur-md px-4 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase text-[#3B1011] shadow-md border border-[#3B1011]/10 hover:bg-[#3B1011] hover:text-[#FDFBF7] transition-colors flex items-center gap-2"
                    >
                      <RefreshCcw size={14} /> Reset Canvas
                    </button>
                  </div>
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
                        <p className="font-serif text-2xl text-[#3B1011] mb-1">Styling your request...</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Rendering high-res photography.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <div className="w-16 h-16 bg-[#3B1011]/5 rounded-full flex items-center justify-center mb-2">
                        <ImageIcon size={32} strokeWidth={1} className="text-[#3B1011]" />
                      </div>
                      <p className="font-serif text-2xl italic text-[#3B1011]">Your Lookbook Canvas</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#3B1011]">Describe an outfit to see it brought to life.</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}