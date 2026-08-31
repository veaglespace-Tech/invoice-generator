'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({
    where: {
      email: 'riteshpote0603@gmail.com'
    }
  });
  console.log(user);
}
main().finally(() => prisma.$disconnect());
