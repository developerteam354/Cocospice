import { Admin, type IAdmin } from '../../models/Admin.model.js';
import { BaseRepository } from '../base.repository.js';

export class AuthRepository extends BaseRepository<IAdmin> {
  constructor() {
    super(Admin);
  }

  async findByEmail(email: string): Promise<IAdmin | null> {
    return Admin.findOne({ email }).select('+password +refreshToken').exec();
  }

  async updateRefreshToken(id: string, token: string | null): Promise<void> {
    await Admin.findByIdAndUpdate(id, { refreshToken: token }).exec();
  }

  async findByRefreshToken(token: string): Promise<IAdmin | null> {
    return Admin.findOne({ refreshToken: token }).exec();
  }
}

export const authRepository = new AuthRepository();
