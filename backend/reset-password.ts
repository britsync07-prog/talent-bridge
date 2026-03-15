import prisma from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function reset() {
  const hashedPassword = await bcrypt.hash('CompanyPass123!', 10);
  await prisma.user.update({
    where: { email: 'hire@techcorp.com' },
    data: { password: hashedPassword }
  });
  console.log('✅ Password reset for hire@techcorp.com to CompanyPass123!');
  process.exit(0);
}

reset();
