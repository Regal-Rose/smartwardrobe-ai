import { useState } from 'react';
import { Sparkles, Image as ImageIcon, Loader2, Download, RefreshCcw } from 'lucide-react';

export function LookbookPage() {
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
      const response = await fetch("http://localhost:8000/api/v1/lookbook", {
        method: "POST",
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
    } catch (err) {
      setError("Could not connect to the backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 bg-surface p-6 rounded-2xl border border-border-light min-h-[calc(100vh-8rem)]">

      <header className="border-b border-border-light pb-6">
        <p className="text-xs uppercase tracking-[.18em] text-ink-muted mb-1">Inspiration</p>
        <h1 className="heading-editorial-lg text-ink">AI Lookbook</h1>
        <p className="text-sm text-ink-muted mt-2">Generate high-quality fashion editorial images for style inspiration.</p>
      </header>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Controls (5/12 width) */}
        <div className="lg:col-span-5 space-y-6">

          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">What do you want to see?</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A minimalist autumn outfit with a beige trench coat and chunky boots..."
              className="w-full h-32 rounded-xl border border-border-light bg-white p-4 text-sm text-ink outline-none focus:border-sage-deep transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink">Occasion</label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full rounded-xl border border-border-light bg-white px-4 py-3 text-sm text-ink outline-none focus:border-sage-deep transition-colors cursor-pointer"
              >
                <option value="casual">Casual / Everyday</option>
                <option value="work">Office / Workwear</option>
                <option value="party">Party / Evening</option>
                <option value="formal">Formal / Event</option>
                <option value="vacation">Vacation / Resort</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink">Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full rounded-xl border border-border-light bg-white px-4 py-3 text-sm text-ink outline-none focus:border-sage-deep transition-colors cursor-pointer"
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
            className="w-full py-4 bg-sage-deep text-white font-medium rounded-xl hover:bg-sage transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {isLoading ? "Designing Look..." : "Generate Inspiration"}
          </button>

          <div className="bg-ivory-warm p-4 rounded-xl border border-border-light text-xs text-ink-muted leading-relaxed">
            <strong>Pro Tip:</strong> Be descriptive! Mention specific colors, fabrics (like linen, leather, or silk), and the overall vibe you are going for to get the best results.
          </div>
        </div>

        {/* Right Column: Output (7/12 width) */}
        <div className="lg:col-span-7">
          <div className="bg-ivory/50 border border-border-light rounded-3xl h-full min-h-[500px] flex items-center justify-center relative overflow-hidden p-4">

            {generatedImage ? (
              <div className="relative w-full h-full group flex flex-col items-center justify-center">
                <img
                  src={generatedImage}
                  alt="AI Generated Lookbook"
                  className="max-h-[600px] w-auto object-contain rounded-xl shadow-lg border border-border-light/50"
                />

                {/* Floating Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = generatedImage;
                      link.download = `smartwardrobe-look-${Date.now()}.jpg`;
                      link.click();
                    }}
                    className="bg-white/90 backdrop-blur px-4 py-2 rounded-lg text-sm font-medium text-ink shadow-sm hover:bg-white transition-colors flex items-center gap-2"
                  >
                    <Download size={16} /> Save
                  </button>
                  <button
                    onClick={() => setGeneratedImage(null)}
                    className="bg-white/90 backdrop-blur px-4 py-2 rounded-lg text-sm font-medium text-ink shadow-sm hover:bg-white transition-colors flex items-center gap-2"
                  >
                    <RefreshCcw size={16} /> Reset
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-ink-muted">
                {isLoading ? (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 size={40} className="animate-spin text-sage-deep" />
                    <p className="text-sm font-medium text-ink">Styling your request...</p>
                    <p className="text-xs">Generating high-res editorial photography.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-2">
                      <ImageIcon size={32} className="text-ink-muted/50" />
                    </div>
                    <p className="text-sm font-medium text-ink">Your Lookbook Canvas</p>
                    <p className="text-xs">Describe an outfit to see it brought to life.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}