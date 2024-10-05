import { PrismaClient } from '@prisma/client';

// use `prisma` in your application to read and write data in your DB
let prisma = new PrismaClient();

export default prisma;
