'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { ICategory } from '@/types/category';

const schema = z.object({
  name:        z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface CategoryModalProps {
  open:     boolean;
  onClose:  () => void;
  onSave:   (data: { name: string; description: string }) => Promise<void>;
  initial?: ICategory | null;
}

export default function CategoryModal({ open, onClose, onSave, initial }: CategoryModalProps) {
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  // Populate form when editing
  useEffect(() => {
    if (initial) {
      reset({ name: initial.name, description: initial.description });
    } else {
      reset({ name: '', description: '' });
    }
  }, [initial, open, reset]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      await onSave({ name: data.name, description: data.description ?? '' });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  {initial ? 'Edit Category' : 'Add Category'}
                </h2>
                <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input 
                  label="Category Name" 
                  placeholder="e.g. Starters, Main Course, Desserts" 
                  error={errors.name?.message} 
                  {...register('name')} 
                />
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-300">Description (Optional)</label>
                  <textarea 
                    rows={3} 
                    placeholder="Brief description of this category..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/60 resize-none transition-all"
                    {...register('description')} 
                  />
                  {errors.description && (
                    <span className="text-xs text-red-400">{errors.description.message}</span>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={saving} className="flex-1">
                    {initial ? 'Save Changes' : 'Create Category'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
