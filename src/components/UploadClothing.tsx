import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function UploadClothing() {
  const [uploading, setUploading] = useState(false);
  const [cleanImageUrl, setCleanImageUrl] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);

    // Prepare the file to be sent to the backend
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Send to the FastAPI endpoint we built in Phase 1
      // Replace with your VITE_API_BASE_URL if you have one configured
      const response = await fetch("http://localhost:8000/api/upload-clothing", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // The backend returns the file path, so we prepend the backend URL to view it
        setCleanImageUrl(`http://localhost:8000${data.file_url}`);
      } else {
        console.error("Upload failed");
      }
    } catch (error) {
      console.error("Error connecting to backend:", error);
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    multiple: false
  });

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add to Digital Wardrobe</h2>
      
      {/* Drag & Drop Zone */}
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <p className="text-blue-500 font-semibold animate-pulse">AI is removing the background...</p>
        ) : isDragActive ? (
          <p className="text-blue-500">Drop the photo here!</p>
        ) : (
          <div>
            <p className="text-gray-600">Drag & drop a clothing photo here, or click to select</p>
            <p className="text-sm text-gray-400 mt-2">Supports JPG, PNG</p>
          </div>
        )}
      </div>

      {/* Result Display */}
      {cleanImageUrl && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3">Cleaned Image Ready:</h3>
          <div className="bg-gray-100 p-4 rounded-xl flex justify-center">
            <img 
              src={cleanImageUrl} 
              alt="Cleaned clothing" 
              className="max-h-64 object-contain shadow-sm rounded-lg bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}