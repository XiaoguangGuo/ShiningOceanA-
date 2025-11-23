import React, { useState } from 'react';
import { ModuleData, ModuleType, GenerationStatus } from '../types';
import { MODULE_DEFINITIONS } from '../constants';
import { Trash2, RefreshCw, Copy, Sparkles, Camera, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  moduleData: ModuleData;
  onUpdate: (id: string, data: Partial<ModuleData>) => void;
  onDelete: (id: string) => void;
  onGenerate: (id: string) => void;
  isGenerating: boolean;
  index: number;
}

const ModuleEditor: React.FC<Props> = ({ moduleData, onUpdate, onDelete, onGenerate, isGenerating, index }) => {
  const def = MODULE_DEFINITIONS[moduleData.type];
  const [isExpanded, setIsExpanded] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);

  // Copy text helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast here
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            <div className={`p-2 rounded-lg shadow-sm ${moduleData.type === ModuleType.KEY_PROPOSITION ? 'bg-yellow-100 text-yellow-600' : 'bg-white text-gray-600'}`}>
                <def.icon size={20} />
            </div>
            <div>
                <h3 className="font-semibold text-gray-800 text-sm md:text-base">{index + 1}. {def.name}</h3>
                <p className="text-xs text-gray-500">{def.dimensions}</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onGenerate(moduleData.id)}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isGenerating 
                ? 'bg-gray-100 text-gray-400 cursor-wait' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
            }`}
          >
             {isGenerating ? <RefreshCw size={14} className="animate-spin"/> : <Sparkles size={14} />}
             {isGenerating ? 'Thinking...' : 'Generate Content'}
          </button>
          <button onClick={() => onDelete(moduleData.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={18} />
          </button>
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-gray-400 hover:text-gray-600">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Content Body */}
      {isExpanded && (
        <div className="p-6 flex flex-col lg:flex-row gap-8">
            
          {/* Left: Inputs */}
          <div className="flex-1 space-y-4">
            {/* Headline Field */}
            {moduleData.type !== ModuleType.COMPANY_LOGO && (
                <div className="group relative">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Headline</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={moduleData.headline || ''} 
                            onChange={(e) => onUpdate(moduleData.id, { headline: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Generate or type headline..."
                        />
                        <button onClick={() => copyToClipboard(moduleData.headline || '')} className="text-gray-400 hover:text-blue-600 p-2"><Copy size={16}/></button>
                    </div>
                </div>
            )}

            {/* Body Text Field */}
            {moduleData.type !== ModuleType.COMPANY_LOGO && (
                 <div className="group relative">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Body Copy</label>
                    <div className="flex gap-2">
                        <textarea 
                            value={moduleData.body || ''} 
                            onChange={(e) => onUpdate(moduleData.id, { body: e.target.value })}
                            rows={4}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            placeholder="Generate or type body text..."
                        />
                        <button onClick={() => copyToClipboard(moduleData.body || '')} className="text-gray-400 hover:text-blue-600 p-2 h-fit"><Copy size={16}/></button>
                    </div>
                 </div>
            )}

            {/* Sub Items (Bullets/Cards) */}
            {moduleData.subItems && moduleData.subItems.length > 0 && (
                <div className="space-y-3 mt-4">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Feature Highlights / Cards</label>
                    {moduleData.subItems.map((item, idx) => (
                        <div key={idx} className="p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white transition-colors">
                            <div className="flex justify-between mb-2">
                                <span className="text-xs font-bold text-gray-400">Item {idx + 1}</span>
                                {item.imagePrompt && (
                                    <span className="text-[10px] text-purple-600 flex items-center gap-1 bg-purple-100 px-2 py-0.5 rounded-full">
                                        <Camera size={10} /> Photo Brief Available
                                    </span>
                                )}
                            </div>
                            <input 
                                type="text" 
                                value={item.headline}
                                onChange={(e) => {
                                    const newSub = [...(moduleData.subItems || [])];
                                    newSub[idx] = { ...newSub[idx], headline: e.target.value };
                                    onUpdate(moduleData.id, { subItems: newSub });
                                }}
                                className="w-full mb-2 px-2 py-1 border-b border-transparent focus:border-blue-300 bg-transparent text-sm font-medium focus:outline-none"
                                placeholder="Sub-headline"
                            />
                            <textarea 
                                value={item.body}
                                onChange={(e) => {
                                    const newSub = [...(moduleData.subItems || [])];
                                    newSub[idx] = { ...newSub[idx], body: e.target.value };
                                    onUpdate(moduleData.id, { subItems: newSub });
                                }}
                                rows={2}
                                className="w-full px-2 py-1 border-b border-transparent focus:border-blue-300 bg-transparent text-xs text-gray-600 focus:outline-none resize-none"
                                placeholder="Description"
                            />
                        </div>
                    ))}
                </div>
            )}
          </div>

          {/* Right: Visual Preview / Wireframe */}
          <div className="w-full lg:w-1/2 bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Visual Wireframe</span>
                <button 
                    onClick={() => setShowPrompt(!showPrompt)}
                    className="text-xs text-purple-600 hover:underline"
                >
                    {showPrompt ? 'Hide Art Direction' : 'Show Art Direction'}
                </button>
            </div>

            {/* Conditional Rendering for Layouts */}
            <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 relative overflow-hidden min-h-[200px]">
                 {/* Header Image Style */}
                 {moduleData.type === ModuleType.HEADER_IMAGE_TEXT && (
                    <div className="w-full h-full flex flex-col relative">
                         <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                            <span className="text-sm font-medium">970x600 Image Area</span>
                         </div>
                         {moduleData.headline && (
                             <div className="absolute bottom-4 left-4 right-4 bg-white/90 p-4 rounded shadow-sm backdrop-blur-sm">
                                 <h4 className="font-bold text-gray-900 text-lg">{moduleData.headline}</h4>
                                 <p className="text-gray-700 text-sm mt-1 line-clamp-2">{moduleData.body}</p>
                             </div>
                         )}
                    </div>
                 )}
                 
                 {/* Single Image & Highlight (Sidebar) Style - Also used for Key Proposition */}
                 {(moduleData.type === ModuleType.SINGLE_IMAGE_HIGHLIGHTS || moduleData.type === ModuleType.KEY_PROPOSITION) && (
                    <div className="w-full h-full p-4 flex gap-4 items-center">
                        <div className="w-1/3 aspect-square bg-gray-200 rounded flex items-center justify-center relative">
                            <Camera size={20} className="text-gray-400" />
                            {moduleData.type === ModuleType.KEY_PROPOSITION && (
                                <div className="absolute top-0 right-0 p-1 bg-yellow-400 rounded-bl-lg">
                                    <Sparkles size={12} className="text-white"/>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-3/4 bg-gray-300 rounded mb-2"></div>
                            <div className="space-y-1">
                                <div className="h-2 w-full bg-gray-100 rounded"></div>
                                <div className="h-2 w-full bg-gray-100 rounded"></div>
                                <div className="h-2 w-5/6 bg-gray-100 rounded"></div>
                            </div>
                            <div className="space-y-1 mt-2">
                                <div className="h-2 w-1/2 bg-gray-200 rounded"></div>
                                <div className="h-2 w-1/2 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                 )}

                 {/* Standard 3/4 Images Style */}
                 {(moduleData.type === ModuleType.THREE_IMAGES_TEXT || moduleData.type === ModuleType.FOUR_IMAGES_TEXT) && (
                     <div className="w-full h-full p-2 flex gap-2 items-start overflow-x-auto">
                         {moduleData.subItems?.map((item, i) => (
                             <div key={i} className="flex-1 min-w-[80px] flex flex-col gap-1">
                                 <div className="aspect-square bg-gray-200 rounded-md flex items-center justify-center">
                                    <Camera size={16} className="text-gray-400" />
                                 </div>
                                 <div className="h-2 w-3/4 bg-gray-300 rounded"></div>
                                 <div className="h-10 w-full bg-gray-100 rounded text-[8px] p-1 overflow-hidden text-gray-400">
                                    {item.body}
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}

                 {/* Default fallback */}
                 {![ModuleType.HEADER_IMAGE_TEXT, ModuleType.THREE_IMAGES_TEXT, ModuleType.FOUR_IMAGES_TEXT, ModuleType.SINGLE_IMAGE_HIGHLIGHTS, ModuleType.KEY_PROPOSITION].includes(moduleData.type) && (
                     <div className="text-center p-4">
                         <def.icon className="mx-auto text-gray-300 mb-2" size={48} />
                         <p className="text-gray-400 text-sm">Visual Preview</p>
                     </div>
                 )}
                 
                 {/* Overlay Image Prompt */}
                 {showPrompt && (moduleData.imagePrompt || moduleData.subItems?.[0]?.imagePrompt) && (
                     <div className="absolute inset-0 bg-purple-900/90 text-white p-6 overflow-y-auto z-10">
                         <h4 className="font-bold text-purple-200 mb-2 flex items-center gap-2">
                            <Camera size={16} /> Art Direction / Photo Brief
                         </h4>
                         <p className="text-sm italic leading-relaxed mb-4">
                            "{moduleData.imagePrompt}"
                         </p>
                         {moduleData.subItems?.map((s, i) => s.imagePrompt && (
                             <div key={i} className="mb-2">
                                 <span className="text-xs font-bold text-purple-300 uppercase">Image {i+1}:</span>
                                 <p className="text-xs text-gray-300">"{s.imagePrompt}"</p>
                             </div>
                         ))}
                     </div>
                 )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ModuleEditor;