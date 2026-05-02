'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { IMenuOption } from '@/types/product';

interface ProductOptionsManagerProps {
  options: IMenuOption[];
  onChange: (options: IMenuOption[]) => void;
}

export default function ProductOptionsManager({ options, onChange }: ProductOptionsManagerProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const optionNameRef = useRef<HTMLInputElement>(null);
  const choiceInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const addOption = () => {
    const name = optionNameRef.current?.value.trim();
    if (!name) return;

    const newOption: IMenuOption = {
      name,
      choices: [],
      required: false,
    };

    onChange([...options, newOption]);
    if (optionNameRef.current) optionNameRef.current.value = '';
    setExpandedIndex(options.length); // Expand the newly added option
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const updateOptionName = (index: number, name: string) => {
    const updated = [...options];
    updated[index] = { ...updated[index], name };
    onChange(updated);
  };

  const toggleRequired = (index: number) => {
    const updated = [...options];
    updated[index] = { ...updated[index], required: !updated[index].required };
    onChange(updated);
  };

  const addChoice = (optionIndex: number) => {
    const input = choiceInputRefs.current[optionIndex];
    const choice = input?.value.trim();
    if (!choice) return;

    const updated = [...options];
    updated[optionIndex] = {
      ...updated[optionIndex],
      choices: [...updated[optionIndex].choices, choice],
    };
    onChange(updated);
    if (input) input.value = '';
  };

  const removeChoice = (optionIndex: number, choiceIndex: number) => {
    const updated = [...options];
    updated[optionIndex] = {
      ...updated[optionIndex],
      choices: updated[optionIndex].choices.filter((_, i) => i !== choiceIndex),
    };
    onChange(updated);
  };

  const handleChoiceKeyDown = (e: React.KeyboardEvent, optionIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addChoice(optionIndex);
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
        Product Options
        <span className="ml-2 text-xs font-normal normal-case text-slate-500">
          (e.g., Spice Level, Size, Filling Type)
        </span>
      </h2>

      {/* Add New Option */}
      <div className="flex gap-2">
        <input
          ref={optionNameRef}
          type="text"
          placeholder="Option name (e.g., Spice Level)"
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
        />
        <button
          type="button"
          onClick={addOption}
          className="flex items-center justify-center rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 text-indigo-400 hover:bg-indigo-500/20 active:scale-95 transition-all"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Options List */}
      <AnimatePresence>
        {options.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {options.map((option, optionIndex) => {
              const isExpanded = expandedIndex === optionIndex;

              return (
                <motion.div
                  key={optionIndex}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
                >
                  {/* Option Header */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        type="button"
                        onClick={() => setExpandedIndex(isExpanded ? null : optionIndex)}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={option.name}
                          onChange={(e) => updateOptionName(optionIndex, e.target.value)}
                          className="w-full bg-transparent text-sm font-medium text-white outline-none"
                          placeholder="Option name"
                        />
                        <p className="text-xs text-slate-500 mt-0.5">
                          {option.choices.length} choice{option.choices.length !== 1 ? 's' : ''}
                          {option.required && ' • Required'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleRequired(optionIndex)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          option.required
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}
                      >
                        {option.required ? 'Required' : 'Optional'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeOption(optionIndex)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content - Choices */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-white/10 bg-white/5 p-4 space-y-3"
                      >
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Choices
                        </p>

                        {/* Add Choice Input */}
                        <div className="flex gap-2">
                          <input
                            ref={(el) => {
                              choiceInputRefs.current[optionIndex] = el;
                            }}
                            type="text"
                            placeholder="Add choice (e.g., Mild, Medium, Hot)"
                            onKeyDown={(e) => handleChoiceKeyDown(e, optionIndex)}
                            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50"
                          />
                          <button
                            type="button"
                            onClick={() => addChoice(optionIndex)}
                            className="flex items-center justify-center rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 text-indigo-400 hover:bg-indigo-500/20 transition-all"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Choices List */}
                        {option.choices.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {option.choices.map((choice, choiceIndex) => (
                              <motion.span
                                key={choiceIndex}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 pl-3 pr-2 py-1 text-sm text-indigo-300"
                              >
                                <span className="font-medium">{choice}</span>
                                <button
                                  type="button"
                                  onClick={() => removeChoice(optionIndex, choiceIndex)}
                                  className="ml-0.5 rounded-full p-0.5 text-indigo-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                >
                                  <X size={12} />
                                </button>
                              </motion.span>
                            ))}
                          </div>
                        )}

                        {option.choices.length === 0 && (
                          <p className="text-xs text-slate-500 italic">No choices added yet</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {options.length === 0 && (
        <p className="text-sm text-slate-500 italic text-center py-4">
          No product options added. Options allow customers to customize their order (e.g., spice level, size).
        </p>
      )}
    </section>
  );
}
