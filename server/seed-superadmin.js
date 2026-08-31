'use strict';

var _client = require('@prisma/client');
var _bcrypt = _interopRequireDefault(require('bcrypt'));
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
const prisma = new _client.PrismaClient();
async function main() {
  const email = 'veaglespaceritesh@gmail.com';
  const hashedPassword = await _bcrypt.default.hash('Veagle@123', 10);
  const user = await prisma.user.upsert({
    where: {
      email
    },
    update: {
      password: hashedPassword,
      role: 'SUPER_ADMIN'
    },
    create: {
      name: 'Super Admin',
      email,
      password: hashedPassword,
      role: 'SUPER_ADMIN'
    }
  });
  console.log('Upserted superadmin user:', user.email, 'with new password');
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
