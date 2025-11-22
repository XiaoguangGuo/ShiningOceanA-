import React from 'react';
import { ProductInfo } from '../types';
import { Save, Sparkles } from 'lucide-react';

interface Props {
  productInfo: ProductInfo;
  setProductInfo: React.Dispatch<React.SetStateAction<ProductInfo>>;
  onGenerateDemo: () => void;
}

const ProductForm: React.FC<Props> = ({ productInfo, setProductInfo, onGenerateDemo }) => {
  const handleChange = (field: keyof ProductInfo, value: any) => {
    setProductInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (value: string) => {
    // Split by new lines for simplicity in UI
    const features = value.split('\n').filter(f => f.trim() !== '');
    handleChange('keyFeatures', features);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-gray-800">1. Product Context</h2>
        <button 
          onClick={onGenerateDemo}
          className="text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full hover:bg-purple-100 transition-colors flex items-center gap-1"
        >
          <Sparkles size={12} />
          Auto-Fill Demo
        </button>
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Description (Paste listing text)</label>
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
          placeholder="- 40,000 VPM Motor&#10;- 3 Week Battery Life&#10;- Waterproof"
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
