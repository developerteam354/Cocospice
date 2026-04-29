export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  profileImage: string;
  joinedDate: string;
  createdAt: string;
}

export interface IUserStats {
  totalUsers: number;
}

export interface IUserFilters {
  search?: string;
}
