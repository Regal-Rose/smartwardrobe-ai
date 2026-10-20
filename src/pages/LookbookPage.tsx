import { useState } from 'react';
import { Sparkles, Image as ImageIcon, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { apiClient } from '../services/api/client';
import { API_ENDPOINTS } from '../services/api/endpoints';

export function LookbookPage() {
  const [prompt, setPrompt] = useState('');
  const [occasion, setOccasion] = useState('casual');
  const [style, setStyle] = useState('western');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please describe the outfit you want to see.');
      return;
    }
    setLoading(true);
    setError('');
    setImageUrl(null);
    try {
      const response = await apiClient.post<{ imageUrl: string; disclaimer: string }>(
        API_ENDPOINTS.LOOKBOOK_GENERATE,
        { prompt, occasion, style }
      );
      const img = new Image();
      img.src = response.imageUrl;
      img.onload = () => {
        setImageUrl(response.imageUrl);
        setLoading(false);
      };
      img.onerror = () => {
        setError('Failed to load the generated image. Please try again.');
        setLoading(false);
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate lookbook image.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="heading-editorial-lg text-ink">AI Lookbook</h1>
        <p className="text-body mt-1">Generate high-quality fashion editorial inspiration.</p>
      </div>

      <div className="bg-surface rounded-xl border border-border-light p-5 space-y-4">
        <Input 
          label="Describe your look" 
          placeholder="e.g. A minimalist linen suit, golden hour lighting" 
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select 
            label="Occasion" 
            value={occasion} 
            onChange={e => setOccasion(e.target.value)}
            options={[
              { value: 'casual', label: 'Casual' },
              { value: 'formal', label: 'Formal' },
              { value: 'party', label: 'Party' },
              { value: 'wedding', label: 'Wedding' },
            ]} 
          />
          <Select 
            label="Style" 
            value={style} 
            onChange={e => setStyle(e.target.value)}
            options={[
              { value: 'western', label: 'Western' },
              { value: 'indian', label: 'Indian Ethnic' },
              { value: 'fusion', label: 'Fusion' },
            ]} 
          />
        </div>
        <Button onClick={handleGenerate} loading={loading} className="w-full">
          <Sparkles size={16} /> {loading ? 'Generating...' : 'Generate Look'}
        </Button>
        {error && <p className="text-xs text-danger text-center">{error}</p>}
      </div>

      {loading && !imageUrl && (
        <div className="aspect-[4/5] bg-ivory-warm rounded-2xl border border-border-light flex flex-col items-center justify-center text-ink-muted animate-pulse">
          <ImageIcon size={32} className="mb-3 opacity-50" />
          <p className="text-sm">Designing your look...</p>
        </div>
      )}

      {imageUrl && !loading && (
        <div className="space-y-3">
          <div className="relative aspect-[4/5] w-full max-w-xl mx-auto rounded-2xl overflow-hidden shadow-card border border-border-light bg-surface">
            <img src={imageUrl} alt={prompt} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <a 
              href={imageUrl} 
              target="_blank" 
              rel="noreferrer"
              download="smartwardrobe-lookbook.jpg"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-sage-deep bg-sage-pale rounded-lg hover:bg-sage-pale/80 transition-colors"
            >
              <Download size={16} /> Download Full Image
            </a>
            <p className="text-[10px] text-ink-faint text-center max-w-sm">
              AI-generated lookbook imagery is for inspiration only. Generated securely via Pollinations AI.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}