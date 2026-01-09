import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArtMatrix, Particle } from '../types';
import { Maximize2, Pause, Play, SkipForward } from 'lucide-react';

interface PixelWallProps {
  artCollection: ArtMatrix[];
}

export const PixelWall: React.FC<PixelWallProps> = ({ artCollection }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Animation State
  const [currentArtIndex, setCurrentArtIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [progress, setProgress] = useState(0);

  // Simulation Refs (to avoid re-renders during animation loop)
  const particlesRef = useRef<Particle[]>([]);
  const landedGridRef = useRef<(string | null)[][]>([]);
  const pendingPixelsRef = useRef<{x: number, y: number, color: string}[]>([]);
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const phaseRef = useRef<'building' | 'waiting'>('building');
  const phaseTimerRef = useRef<number>(0);
  
  // Configuration
  const GRAVITY = 0.002;
  const SPAWN_RATE = 2; // Pixels per frame
  const WAIT_DURATION = 3000; // Time to admire completed art

  // Initialize a new piece of art
  const initArt = useCallback((index: number) => {
    if (!artCollection[index]) return;

    const art = artCollection[index];
    
    // Reset grids
    landedGridRef.current = Array(art.height).fill(null).map(() => Array(art.width).fill(null));
    particlesRef.current = [];
    
    // Create list of all pixels that need to fall
    const pending: {x: number, y: number, color: string}[] = [];
    art.grid.forEach((row, y) => {
      row.forEach((color, x) => {
        if (color) {
          pending.push({ x, y, color });
        }
      });
    });

    // Shuffle pending pixels for random drop effect
    for (let i = pending.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pending[i], pending[j]] = [pending[j], pending[i]];
    }
    
    pendingPixelsRef.current = pending;
    phaseRef.current = 'building';
    setProgress(0);
  }, [artCollection]);

  // Handle Resize
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });
  
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          w: containerRef.current.clientWidth,
          h: containerRef.current.clientHeight
        });
      }
    };
    
    // Initial size
    handleResize();

    // Listen to window resize
    window.addEventListener('resize', handleResize);
    
    // Also observe the container specifically (useful for fullscreen transitions)
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
        observer.observe(containerRef.current);
    }

    return () => {
        window.removeEventListener('resize', handleResize);
        observer.disconnect();
    };
  }, []);

  // Sync fullscreen state with browser events (e.g. ESC key)
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  // Main Loop
  useEffect(() => {
    if (artCollection.length === 0) return;
    
    // Initial setup if needed
    if (landedGridRef.current.length === 0) {
      initArt(currentArtIndex);
    }

    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      if (!isPlaying) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const art = artCollection[currentArtIndex];

      if (canvas && ctx && art) {
        // Clear
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate Scale to fit
        const scaleX = canvas.width / art.width;
        const scaleY = canvas.height / art.height;
        const cellSize = Math.min(scaleX, scaleY) * 0.9; // 90% fill to leave margin
        
        const offsetX = (canvas.width - (art.width * cellSize)) / 2;
        const offsetY = (canvas.height - (art.height * cellSize)) / 2;

        // Logic
        if (phaseRef.current === 'building') {
            // Spawn new particles
            if (pendingPixelsRef.current.length > 0) {
                for(let i=0; i<SPAWN_RATE; i++) {
                    const p = pendingPixelsRef.current.pop();
                    if (p) {
                        particlesRef.current.push({
                            x: p.x,
                            y: -5 - (Math.random() * 10), // Start above screen
                            targetY: p.y,
                            color: p.color,
                            velocity: 0,
                            landed: false
                        });
                    }
                }
            } else if (particlesRef.current.length === 0) {
                // Done building
                phaseRef.current = 'waiting';
                phaseTimerRef.current = time;
            }
        } else if (phaseRef.current === 'waiting') {
             if (time - phaseTimerRef.current > WAIT_DURATION) {
                 // Next art
                 const nextIndex = (currentArtIndex + 1) % artCollection.length;
                 setCurrentArtIndex(nextIndex);
                 initArt(nextIndex);
             }
        }

        // Update Particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const p = particlesRef.current[i];
            
            // Physics
            p.velocity += GRAVITY * dt;
            p.y += p.velocity * (dt / 16); // Normalize roughly to 60fps

            // Collision with bottom (target)
            if (p.y >= p.targetY) {
                p.y = p.targetY;
                p.landed = true;
                // Add to static grid
                landedGridRef.current[p.targetY][p.x] = p.color;
                // Remove from particles
                particlesRef.current.splice(i, 1);
            }
        }

        // Draw Static Grid
        landedGridRef.current.forEach((row, y) => {
            row.forEach((color, x) => {
                if (color) {
                    ctx.fillStyle = color;
                    // Add slight gap for grid effect
                    ctx.fillRect(
                        offsetX + x * cellSize + 1, 
                        offsetY + y * cellSize + 1, 
                        cellSize - 2, 
                        cellSize - 2
                    );
                }
            });
        });

        // Draw Falling Particles
        particlesRef.current.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.fillRect(
                offsetX + p.x * cellSize + 1,
                offsetY + p.y * cellSize + 1,
                cellSize - 2,
                cellSize - 2
            );
        });
        
        // Progress Calc
        const total = art.grid.flat().filter(Boolean).length;
        const pending = pendingPixelsRef.current.length;
        setProgress(((total - pending) / total) * 100);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [currentArtIndex, artCollection, isPlaying, initArt]);

  // Fullscreen toggle logic
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        // Request fullscreen on the document to cover everything, but we will hide UI elements via state
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error enabling full-screen mode: ${err.message}`);
        });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const skipTrack = () => {
      const nextIndex = (currentArtIndex + 1) % artCollection.length;
      setCurrentArtIndex(nextIndex);
      initArt(nextIndex);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center bg-black">
      <canvas 
        ref={canvasRef} 
        width={dimensions.w} 
        height={dimensions.h}
        className="block"
      />
      
      {/* Controls Overlay - Hidden in fullscreen */}
      {!isFullScreen && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-neutral-900/50 backdrop-blur-md p-3 rounded-2xl border border-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300 z-50">
           <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors" title={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
           </button>
           
           <div className="w-px h-6 bg-white/20"></div>

           <button onClick={skipTrack} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors" title="Next Art">
              <SkipForward size={24} />
           </button>

           <div className="w-px h-6 bg-white/20"></div>

           <button onClick={toggleFullScreen} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors" title="Full Screen">
              <Maximize2 size={24} />
           </button>
        </div>
      )}

      {/* Info Overlay - Hidden in fullscreen */}
      {!isFullScreen && (
        <div className="absolute bottom-8 right-8 text-right opacity-50 pointer-events-none hidden md:block z-40">
            <h2 className="text-2xl font-bold text-white">{artCollection[currentArtIndex]?.name}</h2>
            <p className="text-sm text-neutral-400">