import { useState, useCallback, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
}

export function ImageUpload({ 
  value, 
  onChange, 
  label = 'Imagen', 
  accept = 'image/*', 
  maxSizeMB = 5 
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen');
      return false;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`La imagen no debe superar ${maxSizeMB}MB`);
      return false;
    }
    setError(null);
    return true;
  }, [maxSizeMB]);

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const data = await api.uploadImage(formData);
      
      setPreview(data.url);
      onChange(data.url);
    } catch (err: any) {
      setError(err.message);
      setPreview(null);
      onChange('');
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const handleFileSelect = useCallback((file: File | null) => {
    if (!file) return;
    if (validateFile(file)) {
      uploadFile(file);
    }
  }, [validateFile, uploadFile]);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  }, [handleFileSelect]);

  const removeImage = useCallback(() => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [onChange]);

  const triggerFileInput = () => fileInputRef.current?.click();

  return (
    <div className="space-y-3">
      <label className="text-xs text-white/40 tracking-widest uppercase block mb-1">
        {label}
      </label>
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        id={`image-upload-${label.toLowerCase().replace(/\s+/g, '-')}`}
      />

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={triggerFileInput}
        className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer ${
          dragActive 
            ? 'border-violet-500 bg-violet-500/10' 
            : 'border-white/10 hover:border-white/30 hover:bg-white/5'
        }`}
      >
        {preview ? (
          <div className="relative aspect-[4/3] min-h-[160px]">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeImage(); }}
              className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-500/90 text-white rounded-full transition-colors"
              aria-label="Eliminar imagen"
            >
              <X size={16} />
            </button>
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-[4/3] min-h-[160px] flex flex-col items-center justify-center p-6 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
              dragActive ? 'bg-violet-500/20 text-violet-400' : 'bg-white/5 text-white/40'
            }`}>
              <Upload size={28} />
            </div>
            <p className="text-sm font-medium text-white/60 mb-1">
              {dragActive ? 'Suelta la imagen aquí' : 'Arrastra una imagen o haz clic'}
            </p>
            <p className="text-xs text-white/30">JPG, PNG, WebP · Máx {maxSizeMB}MB</p>
            <input
              type="file"
              accept={accept}
              onChange={handleInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <X size={12} className="flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}