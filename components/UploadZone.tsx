
import React, { useState, useCallback } from 'react';

interface UploadZoneProps {
  label: string;
  type: 'image' | 'video';
  onFileSelect: (file: File) => void;
  preview: string | null;
}

const UploadZone: React.FC<UploadZoneProps> = ({ label, type, onFileSelect, preview }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputId = `upload-${type}`;
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Basic validation based on the zone type
      if (type === 'image' && file.type.startsWith('image/')) {
        onFileSelect(file);
      } else if (type === 'video' && file.type.startsWith('video/')) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect, type]);

  return (
    <div className="flex flex-col gap-3 flex-1">
      <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">{label}</label>
      <div 
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group aspect-video md:aspect-square rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
          isDragging 
            ? 'border-cyan-400 bg-cyan-500/10 scale-[1.02] shadow-[0_0_20px_rgba(34,211,238,0.2)]' 
            : 'border-slate-800 hover:border-cyan-500/50 bg-slate-900/50'
        }`}
      >
        <input
          type="file"
          id={inputId}
          accept={type === 'image' ? 'image/*' : 'video/*'}
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
        />
        
        {preview ? (
          <div className="w-full h-full relative">
            {type === 'image' ? (
              <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
            ) : (
              <video src={preview} className="w-full h-full object-cover" muted loop autoPlay />
            )}
            <div className={`absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <span className="px-4 py-2 glass rounded-full text-xs font-medium">
                {isDragging ? `Drop to Replace` : `Replace ${type}`}
              </span>
            </div>
          </div>
        ) : (
          <div className={`w-full h-full flex flex-col items-center justify-center gap-4 transition-colors ${isDragging ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'}`}>
            <div className={`p-4 rounded-full transition-all duration-300 ${isDragging ? 'bg-cyan-500/20 scale-110 shadow-lg' : 'bg-slate-900 shadow-inner'}`}>
              {type === 'image' ? (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold">{isDragging ? 'Drop it now!' : `Drop your ${type} here`}</p>
              <p className="text-xs font-light">{isDragging ? 'Ready to process' : 'or click to browse'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadZone;
