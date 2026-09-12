import React from 'react';
import { 
  Package, 
  Layers, 
  TreePine, 
  ShieldAlert, 
  Wine, 
  Box, 
  FileText, 
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { CATEGORIES } from '../data/constants';

const categoryIcons = {
  Cardboard: Package,
  Plastic: Layers,
  Wood: TreePine,
  Metal: ShieldAlert,
  Glass: Wine,
  "Foam/Packaging": Box,
  Paper: FileText,
  "Textile/Jute": ShoppingBag
};

export default function CategoryChips({ selectedCategory, onSelectCategory, counts = {} }) {
  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none">
      <div className="flex items-center gap-2 min-w-max">
        {/* All Button */}
        <button
          onClick={() => onSelectCategory('All')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
            selectedCategory === 'All'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>All Materials</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
            selectedCategory === 'All' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
          }`}>
            {counts.total || 45}
          </span>
        </button>

        {/* Categories */}
        {CATEGORIES.map((cat) => {
          const Icon = categoryIcons[cat] || Package;
          const isSelected = selectedCategory === cat;
          const catCount = counts.byCategory?.[cat] || 0;

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                isSelected
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-md scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50/60 hover:border-emerald-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-200' : 'text-emerald-600'}`} />
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {catCount}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
