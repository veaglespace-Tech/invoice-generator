"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const email = 'superadmin@invoice.com';
    // Check if exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log('Superadmin already exists!');
        return;
    }
    const hashedPassword = await bcrypt_1.default.hash('superadmin123', 10);
    const user = await prisma.user.create({
        data: {
            name: 'Super Admin',
            email,
            password: hashedPassword,
            role: 'SUPER_ADMIN',
        },
    });
    console.log('Created superadmin user:', user.email, 'password: superadmin123');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-superadmin.js.map