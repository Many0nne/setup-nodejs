import { getPrisma } from '../db/client';

export const UserRepository = {
  create: async (email: string, passwordHash: string) => {
    return getPrisma().user.create({ data: { email, passwordHash } });
  },
  findByEmail: async (email: string) => {
    return getPrisma().user.findUnique({ where: { email } });
  },
  findById: async (id: string) => {
    return getPrisma().user.findUnique({ where: { id } });
  },
};
