import { getPrisma } from '../db/client';

export interface RefreshTokenCreateInput {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export const RefreshTokenRepository = {
  create: async (data: RefreshTokenCreateInput) => {
    return getPrisma().refreshToken.create({ data });
  },
  findByHash: async (tokenHash: string) => {
    return getPrisma().refreshToken.findUnique({ where: { tokenHash } });
  },
  revokeById: async (id: string) => {
    return getPrisma().refreshToken.update({ where: { id }, data: { revokedAt: new Date() } });
  },
  revokeAllForUser: async (userId: string) => {
    return getPrisma().refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },
};
