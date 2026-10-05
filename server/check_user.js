const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findFirst({where: {email: 'veaglespaceritesh@gmail.com'}}).then(u => console.log(JSON.stringify(u, null, 2))).finally(() => prisma.$disconnect());
