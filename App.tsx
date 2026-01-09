import React, { useState, useEffect } from 'react';
import { Layout, Image, Settings } from 'lucide-react';
import { PixelWall } from './components/PixelWall';
import { ImageConverter } from './components/ImageConverter';
import { ArtManager } from './components/ArtManager';
import { SAMPLE_ART } from './constants';
import { ArtMatrix } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'wall' | 'converter' | 'manage'>('wall');
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Initialize from localStorage or fallback to sample
  const [artCollection, setArtCollection] = useState<ArtMatrix[]>(() => {
    try {
        const saved = localStorage.getItem('pixelWallArt');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {
        console.error("Failed to load saved art", e);
    }
    return SAMPLE_ART;
  });

  // Persist changes to localStorage
  useEffect(() => {
    localStorage.setItem('pixelWallArt', JSON.stringify(artCollection));
  }, [artCollection]);

  // Track fullscreen state to hide UI
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const handleAddGeneratedArt = (newArt: ArtMatrix) => {
    setArtCollection((prev) => [...prev, newArt]);
  };

  const handleRemoveArt = (index: number) => {
      if (artCollection.length <= 1) return;
      setArtCollection((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full h-screen flex flex-col bg-neutral-950 text-neutral-100 overflow-hidden font-sans">
      {/* Navigation Header - Hidden in Fullscreen */}
      {!isFullScreen && (
        <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
              <Layout className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block">Pixel Drop</h1>
          </div>
          
          <div className="flex gap-2 pointer-events-auto bg-neutral-900/80 backdrop-blur-md p-1 rounded-full border border-neutral-800">
            <button
              onClick={() => setCurrentView('wall')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-medium ${
                currentView === 'wall' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Layout className="w-4 h-4" />
              Wall
            </button>
            <button
              onClick={() => setCurrentView('converter')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-medium ${
                currentView === 'converter' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Image className="w-4 h-4" />
              Converter
            </button>
            <button
              onClick={() => setCurrentView('manage')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-medium ${
                currentView === 'manage' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              Manage
            </button>
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <main className="flex-1 relative w-full h-full">
        {currentView === 'wall' && (
          <PixelWall artCollection={artCollection} />
        )}
        {currentView === 'converter' && (
          <ImageConverter onImport={handleAddGeneratedArt} />
        )}
        {currentView === 'manage' && (
          <ArtManager 
            artCollection={artCollection} 
            onRemove={handleRemoveArt}
            onAdd={handleAddGeneratedArt}
          />
        )}
      </main>
    </div>
  );
}