import React, { useState, useEffect } from 'react';
import { Plus, Package, ExternalLink, ArrowRight, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { ProductInfo, ModuleData, Template, ModuleType } from './types';
import { STRATEGIES, MODULE_DEFINITIONS } from './constants';
import { generateModuleContent } from './services/geminiService';
import ProductForm from './components/ProductForm';
import StrategySelector from './components/StrategySelector';
import ModuleEditor from './components/ModuleEditor';

const App: React.FC = () => {
  // --- State ---
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    url: '',
    name: '',
    brand: '',
    primaryMessage: '',
    description: '',
    keyFeatures: [],
    targetAudience: '',
    tone: 'Professional & Trustworthy'
  });

  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [generatingState, setGeneratingState] = useState<Record<string, boolean>>({});

  // --- Handlers ---

  // Demo Autofill
  const fillDemoData = () => {
    setProductInfo({
      url: 'https://www.amazon.com/dp/B07X...',
      name: 'ErgoLift Pro Standing Desk Converter',
      brand: 'OfficeZen',
      primaryMessage: 'Instantly transform any desk into a sit-stand workspace without expensive installation.',
      description: 'Transform your workspace with the ErgoLift Pro. This height-adjustable desk converter sits on top of your existing desk, allowing you to switch between sitting and standing in seconds. Features a spacious 32" surface, keyboard tray, and smooth gas spring lift mechanism.',
      keyFeatures: [
        'Smooth Gas Spring Lift: Adjust height with one hand.',
        'Two-Tier Design: Spacious upper deck for monitors, lower for keyboard.',
        'No Assembly Required: Use right out of the box.',
        'Sturdy Steel Frame: Supports up to 33lbs.',
        'Tablets/Phone Slot: Built-in device holder.'
      ],
      targetAudience: 'Remote workers, office employees, people with back pain',
      tone: 'Productivity-focused, Healthy, Modern'
    });
  };

  // Select Strategy
  const handleSelectStrategy = (template: Template) => {
    setSelectedStrategyId(template.id);
    
    // Create initial module data structures based on the template
    const newModules: ModuleData[] = template.modules.map(type => {
      const base: ModuleData = {
        id: uuidv4(),
        type: type,
        headline: '',
        body: '',
        imagePrompt: ''
      };

      // Initialize sub-items structure if needed
      if ([ModuleType.THREE_IMAGES_TEXT, ModuleType.FOUR_IMAGES_TEXT, ModuleType.COMPARISON_CHART, ModuleType.SINGLE_IMAGE_HIGHLIGHTS, ModuleType.KEY_PROPOSITION].includes(type)) {
        let count = 3;
        if (type === ModuleType.FOUR_IMAGES_TEXT) count = 4;
        
        base.subItems = Array(count).fill(null).map(() => ({
            headline: '',
            body: '',
            imagePrompt: ''
        }));
      }
      return base;
    });

    setModules(newModules);
  };

  // Add Manual Module
  const addModule = (type: ModuleType) => {
     const base: ModuleData = {
        id: uuidv4(),
        type: type,
        headline: '',
        body: ''
      };
      if ([ModuleType.THREE_IMAGES_TEXT, ModuleType.FOUR_IMAGES_TEXT, ModuleType.COMPARISON_CHART, ModuleType.SINGLE_IMAGE_HIGHLIGHTS, ModuleType.KEY_PROPOSITION].includes(type)) {
          base.subItems = Array(3).fill({ headline: '', body: '' });
      }
      setModules([...modules, base]);
  };

  // Update Module
  const updateModule = (id: string, data: Partial<ModuleData>) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  };

  // Delete Module
  const deleteModule = (id: string) => {
    setModules(prev => prev.filter(m => m.id !== id));
  };

  // Generate Content with Gemini
  const generateContent = async (moduleId: string) => {
    const moduleToGen = modules.find(m => m.id === moduleId);
    if (!moduleToGen) return;

    setGeneratingState(prev => ({ ...prev, [moduleId]: true }));

    try {
      const generatedData = await generateModuleContent(moduleToGen.type, productInfo);
      
      // Merge generated data carefully
      updateModule(moduleId, {
        headline: generatedData.headline || moduleToGen.headline,
        body: generatedData.body || moduleToGen.body,
        imagePrompt: generatedData.imagePrompt || moduleToGen.imagePrompt,
        subItems: generatedData.subItems || moduleToGen.subItems
      });

    } catch (e) {
      console.error("Generation failed", e);
      alert("Failed to generate content. Please ensure API Key is set and try again.");
    } finally {
      setGeneratingState(prev => ({ ...prev, [moduleId]: false }));
    }
  };

  const generateAll = async () => {
      // Execute sequentially to avoid rate limits if any, though flash is fast.
      for (const m of modules) {
          await generateContent(m.id);
      }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Navbar */}
      <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="text-orange-400" />
            <span className="font-bold text-xl tracking-tight">Amz <span className="text-orange-400">A+</span> Architect</span>
          </div>
          <div className="text-xs text-gray-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            Powered by Gemini 2.5
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Build High-Converting A+ Content <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">at Hyperspeed</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Input your product URL or details, choose a strategy, and let AI structure your Amazon narrative.
          </p>
        </div>

        {/* Step 1: Product Context */}
        <section>
            <ProductForm 
                productInfo={productInfo} 
                setProductInfo={setProductInfo} 
                onGenerateDemo={fillDemoData} 
            />
        </section>

        {/* Step 2: Strategy Selection */}
        <section>
            <StrategySelector 
                selectedTemplateId={selectedStrategyId} 
                onSelectTemplate={handleSelectStrategy} 
            />
        </section>

        {/* Step 3: The Builder */}
        {modules.length > 0 && (
            <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <Package className="text-blue-600" size={24} />
                        3. Content Builder
                    </h2>
                    <button 
                        onClick={generateAll}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                    >
                        <Sparkles size={18} className="text-orange-400" />
                        Generate All Content
                    </button>
                </div>
                
                <div className="space-y-6">
                    {modules.map((module, index) => (
                        <ModuleEditor
                            key={module.id}
                            index={index}
                            moduleData={module}
                            onUpdate={updateModule}
                            onDelete={deleteModule}
                            onGenerate={generateContent}
                            isGenerating={!!generatingState[module.id]}
                        />
                    ))}
                </div>

                {/* Add Module Controls */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <p className="text-center text-sm text-gray-500 mb-4">Add specific modules manually</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {Object.entries(MODULE_DEFINITIONS).map(([type, def]) => (
                             <button
                                key={type}
                                onClick={() => addModule(type as ModuleType)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:border-blue-400 hover:text-blue-600 transition-all text-sm font-medium text-gray-600"
                             >
                                <Plus size={14} />
                                {def.name}
                             </button>
                        ))}
                    </div>
                </div>
            </section>
        )}

        {/* Empty State for Step 3 */}
        {modules.length === 0 && productInfo.name && (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400">Select a strategy above to initialize the builder.</p>
            </div>
        )}

      </main>
    </div>
  );
};

export default App;