'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.prisma = void 0;
var _env = require('./config/env');
var _app = _interopRequireDefault(require('./app'));
var _client = require('@prisma/client');
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
const PORT = _env.env.PORT;

// Base Prisma Client
const basePrisma = new _client.PrismaClient();

// Prisma Client with Soft Delete Extension
const prisma = (exports.prisma = basePrisma.$extends({
  query: {
    $allModels: {
      // We cannot use $allModels for soft deletes because not all models have the is_deleted field.
      // We will define it for specific models below, but Prisma extension syntax requires us to define them per-model or use model names.
    },
    organization: softDeleteExt(),
    user: softDeleteExt(),
    customer: softDeleteExt(),
    product: softDeleteExt(),
    invoice: softDeleteExt()
  }
})); // Cast back to PrismaClient to maintain expected type signatures in the rest of the app

function softDeleteExt() {
  return {
    async findMany({ args, query }) {
      args.where = {
        is_deleted: false,
        ...args.where
      };
      return query(args);
    },
    async findUnique({ args, query }) {
      args.where = {
        is_deleted: false,
        ...args.where
      };
      return query(args);
    },
    async findFirst({ args, query }) {
      args.where = {
        is_deleted: false,
        ...args.where
      };
      return query(args);
    },
    async count({ args, query }) {
      args.where = {
        is_deleted: false,
        ...args.where
      };
      return query(args);
    }
  };
}
async function startServer() {
  try {
    // Connect to database
    await prisma.$connect();
    console.log('Successfully connected to database');
    _app.default.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}
startServer();
