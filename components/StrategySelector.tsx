import React from 'react';
import { Template } from '../types';
import { STRATEGIES } from '../constants';
import { Layers, CheckCircle } from 'lucide-react';

interface Props {
  selectedTemplateId: string | null;
  onSelectTemplate: (template: Template) => void;
}

const StrategySelector: React.FC<Props> = ({ selectedTemplateId, onSelectTemplate }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Layers className="text-blue-600" size={24} />
        2. Choose Your Strategy
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STRATEGIES.map((strategy) => (
          <div
            key={strategy.id}
            onClick={() => onSelectTemplate(strategy)}
            className={`cursor-pointer relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
              selectedTemplateId === strategy.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-100 hover:border-blue-200'
            }`}
          >
            {selectedTemplateId === strategy.id && (
              <div className="absolute top-3 right-3 text-blue-600">
                <CheckCircle size={20} fill="currentColor" className="text-blue-100" />
              </div>
            )}
            <h3 className="font-bold text-gray-800 mb-2">{strategy.name}</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">{strategy.description}</p>
            <div className="flex flex-wrap gap-1">
              {strategy.modules.slice(0, 3).map((m, i) => (
                 <span key={i} className="text-[10px] bg-gray-200 text-gray-700 px-2 py-1 rounded-md">
                    {m.split('_').map(w => w[0]).join('')}
                 </span>
              ))}
              {strategy.modules.length > 3 && <span className="text-[10px] text-gray-400 py-1">+ {strategy.modules.length - 3}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StrategySelector;
