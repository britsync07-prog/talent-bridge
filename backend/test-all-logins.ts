import prisma from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function testAllLogins() {
  const users = await prisma.user.findMany();
  const password = 'Password123!';
  
  console.log('Testing logins for all users with Password123!');
  console.log('-------------------------------------------');
  
  for (const user of users) {
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`${user.email} (${user.role}): ${isMatch ? '✅ SUCCESS' : '❌ FAILED'}`);
  }
  
  process.exit(0);
}

testAllLogins();
