import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-unused-vars,no-var
  var prismaClient: PrismaClient | undefined;
}

export const prisma = global.prismaClient || new PrismaClient(); // eslint-disable-line no-unused-vars

if (process.env.NODE_ENV !== 'production') global.prismaClient = prisma;
