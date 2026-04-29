import type { IUser, IUserStats } from '@/types/user';

// Mock data for development
const MOCK_USERS: IUser[] = [
  {
    _id: '1',
    fullName: 'Alice Thompson',
    email: 'alice.thompson@example.com',
    profileImage: 'https://i.pravatar.cc/150?img=1',
    joinedDate: '2025-12-15T10:30:00Z',
    createdAt: '2025-12-15T10:30:00Z',
  },
  {
    _id: '2',
    fullName: 'Benjamin Carter',
    email: 'ben.carter@example.com',
    profileImage: 'https://i.pravatar.cc/150?img=12',
    joinedDate: '2026-01-10T14:20:00Z',
    createdAt: '2026-01-10T14:20:00Z',
  },
  {
    _id: '3',
    fullName: 'Catherine Davis',
    email: 'catherine.d@example.com',
    profileImage: 'https://i.pravatar.cc/150?img=5',
    joinedDate: '2026-02-05T09:15:00Z',
    createdAt: '2026-02-05T09:15:00Z',
  },
  {
    _id: '4',
    fullName: 'Daniel Martinez',
    email: 'daniel.martinez@example.com',
    profileImage: 'https://i.pravatar.cc/150?img=13',
    joinedDate: '2026-03-12T16:45:00Z',
    createdAt: '2026-03-12T16:45:00Z',
  },
  {
    _id: '5',
    fullName: 'Emma Wilson',
    email: 'emma.wilson@example.com',
    profileImage: 'https://i.pravatar.cc/150?img=9',
    joinedDate: '2026-03-20T11:00:00Z',
    createdAt: '2026-03-20T11:00:00Z',
  },
  {
    _id: '6',
    fullName: 'Frank Anderson',
    email: 'frank.a@example.com',
    profileImage: 'https://i.pravatar.cc/150?img=14',
    joinedDate: '2026-04-01T13:30:00Z',
    createdAt: '2026-04-01T13:30:00Z',
  },
  {
    _id: '7',
    fullName: 'Grace Taylor',
    email: 'grace.taylor@example.com',
    profileImage: 'https://i.pravatar.cc/150?img=10',
    joinedDate: '2026-04-10T08:20:00Z',
    createdAt: '2026-04-10T08:20:00Z',
  },
  {
    _id: '8',
    fullName: 'Henry Johnson',
    email: 'henry.j@example.com',
    profileImage: 'https://i.pravatar.cc/150?img=15',
    joinedDate: '2026-04-18T15:10:00Z',
    createdAt: '2026-04-18T15:10:00Z',
  },
];

const userService = {
  // Simulate API call with 1-second delay
  getAll: async (): Promise<IUser[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...MOCK_USERS]), 1000);
    });
  },

  getStats: async (): Promise<IUserStats> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stats: IUserStats = {
          totalUsers: MOCK_USERS.length,
        };
        resolve(stats);
      }, 1000);
    });
  },

  // Ready for future API integration
  // getAll: async (): Promise<IUser[]> => {
  //   const { data } = await privateApi.get<{ users: IUser[] }>('/users');
  //   return data.users;
  // },

  // getStats: async (): Promise<IUserStats> => {
  //   const { data } = await privateApi.get<IUserStats>('/users/stats');
  //   return data;
  // },
};

export default userService;
