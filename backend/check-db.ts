import prisma from './src/lib/prisma';

async function check() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true }
  });
  console.log('Users in DB:', JSON.stringify(users, null, 2));
  process.exit(0);
}

check();
