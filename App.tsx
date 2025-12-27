
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import { MotionType, AspectRatio, GenerationState, UploadedMedia } from './types';
import { GeminiService } from './services/geminiService';

const App: React.FC = () => {
  const [media, setMedia] = useState<UploadedMedia>({ image: null, video: null });
  const [motionType, setMotionType] = useState<MotionType>(MotionType.BODY);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.PORTRAIT);
  const [genState, setGenState] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    status: '',
    error: null,
    outputUrl: null
  });

  const [authRequired, setAuthRequired] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // @ts-ignore
      if (window.aistudio) {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) setAuthRequired(true);
      }
    };
    checkAuth();
  }, []);

  const handleFileSelect = async (file: File, type: 'image' | 'video') => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1];
      setMedia(prev => ({
        ...prev,
        [type]: {
          base64: base64Data,
          mimeType: file.type,
          preview: base64
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSelectKey = async () => {
    // @ts-ignore
    if (window.aistudio) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setAuthRequired(false);
    }
  };

  const generate = async () => {
    if (!media.image) return;
    
    setGenState({
      isGenerating: true,
      progress: 0,
      status: 'Analyzing character identity...',
      error: null,
      outputUrl: null
    });

    try {
      const outputUrl = await GeminiService.generateMotionVideo(
        media.image.base64,
        media.image.mimeType,
        motionType,
        aspectRatio,
        (status) => setGenState(prev => ({ ...prev, status }))
      );
      setGenState(prev => ({ ...prev, isGenerating: false, outputUrl, status: 'Success!' }));
    } catch (err: any) {
      if (err.message === "AUTH_REQUIRED") {
        setAuthRequired(true);
      }
      setGenState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: err.message || 'Generation failed. Please try again.' 
      }));
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="max-w-6xl mx-auto px-6 pt-32 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Side: Inputs */}
        <div className="lg:col-span-7 flex flex-col gap-10">
          <div className="flex flex-col md:flex-row gap-6">
            <UploadZone 
              label="1. Character Image" 
              type="image" 
              preview={media.image?.preview || null} 
              onFileSelect={(file) => handleFileSelect(file, 'image')}
            />
            <UploadZone 
              label="2. Motion Reference" 
              type="video" 
              preview={media.video?.preview || null} 
              onFileSelect={(file) => handleFileSelect(file, 'video')}
            />
          </div>

          <div className="glass p-8 rounded-3xl flex flex-col gap-8">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-sm text-slate-400">Motion Type</label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(MotionType).map(type => (
                    <button
                      key={type}
                      onClick={() => setMotionType(type)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        motionType === type 
                          ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]' 
                          : 'bg-slate-900 border-white/5 text-slate-500 hover:border-white/20'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm text-slate-400">Aspect Ratio</label>
                <div className="flex gap-2">
                  {Object.values(AspectRatio).map(ratio => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                        aspectRatio === ratio 
                          ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' 
                          : 'bg-slate-900 border-white/5 text-slate-500 hover:border-white/20'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              disabled={!media.image || genState.isGenerating}
              onClick={generate}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                !media.image || genState.isGenerating
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white glow-button'
              }`}
            >
              {genState.isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Transfer Motion
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Results */}
        <div className="lg:col-span-5">
          <div className="sticky top-32 glass rounded-3xl overflow-hidden min-h-[500px] flex flex-col">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
              <span className="text-sm font-semibold text-slate-300">Preview Engine</span>
              {genState.outputUrl && (
                <a 
                  href={genState.outputUrl} 
                  download="motion_transfer.mp4"
                  className="text-xs px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download MP4
                </a>
              )}
            </div>

            <div className="flex-1 relative flex flex-col items-center justify-center p-8 bg-black/40">
              {genState.isGenerating ? (
                <div className="text-center animate-pulse flex flex-col items-center">
                  <div className="w-20 h-20 mb-6 relative">
                    <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-cyan-500 rounded-full animate-spin"></div>
                  </div>
                  <h4 className="text-xl font-bold mb-2 tracking-tight">AI Engine Busy</h4>
                  <p className="text-sm text-slate-400 max-w-[250px] leading-relaxed">
                    {genState.status}
                  </p>
                </div>
              ) : genState.outputUrl ? (
                <video 
                  src={genState.outputUrl} 
                  className="w-full h-full object-contain rounded-xl" 
                  controls 
                  autoPlay 
                  loop 
                />
              ) : genState.error ? (
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-red-400 mb-2">Generation Error</h4>
                  <p className="text-sm text-slate-500">{genState.error}</p>
                </div>
              ) : (
                <div className="text-center flex flex-col items-center">
                  <div className="w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-white/5">
                    <svg className="w-12 h-12 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  </div>
                  <p className="text-slate-500 text-sm max-w-[200px]">Upload assets and configure your transfer to see preview.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal Overlay */}
      {authRequired && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md"></div>
          <div className="relative glass p-10 rounded-[2.5rem] max-w-md w-full shadow-2xl border-cyan-500/20 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-gradient-to-tr from-cyan-400 to-indigo-600 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-xl shadow-cyan-500/20">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-center mb-4">Gemini Veo API Access</h2>
            <p className="text-slate-400 text-center text-sm leading-relaxed mb-8">
              To use the high-performance Motion Transfer engine, you must select a valid API key from a paid Google Cloud project.
            </p>
            <button 
              onClick={handleSelectKey}
              className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-cyan-50 transition-colors flex items-center justify-center gap-2"
            >
              Select API Key
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <p className="mt-6 text-center text-xs text-slate-500">
              New to Gemini API? <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">Setup billing here.</a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
