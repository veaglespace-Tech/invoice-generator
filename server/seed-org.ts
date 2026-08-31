import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'riteshpote0603@gmail.com';
  const password = 'Veagle@123';
  
  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Create or update the organization
  const org = await prisma.organization.upsert({
    where: { email: 'contact@veaglespace.com' }, // arbitrary distinct email for org
    update: {
      name: 'VeagleSpace Org',
    },
    create: {
      name: 'VeagleSpace Org',
      email: 'contact@veaglespace.com', // org email
    },
  });

  // 2. Create or update the ADMIN user
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ORGANIZATION_ADMIN',
      organization_id: org.id
    },
    create: {
      name: 'Ritesh Pote',
      email,
      password: hashedPassword,
      role: 'ORGANIZATION_ADMIN',
      organization_id: org.id
    },
  });

  console.log('Upserted user:', user.email, 'with organization:', org.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
