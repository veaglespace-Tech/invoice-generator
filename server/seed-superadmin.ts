import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'superadmin@invoice.com';
  
  // Check if exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Superadmin already exists!');
    return;
  }

  const hashedPassword = await bcrypt.hash('superadmin123', 10);

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
