import { PrismaClient } from '@prisma/client';

// One shared client for the whole app; it opens connections lazily on first query.
export const prisma = new PrismaClient();
