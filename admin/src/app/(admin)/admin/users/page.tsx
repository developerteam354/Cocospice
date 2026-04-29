'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Users as UsersIcon, Search, MoreHorizontal } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { fetchAllUsers, fetchUserStats } from '@/store/slices/userSlice';
import type { IUser } from '@/types/user';

// ─── Row Animation Variants ───────────────────────────────────────────────────

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.3 },
  }),
  exit: { opacity: 0, x: -16, transition: { duration: 0.2 } },
};

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const { users, totalUsers, isLoading, statsLoading } = useAppSelector(
    (state: RootState) => state.users
  );

  const [search, setSearch] = useState('');

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchAllUsers());
    dispatch(fetchUserStats());
  }, [dispatch]);

  // Filter users by search
  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15,23,42,0.95)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />

      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <p className="text-sm text-slate-400">
              {filteredUsers.length} of {users.length} users
            </p>
          </div>
        </motion.div>

        {/* Total Users Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 p-6 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Total Registered Users
              </p>
              {statsLoading ? (
                <div className="mt-2 h-10 w-20 animate-pulse rounded bg-white/10" />
              ) : (
                <p className="mt-1 text-4xl font-bold text-white">{totalUsers}</p>
              )}
            </div>
            <div className="rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 p-4 text-indigo-400">
              <UsersIcon size={32} />
            </div>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative max-w-md"
        >
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3 hidden md:table-cell">Email</th>
                <th className="px-4 py-3 hidden lg:table-cell">Joined Date</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-10 animate-pulse rounded-lg bg-white/5" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-slate-500">
                    {search ? 'No users match your search' : 'No users found'}
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredUsers.map((user, i) => (
                    <motion.tr
                      key={user._id}
                      custom={i}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10 shrink-0">
                            <Image
                              src={user.profileImage}
                              alt={user.fullName}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-white">
                              {user.fullName}
                            </p>
                            <p className="truncate text-xs text-slate-400 md:hidden">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="hidden px-4 py-3 text-slate-400 md:table-cell">
                        {user.email}
                      </td>

                      {/* Joined Date */}
                      <td className="hidden px-4 py-3 text-slate-400 lg:table-cell">
                        {formatDate(user.joinedDate)}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => alert(`View details for ${user.fullName}`)}
                            title="More Details"
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors"
                          >
                            <MoreHorizontal size={14} />
                            <span className="hidden sm:inline">More Details</span>
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
