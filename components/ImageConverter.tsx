import React, { useState, useRef, ChangeEvent } from 'react';
import { Upload, Download, Sliders, Play, Trash2, CheckCircle } from 'lucide-react';
import { ArtMatrix } from '../types';

interface ImageConverterProps {
    onImport: (art: ArtMatrix) => void;
}

export const ImageConverter: React.FC<ImageConverterProps> = ({ onImport }) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [gridWidth, setGridWidth] = useState<number>(32);
    const [threshold, setThreshold] = useState<number>(128); // Alpha threshold
    const [previewMatrix, setPreviewMatrix] = useState<ArtMatrix | null>(null);
    const [name, setName] = useState("My Pixel Art");
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setImageSrc(event.target.result as string);
                    setPreviewMatrix(null);
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const processImage = () => {
        if (!imageSrc || !canvasRef.current) return;

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = canvasRef.current!;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;

            // Calculate height based on aspect ratio
            const aspectRatio = img.height / img.width;
            const gridHeight = Math.round(gridWidth * aspectRatio);

            canvas.width = gridWidth;
            canvas.height = gridHeight;

            // Draw image scaled down
            ctx.clearRect(0,0, gridWidth, gridHeight);
            ctx.drawImage(img, 0, 0, gridWidth, gridHeight);

            // Extract pixel data
            const imageData = ctx.getImageData(0, 0, gridWidth, gridHeight);
            const data = imageData.data;
            const grid: (string | null)[][] = [];

            for (let y = 0; y < gridHeight; y++) {
                const row: (string | null)[] = [];
                for (let x = 0; x < gridWidth; x++) {
                    const index = (y * gridWidth + x) * 4;
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];
                    const a = data[index + 3];

                    if (a > 0) {
                        // Convert RGB to Hex
                        const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
                        row.push(hex);
                    } else {
                        row.push(null);
                    }
                }
                grid.push(row);
            }

            const newMatrix: ArtMatrix = {
                name: name,
                width: gridWidth,
                height: gridHeight,
                grid: grid
            };

            setPreviewMatrix(newMatrix);
        };
        img.src = imageSrc;
    };

    const downloadJson = () => {
        if (!previewMatrix) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(previewMatrix));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${name.replace(/\s+/g, '_').toLowerCase()}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImport = () => {
        if(previewMatrix) {
            onImport(previewMatrix);
            alert("Added to the Wall! Switch tabs to view it.");
        }
    };

    return (
        <div className="w-full h-full overflow-y-auto bg-neutral-900 p-8 pt-24">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-white">Image to Matrix Converter</h2>
                    <p className="text-neutral-400">Upload an image to convert it into a compatible JSON matrix for the pixel wall.</p>
                </div>

                {/* Main Card */}
                <div className="bg-neutral-800 rounded-2xl p-6 shadow-xl border border-neutral-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Left Column: Input */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-neutral-300">1. Select Image</label>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-neutral-600 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-neutral-700/50 transition-all group"
                                >
                                    {imageSrc ? (
                                        <img src={imageSrc} alt="Preview" className="max-h-48 object-contain rounded shadow-sm" />
                                    ) : (
                                        <>
                                            <Upload className="w-10 h-10 text-neutral-500 group-hover:text-indigo-400 mb-2" />
                                            <span className="text-neutral-400 group-hover:text-neutral-200">Click to upload</span>
                                        </>
                                    )}
                                    <input 
                                        ref={fileInputRef} 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-neutral-300">2. Configuration</label>
                                
                                <div>
                                    <label className="text-xs text-neutral-500 mb-1 block">Art Name</label>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="text-xs text-neutral-500">Grid Width (Pixels)</label>
                                        <span className="text-xs text-indigo-400 font-mono">{gridWidth}px</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="8" 
                                        max="128" 
                                        value={gridWidth} 
                                        onChange={(e) => setGridWidth(parseInt(e.target.value))}
                                        className="w-full accent-indigo-500 h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                <button 
                                    onClick={processImage}
                                    disabled={!imageSrc}
                                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-700 disabled:text-neutral-500 text-white font-semibold py-3 rounded-lg transition-colors"
                                >
                                    <Sliders className="w-4 h-4" />
                                    Convert to Matrix
                                </button>
                            </div>
                        </div>

                        {/* Right Column: Preview */}
                        <div className="space-y-6 flex flex-col">
                            <div className="space-y-2 flex-1 flex flex-col">
                                <label className="block text-sm font-medium text-neutral-300">3. Preview & Export</label>
                                <div className="bg-black/50 rounded-xl border border-neutral-700 flex-1 flex items-center justify-center p-4 relative min-h-[300px]">
                                    <canvas ref={canvasRef} className="hidden" /> {/* Hidden canvas for processing */}
                                    
                                    {previewMatrix ? (
                                        <div 
                                            className="grid gap-[1px] bg-neutral-900"
                                            style={{
                                                gridTemplateColumns: `repeat(${previewMatrix.width}, 1fr)`,
                                                width: '100%',
                                                maxWidth: '400px',
                                                aspectRatio: `${previewMatrix.width}/${previewMatrix.height}`
                                            }}
                                        >
                                            {previewMatrix.grid.map((row, y) => 
                                                row.map((col, x) => (
                                                    <div 
                                                        key={`${x}-${y}`} 
                                                        style={{ backgroundColor: col || 'transparent' }} 
                                                        className="w-full h-full"
                                                    />
                                                ))
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-neutral-600 text-sm italic">
                                            Preview will appear here
                                        </div>
                                    )}
                                </div>
                            </div>

                            {previewMatrix && (
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={handleImport}
                                        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-medium py-2 rounded-lg transition-colors"
                                    >
                                        <Play className="w-4 h-4" />
                                        Add to Wall
                                    </button>
                                    <button 
                                        onClick={downloadJson}
                                        className="flex items-center justify-center gap-2 bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-2 rounded-lg transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download JSON
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};