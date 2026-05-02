'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users as UsersIcon,
  Search,
  UserCheck,
  UserX,
  ShieldOff,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { fetchAllUsers, fetchUserStats, toggleUserStatus } from '@/store/slices/userSlice';
import type { IUser } from '@/types/user';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

const toProxyUrl = (urlOrKey: string): string => {
  if (!urlOrKey) return '';
  if (urlOrKey.includes('/upload/image')) return urlOrKey;
  const s3Match = urlOrKey.match(/amazonaws\.com\/(.+)$/);
  const key = s3Match ? s3Match[1] : urlOrKey;
  return `${API_BASE}/api/admin/upload/image?key=${encodeURIComponent(key)}`;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// ─── Avatar ───────────────────────────────────────────────────────────────────

function UserAvatar({ user }: { user: IUser }) {
  const [err, setErr] = useState(false);
  const proxyUrl = user.profileImage ? toProxyUrl(user.profileImage) : '';

  return (
    <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center shrink-0">
      {proxyUrl && !err ? (
        <img
          src={proxyUrl}
          alt={user.name}
          className="h-full w-full object-cover"
          onError={() => setErr(true)}
        />
      ) : (
        <span className="text-sm font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}

// ─── Row variants ─────────────────────────────────────────────────────────────

const rowVariants = {
  hidden:  { opacity: 0, y: 8 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.03, duration: 0.25 } }),
  exit:    { opacity: 0, x: -16, transition: { duration: 0.2 } },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const { users, stats, isLoading, statsLoading, toggling, error } =
    useAppSelector((s: RootState) => s.users);

  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');

  useEffect(() => {
    dispatch(fetchAllUsers());
    dispatch(fetchUserStats());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const filteredUsers = useMemo(() => {
    let result = [...users];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    if (statusFilter === 'active')  result = result.filter(u => u.isActive);
    if (statusFilter === 'blocked') result = result.filter(u => !u.isActive);
    return result;
  }, [users, search, statusFilter]);

  const handleToggle = async (user: IUser) => {
    const nextState = user.isActive ? 'blocked' : 'unblocked';
    try {
      await dispatch(toggleUserStatus(user._id)).unwrap();
      toast.success(`${user.name} has been ${nextState}`);
    } catch {
      toast.error('Failed to update user status');
    }
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

        {/* ── Page Header ── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            {statsLoading
              ? 'Loading…'
              : `${stats.total} total · ${stats.active} active · ${stats.blocked} blocked`}
          </p>
        </motion.div>

        {/* ── Stat Cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {([
            { label: 'Total Users',   value: stats.total,   Icon: UsersIcon,  from: 'from-indigo-500/15',  to: 'to-indigo-600/10',  iconCls: 'bg-indigo-500/20 text-indigo-400'  },
            { label: 'Active Users',  value: stats.active,  Icon: UserCheck,  from: 'from-emerald-500/15', to: 'to-emerald-600/10', iconCls: 'bg-emerald-500/20 text-emerald-400' },
            { label: 'Blocked Users', value: stats.blocked, Icon: UserX,      from: 'from-red-500/15',     to: 'to-red-600/10',     iconCls: 'bg-red-500/20 text-red-400'         },
          ] as const).map(({ label, value, Icon, from, to, iconCls }) => (
            <div
              key={label}
              className={`overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${from} ${to} p-5 backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
                  {statsLoading ? (
                    <div className="mt-2 h-8 w-14 animate-pulse rounded bg-white/10" />
                  ) : (
                    <p className="mt-1 text-3xl font-bold text-white">{value}</p>
                  )}
                </div>
                <div className={`rounded-xl p-3 ${iconCls}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Filters ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          <div className="flex gap-2">
            {(['all', 'active', 'blocked'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold capitalize transition-colors ${
                  statusFilter === f
                    ? 'bg-indigo-600 text-white'
                    : 'border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Table ── */}
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
                <th className="px-4 py-3 hidden lg:table-cell">Joined</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-9 animate-pulse rounded-lg bg-white/5" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-500">
                    {search || statusFilter !== 'all' ? 'No users match your filters' : 'No users found'}
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
                          <UserAvatar user={user} />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-white">{user.name}</p>
                            <p className="truncate text-xs text-slate-400 md:hidden">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="hidden px-4 py-3 text-slate-400 md:table-cell">
                        {user.email}
                      </td>

                      {/* Joined */}
                      <td className="hidden px-4 py-3 text-slate-400 lg:table-cell">
                        {formatDate(user.createdAt)}
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            user.isActive
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-red-500/15 text-red-400'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          {user.isActive ? 'Active' : 'Blocked'}
                        </span>
                      </td>

                      {/* Block / Unblock */}
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleToggle(user)}
                            disabled={toggling === user._id}
                            title={user.isActive ? 'Block this user' : 'Unblock this user'}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                              user.isActive
                                ? 'border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                                : 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                          >
                            {toggling === user._id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : user.isActive ? (
                              <ShieldOff size={13} />
                            ) : (
                              <ShieldCheck size={13} />
                            )}
                            <span className="hidden sm:inline">
                              {toggling === user._id
                                ? 'Updating…'
                                : user.isActive ? 'Block' : 'Unblock'}
                            </span>
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

        {!isLoading && filteredUsers.length > 0 && (
          <p className="text-center text-xs text-slate-500">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        )}
      </div>
    </>
  );
}
