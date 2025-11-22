import React, { useState } from 'react';
import { ProductInfo } from '../types';
import { Save, Sparkles, Link, Search, Loader2, ExternalLink } from 'lucide-react';
import { analyzeProductFromUrl } from '../services/geminiService';

interface Props {
  productInfo: ProductInfo;
  setProductInfo: React.Dispatch<React.SetStateAction<ProductInfo>>;
  onGenerateDemo: () => void;
}

const ProductForm: React.FC<Props> = ({ productInfo, setProductInfo, onGenerateDemo }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sources, setSources] = useState<string[]>([]);

  const handleChange = (field: keyof ProductInfo, value: any) => {
    setProductInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (value: string) => {
    // Split by new lines for simplicity in UI
    const features = value.split('\n').filter(f => f.trim() !== '');
    handleChange('keyFeatures', features);
  };

  const handleAnalyzeUrl = async () => {
    if (!productInfo.url) return;
    
    setIsAnalyzing(true);
    setSources([]);
    
    try {
      const { data, sources: extractedSources } = await analyzeProductFromUrl(productInfo.url);
      
      setProductInfo(prev => ({
        ...prev,
        name: data.name || prev.name,
        brand: data.brand || prev.brand,
        description: data.description || prev.description,
        keyFeatures: data.keyFeatures || prev.keyFeatures,
        targetAudience: data.targetAudience || prev.targetAudience,
        tone: data.tone || prev.tone
      }));
      
      setSources(extractedSources);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Could not analyze the URL. Please try again or fill manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <h2 className="text-xl font-semibold text-gray-800">1. Product Context</h2>
        <button 
          onClick={onGenerateDemo}
          className="text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full hover:bg-purple-100 transition-colors flex items-center gap-1"
        >
          <Sparkles size={12} />
          Auto-Fill Demo
        </button>
      </div>
      
      {/* URL Input Section */}
      <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Link size={16} className="text-blue-600" />
            Raw Material URL
            <span className="text-xs font-normal text-gray-500">(Amazon listing, Shopify store, etc.)</span>
        </label>
        <div className="flex gap-2">
            <input
                type="text"
                value={productInfo.url || ''}
                onChange={(e) => handleChange('url', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="https://www.amazon.com/..."
            />
            <button
                onClick={handleAnalyzeUrl}
                disabled={isAnalyzing || !productInfo.url}
                className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 text-white transition-all ${
                    isAnalyzing || !productInfo.url 
                    ? 'bg-blue-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                }`}
            >
                {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                {isAnalyzing ? 'Analyzing...' : 'Analyze Link'}
            </button>
        </div>
        
        {/* Source Display */}
        {sources.length > 0 && (
            <div className="mt-3 text-xs text-gray-500 animate-fade-in">
                <p className="font-semibold mb-1">Analysis based on:</p>
                <ul className="list-disc pl-4 space-y-1">
                    {sources.slice(0, 3).map((src, idx) => (
                        <li key={idx} className="truncate max-w-lg">
                            <a href={src} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                                {src} <ExternalLink size={10} />
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input
            type="text"
            value={productInfo.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="e.g. SonicClean Electric Toothbrush"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
          <input
            type="text"
            value={productInfo.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="e.g. BrightSmile"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Description (Listing Text)</label>
        <textarea
          value={productInfo.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          placeholder="Paste your current bullet points or rough description here..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Key Features (One per line)</label>
        <textarea
          value={productInfo.keyFeatures.join('\n')}
          onChange={(e) => handleArrayChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          placeholder="- Feature 1&#10;- Feature 2&#10;- Feature 3"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
          <input
            type="text"
            value={productInfo.targetAudience}
            onChange={(e) => handleChange('targetAudience', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="e.g. Busy professionals, health conscious"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand Tone</label>
          <select
            value={productInfo.tone}
            onChange={(e) => handleChange('tone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          >
            <option value="Professional & Trustworthy">Professional & Trustworthy</option>
            <option value="Exciting & Energetic">Exciting & Energetic</option>
            <option value="Luxury & Minimalist">Luxury & Minimalist</option>
            <option value="Friendly & Approachable">Friendly & Approachable</option>
            <option value="Technical & Detailed">Technical & Detailed</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;