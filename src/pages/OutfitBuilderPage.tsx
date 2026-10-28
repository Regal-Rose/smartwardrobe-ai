import { useState, useRef, useEffect } from 'react';
import { UploadCloud, User, Shirt, Wand2, Loader2, RefreshCcw, Grid, X } from 'lucide-react';

export function OutfitBuilderPage() {
  const [personFile, setPersonFile] = useState<File | null>(null);
  const [garmentFile, setGarmentFile] = useState<File | null>(null);
  const [personPreview, setPersonPreview] = useState<string | null>(null);
  const [garmentPreview, setGarmentPreview] = useState<string | null>(null);

  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("upper_body");

  // NEW STATE: For the Wardrobe Picker Modal
  const [savedClothes, setSavedClothes] = useState<any[]>([]);
  const [showWardrobeModal, setShowWardrobeModal] = useState(false);

  const personInputRef = useRef<HTMLInputElement>(null);
  const garmentInputRef = useRef<HTMLInputElement>(null);

  // NEW: Fetch saved clothes when the page loads
  useEffect(() => {
    // Note: Update this URL if your backend uses a different route to list clothing items
    fetch("http://localhost:8000/api/clothing")
      .then(res => res.json())
      .then(data => {
        // Handles both { items: [...] } and [...] array structures
        setSavedClothes(Array.isArray(data) ? data : data.items || []);
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

  // NEW: Convert a saved wardrobe URL into a File object so the backend accepts it
  const handleSelectSavedGarment = async (imageUrl: string) => {
    try {
      setError(null);

      // Fetch the image data from your backend
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Failed to fetch image");

      const blob = await response.blob();
      const fileName = imageUrl.split('/').pop() || 'wardrobe_item.jpg';

      // Create a File object from the Blob
      const file = new File([blob], fileName, { type: blob.type });

      setGarmentFile(file);
      setGarmentPreview(imageUrl);
      setShowWardrobeModal(false); // Close the modal
    } catch (err) {
      console.error(err);
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
      const response = await fetch("http://localhost:8000/api/try-on", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.result_url) {
        setResultImage(data.result_url);
      } else {
        setError(data.error || "Failed to generate try-on image.");
      }
    } catch (err) {
      setError("Could not connect to the backend server. Make sure it is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 bg-surface p-6 rounded-2xl border border-border-light min-h-[calc(100vh-8rem)] relative">

      <header className="border-b border-border-light pb-6">
        <p className="text-xs uppercase tracking-[.18em] text-ink-muted mb-1">AI Studio</p>
        <h1 className="heading-editorial-lg text-ink">Virtual Try-On Room</h1>
        <p className="text-sm text-ink-muted mt-2">See how any garment looks on you instantly using AI.</p>
      </header>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-6">

          {/* Person Upload */}
          <div
            onClick={() => personInputRef.current?.click()}
            className="border-2 border-dashed border-border-light rounded-2xl p-6 bg-ivory/30 hover:bg-ivory transition-colors cursor-pointer text-center relative h-56 flex flex-col items-center justify-center group"
          >
            <input type="file" ref={personInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'person')} />
            {personPreview ? (
              <img src={personPreview} alt="Person" className="absolute inset-0 w-full h-full object-contain p-2 rounded-2xl" />
            ) : (
              <>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <User size={24} className="text-ink-muted" />
                </div>
                <h3 className="text-sm font-medium text-ink">Upload Your Photo</h3>
                <p className="text-xs text-ink-muted mt-1">Full body or waist-up shot</p>
              </>
            )}
          </div>

          {/* Garment Selection Area */}
          <div>
            <div
              onClick={() => garmentInputRef.current?.click()}
              className="border-2 border-dashed border-border-light rounded-2xl p-6 bg-ivory/30 hover:bg-ivory transition-colors cursor-pointer text-center relative h-56 flex flex-col items-center justify-center group"
            >
              <input type="file" ref={garmentInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'garment')} />
              {garmentPreview ? (
                <img src={garmentPreview} alt="Garment" className="absolute inset-0 w-full h-full object-contain p-2 rounded-2xl" />
              ) : (
                <>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <Shirt size={24} className="text-ink-muted" />
                  </div>
                  <h3 className="text-sm font-medium text-ink">Upload Garment</h3>
                  <p className="text-xs text-ink-muted mt-1">Flat lay or clean background</p>
                </>
              )}
            </div>

            {/* NEW: The "Or pick from Wardrobe" divider and button */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border-light"></div>
              <span className="text-[10px] text-ink-muted uppercase tracking-widest font-semibold">OR</span>
              <div className="flex-1 h-px bg-border-light"></div>
            </div>

            <button
              onClick={() => setShowWardrobeModal(true)}
              className="w-full py-3 bg-white text-ink text-sm font-medium rounded-xl hover:bg-ivory border border-border-light transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Grid size={16} /> Choose from Wardrobe
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">Garment Type</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-border-light bg-white px-4 py-3 text-sm text-ink outline-none focus:border-sage-deep transition-colors cursor-pointer"
            >
              <option value="upper_body">Top / Upper Body (Shirts, Jackets)</option>
              <option value="lower_body">Bottom / Lower Body (Pants, Skirts)</option>
              <option value="dresses">Dress / Full Body (Dresses, Jumpsuits)</option>
            </select>
          </div>

          <button
            onClick={handleTryOn}
            disabled={!personFile || !garmentFile || isLoading}
            className="w-full py-3.5 bg-sage-deep text-white font-medium rounded-xl hover:bg-sage transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
            {isLoading ? "Generating Magic (approx. 15-20s)..." : "Generate Try-On"}
          </button>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-7">
          <div className="bg-ivory-warm border border-border-light rounded-3xl h-full min-h-[500px] flex items-center justify-center relative overflow-hidden p-4">
            {resultImage ? (
              <div className="relative w-full h-full group flex flex-col items-center justify-center">
                <img src={resultImage} alt="AI Generated Try-On" className="max-h-[600px] w-auto object-contain rounded-xl shadow-sm" />
                <button onClick={() => setResultImage(null)} className="absolute top-4 right-4 bg-white/80 backdrop-blur px-4 py-2 rounded-lg text-sm font-medium text-ink shadow-sm hover:bg-white transition-colors flex items-center gap-2">
                  <RefreshCcw size={16} /> Reset
                </button>
              </div>
            ) : (
              <div className="text-center text-ink-muted">
                {isLoading ? (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 size={40} className="animate-spin text-sage-deep" />
                    <p className="text-sm">The AI is dressing you.<br />This usually takes about 15-20 seconds.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <UploadCloud size={48} className="opacity-20" />
                    <p className="text-sm">Upload your photo and a garment<br />to see the result here.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* NEW: The Wardrobe Picker Modal Overlay */}
      {showWardrobeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">

            <div className="flex items-center justify-between p-6 border-b border-border-light bg-white">
              <h3 className="text-lg font-semibold text-ink">Select from Wardrobe</h3>
              <button onClick={() => setShowWardrobeModal(false)} className="p-2 text-ink-muted hover:bg-ivory rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-ivory-warm/30 flex-1">
              {savedClothes.length === 0 ? (
                <div className="text-center py-12">
                  <Shirt size={40} className="mx-auto text-ink-muted mb-3 opacity-50" />
                  <p className="text-ink font-medium">Your wardrobe is empty</p>
                  <p className="text-sm text-ink-muted mt-1">Upload clothes in the Wardrobe tab first.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {savedClothes.map((item, idx) => (
                    <button
                      key={item.id || idx}
                      onClick={() => handleSelectSavedGarment(item.image_url)}
                      className="aspect-square rounded-2xl border border-border-light bg-white hover:border-sage-deep hover:shadow-md overflow-hidden relative group transition-all"
                    >
                      {/* Assuming your backend sends 'image_url' for each item */}
                      <img src={item.image_url} alt="Wardrobe item" className="w-full h-full object-contain p-2" />
                      <div className="absolute inset-0 bg-sage-deep/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}