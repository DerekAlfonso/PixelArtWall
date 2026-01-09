import React, { useRef } from 'react';
import { Trash2, Upload, FileJson, AlertCircle } from 'lucide-react';
import { ArtMatrix } from '../types';

interface ArtManagerProps {
  artCollection: ArtMatrix[];
  onRemove: (index: number) => void;
  onAdd: (art: ArtMatrix) => void;
}

export const ArtManager: React.FC<ArtManagerProps> = ({ artCollection, onRemove, onAdd }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Basic validation
        if (json.width && json.height && Array.isArray(json.grid)) {
           // Ensure it has a name
           if (!json.name) json.name = file.name.replace('.json', '');
           onAdd(json);
           alert(`Successfully imported "${json.name}"`);
        } else {
            alert("Invalid file format. Missing width, height, or grid data.");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-neutral-900 p-8 pt-24">
       <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-white">Manage Collection</h2>
              <p className="text-neutral-400">Organize your animation sequence or import new designs.</p>
          </div>

          {/* Import Section */}
          <div className="bg-neutral-800 rounded-2xl p-6 shadow-xl border border-neutral-700">
             <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-400" />
                Import JSON
             </h3>
             <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-600 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-neutral-700/50 transition-all group"
             >
                <FileJson className="w-10 h-10 text-neutral-500 group-hover:text-indigo-400 mb-2" />
                <span className="text-neutral-400 group-hover:text-neutral-200">Click to upload .json matrix file</span>
                <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept=".json" 
                    className="hidden" 
                    onChange={handleFileUpload}
                />
             </div>
          </div>

          {/* List Section */}
          <div className="space-y-4">
             <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                Current Playlist
                <span className="text-xs bg-neutral-700 text-neutral-300 px-2 py-1 rounded-full">{artCollection.length}</span>
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {artCollection.map((art, idx) => (
                    <div key={idx} className="bg-neutral-800 p-4 rounded-xl border border-neutral-700 flex items-center justify-between group hover:border-neutral-600 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-black/50 rounded-lg flex items-center justify-center text-xs text-neutral-500 font-mono border border-neutral-700">
                                {art.width}x{art.height}
                            </div>
                            <div>
                                <h4 className="font-medium text-white">{art.name || `Untitled Art ${idx + 1}`}</h4>
                                <p className="text-xs text-neutral-500">Matrix Index: {idx}</p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => onRemove(idx)}
                            disabled={artCollection.length <= 1}
                            className="p-2 text-neutral-500 hover:text-red-400 disabled:opacity-30 disabled:hover:text-neutral-500 transition-colors"
                            title={artCollection.length <= 1 ? "Cannot remove last item" : "Remove"}
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                ))}
             </div>
             {artCollection.length <= 1 && (
                 <p className="text-xs text-amber-500/80 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    At least one animation is required.
                 </p>
             )}
          </div>
       </div>
    </div>
  );
};