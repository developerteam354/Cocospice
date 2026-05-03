'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem, ExtraOption } from '../../types';

interface ExtrasModalProps {
  item: MenuItem;
  onConfirm: (item: MenuItem, selectedExtras: ExtraOption[]) => void;
  onClose: () => void;
}

export default function ExtrasModal({ item, onConfirm, onClose }: ExtrasModalProps) {
  const [selected, setSelected] = useState<ExtraOption[]>([]);

  // Normalize extras — handle old string[] format gracefully
  const extraOptions: ExtraOption[] = (item.extraOptions ?? []).map((opt) =>
    typeof opt === 'string' ? { name: opt as string, price: 0 } : opt
  );

  const extrasTotal = selected.reduce((sum, e) => sum + e.price, 0);
  const liveTotal   = item.price + extrasTotal;

  const toggle = (opt: ExtraOption) => {
    setSelected((prev) => {
      const exists = prev.some((e) => e.name === opt.name);
      return exists ? prev.filter((e) => e.name !== opt.name) : [...prev, opt];
    });
  };

  const isChecked = (opt: ExtraOption) => selected.some((e) => e.name === opt.name);

  const handleConfirm = () => {
    onConfirm(item, selected);
    onClose();
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-[rgba(15,23,42,0.6)] backdrop-blur-[6px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        />

        {/* Modal Sheet / Card */}
        <motion.div
          className="relative w-full max-w-lg bg-white sm:rounded-[32px] rounded-t-[32px] shadow-[0_24px_80px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]"
          initial={{ y: '100%', opacity: 0.8 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-7 pb-5 bg-white z-10 shrink-0">
            <div className="flex flex-col gap-1.5 pr-4">
              <span className="text-[0.75rem] font-bold uppercase tracking-[0.1em] text-[#10b981]">
                Customise your order
              </span>
              <h2 className="text-[1.6rem] font-black text-[#111827] leading-[1.1] m-0 tracking-[-0.02em]">
                {item.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-[14px] bg-[#f1f5f9] text-[#64748b] flex items-center justify-center hover:bg-[#e2e8f0] hover:text-[#0f172a] transition-colors shrink-0"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#e2e8f0] to-transparent shrink-0" />

          {/* Options List */}
          <div className="flex-1 overflow-y-auto px-6 py-6 [scrollbar-width:thin]">
            <p className="text-[0.85rem] font-bold text-[#64748b] mb-4 uppercase tracking-[0.05em]">Select extras (optional)</p>
            <div className="flex flex-col gap-3.5">
              {extraOptions.map((opt) => {
                const checked = isChecked(opt);
                return (
                  <label
                    key={opt.name}
                    className={`flex items-center gap-4 p-[18px] rounded-2xl border-[2px] cursor-pointer transition-all duration-200 select-none ${
                      checked
                        ? 'border-[#10b981] bg-[rgba(16,185,129,0.06)] shadow-[0_4px_20px_rgba(16,185,129,0.08)]'
                        : 'border-[#f1f5f9] bg-white hover:border-[#e2e8f0] hover:bg-[#f8fafc] hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)]'
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-[26px] h-[26px] rounded-[8px] border-[2px] flex items-center justify-center shrink-0 transition-all duration-200 ${
                        checked
                          ? 'bg-[#10b981] border-[#10b981] shadow-[0_0_0_4px_rgba(16,185,129,0.2)] scale-105'
                          : 'bg-white border-[#cbd5e1]'
                      }`}
                    >
                      {checked && (
                        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="2,6 5,9 10,3" />
                        </svg>
                      )}
                    </div>

                    <input
                      type="checkbox"
                      className="hidden"
                      checked={checked}
                      onChange={() => toggle(opt)}
                    />

                    <span className={`flex-1 text-[1.05rem] font-bold ${checked ? 'text-[#059669]' : 'text-[#334155]'}`}>
                      {opt.name}
                    </span>
                    <span className={`text-[1rem] font-black ${checked ? 'text-[#10b981]' : 'text-[#64748b]'}`}>
                      +£{opt.price.toFixed(2)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Footer Area */}
          <div className="bg-[#f8fafc] border-t border-[#e2e8f0] px-6 py-5 flex flex-col gap-5 shrink-0 sm:rounded-b-[32px]">
            
            {/* Totals Breakdown */}
            <div className="flex flex-col gap-2.5 px-1">
              <div className="flex justify-between items-center text-[0.95rem]">
                <span className="font-semibold text-[#64748b]">Base price</span>
                <span className="font-bold text-[#475569]">£{item.price.toFixed(2)}</span>
              </div>
              {extrasTotal > 0 && (
                <div className="flex justify-between items-center text-[0.95rem]">
                  <span className="font-semibold text-[#64748b]">Extras ({selected.length})</span>
                  <span className="font-bold text-[#10b981]">+£{extrasTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 mt-1.5 border-t border-[#e2e8f0]">
                <span className="font-bold text-[#334155] text-[1.05rem]">Total</span>
                <span className="text-[1.6rem] font-black text-[#111827] tracking-tight">£{liveTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3.5 pt-2">
              <button
                onClick={() => { onConfirm(item, []); onClose(); }}
                className="flex-[0.35] py-[16px] rounded-2xl border-2 border-[#e2e8f0] bg-white text-[#475569] font-bold text-[1rem] hover:bg-[#f1f5f9] hover:border-[#cbd5e1] hover:text-[#0f172a] transition-all active:scale-[0.98]"
              >
                Skip
              </button>
              <button
                onClick={handleConfirm}
                className="flex-[0.65] py-[16px] rounded-2xl bg-gradient-to-br from-[#10b981] to-[#059669] text-white font-extrabold text-[1.05rem] shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:-translate-y-[2px] hover:shadow-[0_12px_24px_rgba(16,185,129,0.4)] active:scale-[0.98] transition-all"
              >
                {selected.length > 0
                  ? `Confirm Add`
                  : `Add to Cart`}
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
