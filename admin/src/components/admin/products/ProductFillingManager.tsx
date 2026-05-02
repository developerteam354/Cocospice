'use client';

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

interface ProductFillingManagerProps {
  filling: string[];
  onChange: (filling: string[]) => void;
}

export default function ProductFillingManager({ filling, onChange }: ProductFillingManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const addFilling = () => {
    const value = inputRef.current?.value.trim() ?? '';
    if (!value) return;
    
    // Check for duplicates (case-insensitive)
    if (filling.some(f => f.toLowerCase() === value.toLowerCase())) {
      inputRef.current!.value = '';
      return;
    }
    
    onChange([...filling, value]);
    inputRef.current!.value = '';
    inputRef.current?.focus();
  };

  const removeFilling = (index: number) => {
    onChange(filling.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFilling();
    }
  };

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
        Product Filling
        <span className="ml-2 text-xs font-normal normal-case text-slate-500">
          (e.g., Veg, Chicken, Beef) - Press Enter or click + to add
        </span>
      </h2>

      {/* Input row */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="Filling type (e.g., Veg, Chicken)"
          onKeyDown={handleKeyDown}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
        />
        <button
          type="button"
          onClick={addFilling}
          className="flex items-center justify-center rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 text-indigo-400 hover:bg-indigo-500/20 active:scale-95 transition-all"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Filling list */}
      <AnimatePresence>
        {filling.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-wrap gap-2"
          >
            {filling.map((item, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 pl-3 pr-2 py-1 text-sm text-emerald-300"
              >
                <span className="font-medium">{item}</span>
                <button
                  type="button"
                  onClick={() => removeFilling(i)}
                  className="ml-0.5 rounded-full p-0.5 text-emerald-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                >
                  <X size={12} />
                </button>
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {filling.length === 0 && (
        <p className="text-xs text-slate-500 italic">
          No filling options added. If this product doesn't require filling selection, leave it empty.
        </p>
      )}
    </section>
  );
}
