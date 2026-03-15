import prisma from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function testLogin() {
  const email = 'hire@techcorp.com';
  const password = 'Password123!';
  
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log('❌ User not found');
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  console.log(`User found: ${user.email}`);
  console.log(`Role: ${user.role}`);
  console.log(`Password match test: ${isMatch ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  process.exit(0);
}

testLogin();
