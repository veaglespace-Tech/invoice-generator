const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
async function main() {
  const hashedPassword = await bcrypt.hash('Veagle@123', 10);
  await prisma.user.update({
    where: { email: 'riteshpote0603@gmail.com' },
    data: { password: hashedPassword }
  });
  console.log('Password reset successfully');
}
main().finally(() => prisma.$disconnect());
