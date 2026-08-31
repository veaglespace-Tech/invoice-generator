'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function seedPlans() {
  await prisma.plan.create({
    data: {
      name: 'Starter',
      description: 'Perfect for freelancers and individuals.',
      price: 0,
      interval: 'forever',
      features: [
        'Up to 50 Invoices / Month',
        'Basic PDF Export & GST',
        'Community Support'
      ],
      is_popular: false
    }
  });
  await prisma.plan.create({
    data: {
      name: 'Professional',
      description: 'For growing agencies and small businesses.',
      price: 999,
      interval: 'month',
      features: [
        'Unlimited Invoices & Customers',
        'Live QR Code on Invoices',
        'Custom Auto-Prefix (e.g. VEA-001)'
      ],
      is_popular: true
    }
  });
  console.log('seeded');
}
seedPlans()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
