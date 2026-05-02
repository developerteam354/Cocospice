'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Eye, EyeOff, Trash2, Search } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchCategories,
  addCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
  resetCategoryState,
} from '@/store/slices/categorySlice';
import type { ICategory } from '@/types/category';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import CategoryModal from '@/components/admin/category/CategoryModal';

const rowVariants = {
  hidden:   { opacity: 0, y: 8 },
  visible:  (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.3 } }),
  exit:     { opacity: 0, x: -16, transition: { duration: 0.2 } },
};

export default function CategoryPage() {
  const dispatch = useAppDispatch();
  const { categories, loading, error } = useAppSelector((state) => state.category);
  
  const [filtered,   setFiltered]   = useState<ICategory[]>([]);
  const [search,     setSearch]     = useState('');
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editing,    setEditing]    = useState<ICategory | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Filter by search
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q ? categories.filter((c) => c.name.toLowerCase().includes(q)) : categories);
  }, [search, categories]);

  const openCreate = () => { 
    dispatch(resetCategoryState()); 
    setEditing(null); 
    setModalOpen(true); 
  };
  
  const openEdit = (cat: ICategory) => { 
    dispatch(resetCategoryState()); 
    setEditing(cat); 
    setModalOpen(true); 
  };

  const handleCloseModal = () => {
    dispatch(resetCategoryState());
    setModalOpen(false);
  };

  const handleSave = async (data: { name: string; description: string; categoryImage?: File }) => {
    const tid = toast.loading(editing ? 'Updating...' : 'Creating...');
    try {
      if (editing) {
        await dispatch(updateCategory({ id: editing._id, payload: data })).unwrap();
        toast.success('Category updated', { id: tid });
        setModalOpen(false);
      } else {
        await dispatch(addCategory(data)).unwrap();
        toast.success('Category created', { id: tid });
        setModalOpen(false);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save category';
      toast.error(errorMessage, { id: tid });
      // Don't rethrow - let modal stay open so user can fix the error
    }
  };

  const handleToggle = async (cat: ICategory) => {
    try {
      const result = await dispatch(toggleCategoryStatus(cat._id)).unwrap();
      toast.success(result.isListed ? 'Category listed' : 'Category unlisted');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleDelete = async (cat: ICategory) => {
    if (!confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    const tid = toast.loading('Deleting...');
    try {
      await dispatch(deleteCategory(cat._id)).unwrap();
      toast.success('Category deleted', { id: tid });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete', { id: tid });
    }
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: { background: 'rgba(15,23,42,0.95)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
      }} />

      <CategoryModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        initial={editing}
      />

      <div className="space-y-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Categories</h1>
            <p className="text-sm text-slate-400">
              {search ? `${filtered.length} of ${categories.length}` : `${categories.length} total`}
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus size={16} /> Add Category
          </Button>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
          className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3 hidden md:table-cell">Description</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-8 animate-pulse rounded-lg bg-white/5" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-slate-500">
                    No categories yet. Click "Add Category" to create one.
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filtered.map((cat, i) => (
                    <motion.tr key={cat._id} custom={i}
                      variants={rowVariants} initial="hidden" animate="visible" exit="exit"
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      {/* Name */}
                      <td className="px-4 py-3 font-medium text-white">{cat.name}</td>
                      {/* Description */}
                      <td className="hidden px-4 py-3 text-slate-400 md:table-cell max-w-xs truncate">
                        {cat.description || '—'}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        <Badge variant={cat.isListed ? 'green' : 'slate'}>
                          {cat.isListed ? 'Listed' : 'Unlisted'}
                        </Badge>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(cat)} title="Edit"
                            className="rounded-lg p-2 text-slate-400 hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => handleToggle(cat)}
                            title={cat.isListed ? 'Unlist' : 'List'}
                            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors">
                            {cat.isListed ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                          <button onClick={() => handleDelete(cat)} title="Delete"
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </motion.div>
      </div>
    </>
  );
}
