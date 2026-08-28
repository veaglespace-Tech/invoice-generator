import { env } from './config/env';
import app from './app';
import { PrismaClient } from '@prisma/client';

const PORT = env.PORT;

// Base Prisma Client
const basePrisma = new PrismaClient();

// Prisma Client with Soft Delete Extension
export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      // We cannot use $allModels for soft deletes because not all models have the is_deleted field.
      // We will define it for specific models below, but Prisma extension syntax requires us to define them per-model or use model names.
    },
    organization: softDeleteExt(),
    user: softDeleteExt(),
    customer: softDeleteExt(),
    product: softDeleteExt(),
    invoice: softDeleteExt(),
  }
}) as unknown as PrismaClient; // Cast back to PrismaClient to maintain expected type signatures in the rest of the app

function softDeleteExt() {
  return {
    async findMany({ args, query }: any) {
      args.where = { is_deleted: false, ...args.where };
      return query(args);
    },
    async findUnique({ args, query }: any) {
      args.where = { is_deleted: false, ...args.where };
      return query(args);
    },
    async findFirst({ args, query }: any) {
      args.where = { is_deleted: false, ...args.where };
      return query(args);
    },
    async count({ args, query }: any) {
      args.where = { is_deleted: false, ...args.where };
      return query(args);
    }
  }
}

async function startServer() {
  try {
    // Connect to database
    await prisma.$connect();
    console.log('Successfully connected to database');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
