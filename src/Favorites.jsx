import React from 'react';
import { Star, Trash2 } from 'lucide-react';

const removeQuestionMarks = (value) => String(value ?? "").replace(/\?/g, "").trim();

const Favorites = ({ favorites, onSelect, onRemove }) => {
  if (favorites.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-white/60 text-xs uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
        <Star size={14} className="fill-yellow-400 text-yellow-400" /> Sevimli shaharlar
      </h3>
      <div className="flex flex-wrap gap-2">
        {favorites.map((favCity) => (
          <div key={favCity} className="flex items-center bg-white/10 hover:bg-white/20 transition-all rounded-full pl-4 pr-2 py-1 group cursor-pointer">
            <button 
              onClick={() => onSelect(favCity)}
              className="text-white text-sm font-medium mr-2 cursor-pointer"
            >
              {removeQuestionMarks(favCity)}
            </button>
            <button 
              onClick={() => onRemove(favCity)}
              className="text-white/30 hover:text-red-400 transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;
