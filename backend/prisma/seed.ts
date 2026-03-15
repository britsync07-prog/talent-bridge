import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import prisma from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  // Clear existing data to prevent duplicates on re-seed
  await prisma.activity_log.deleteMany();
  await prisma.interest.deleteMany();
  await prisma.task.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.job.deleteMany();
  await prisma.engineerProfile.deleteMany();
  await prisma.employerProfile.deleteMany();
  await prisma.adminProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database records.');

  const passwordText = 'Password123!';
  const hashedPassword = await bcrypt.hash(passwordText, 10);

  // 1. Create Admins
  const admin = await prisma.user.create({
    data: {
      email: 'admin@curatedai.com',
      password: hashedPassword,
      role: 'ADMIN',
      adminProfile: { create: {} }
    }
  });

  const admin2 = await prisma.user.create({
    data: {
      email: 'manager@curatedai.com',
      password: hashedPassword,
      role: 'ADMIN',
      adminProfile: { create: {} }
    }
  });
  console.log('✅ Admins Created');

  // 2. Create Employers
  const employer1 = await prisma.user.create({
    data: {
      email: 'hire@techcorp.com',
      password: hashedPassword,
      role: 'EMPLOYER',
      employerProfile: {
        create: {
          companyName: 'TechCorp AI Solutions',
          website: 'https://techcorp.ai',
          industry: 'Enterprise AI',
          description: 'Leading provider of enterprise LLM solutions.',
          isApproved: true
        }
      }
    },
    include: { employerProfile: true }
  });

  const employer2 = await prisma.user.create({
    data: {
      email: 'founders@startup.io',
      password: hashedPassword,
      role: 'EMPLOYER',
      employerProfile: {
        create: {
          companyName: 'NextGen Startup',
          website: 'https://startup.io',
          industry: 'Consumer Tech',
          description: 'Building the next big thing in consumer AI.',
          isApproved: true
        }
      }
    },
    include: { employerProfile: true }
  });

  const employerPending = await prisma.user.create({
    data: {
      email: 'pending@newco.com',
      password: hashedPassword,
      role: 'EMPLOYER',
      employerProfile: {
        create: {
          companyName: 'NewCo (Pending Approval)',
          website: 'https://newco.com',
          industry: 'Healthcare',
          description: 'Waiting for admin approval.',
          isApproved: false
        }
      }
    }
  });
  console.log('✅ Employers Created');

  // 3. Create Engineers
  const engineersData = [
    { email: 'alex.ml@engineer.com', fullName: 'Alex River', specs: 'Machine Learning, Deep Learning', rate: 120, exp: 6, approved: true },
    { email: 'sarah.llm@engineer.com', fullName: 'Sarah Chen', specs: 'LLM Development, NLP', rate: 150, exp: 8, approved: true },
    { email: 'jason.agents@engineer.com', fullName: 'Jason Smyth', specs: 'AI Agents, Automation', rate: 135, exp: 5, approved: true },
    { email: 'junior@engineer.com', fullName: 'Junior Dev', specs: 'Prompt Engineering', rate: 60, exp: 1, approved: false }
  ];

  for (const eng of engineersData) {
    await prisma.user.create({
      data: {
        email: eng.email,
        password: hashedPassword,
        role: 'ENGINEER',
        engineerProfile: {
          create: {
            fullName: eng.fullName,
            country: 'United States',
            aiSpecializations: eng.specs,
            skills: 'Python, AI, Fullstack',
            languages: 'English',
            hourlyRate: eng.rate,
            monthlySalaryExpectation: eng.rate * 160,
            yearsExperience: eng.exp,
            isActive: true,
            isApproved: eng.approved
          }
        }
      }
    });
  }
  console.log('✅ Engineers Created');

  // 4. Create Sample Jobs
  if (employer1.employerProfile) {
    await prisma.job.create({
      data: {
        employerId: employer1.employerProfile.id,
        title: 'Senior AI Agent Developer',
        description: 'We need an expert to build autonomous agents using LangChain and AutoGPT.',
        requiredSkills: 'Python, LangChain, OpenAI API',
        maxBudget: 150,
        duration: '3 months',
        status: 'OPEN'
      }
    });
  }

  if (employer2.employerProfile) {
    await prisma.job.create({
      data: {
        employerId: employer2.employerProfile.id,
        title: 'Computer Vision Specialist',
        description: 'Looking for someone to help with image recognition for our new app.',
        requiredSkills: 'Python, PyTorch, OpenCV',
        maxBudget: 110,
        duration: '6 months',
        status: 'OPEN'
      }
    });
  }
  console.log('✅ Sample Jobs Created');

  // 5. Activity Logs
  await prisma.activity_log.create({
    data: {
      userId: admin.id,
      action: 'system initialization',
      details: 'Initial database seeding completed.'
    }
  });

  console.log('\n=========================================');
  console.log('🎉 Seeding completed successfully!');
  console.log('=========================================');
  console.log('🔐 TEST CREDENTIALS (All use password: Password123!)');
  console.log('-----------------------------------------');
  console.log('👑 ADMINS:');
  console.log('  - admin@curatedai.com');
  console.log('  - manager@curatedai.com');
  console.log('-----------------------------------------');
  console.log('🏢 EMPLOYERS:');
  console.log('  - hire@techcorp.com (Approved)');
  console.log('  - founders@startup.io (Approved)');
  console.log('  - pending@newco.com (Pending Approval)');
  console.log('-----------------------------------------');
  console.log('💻 ENGINEERS:');
  console.log('  - alex.ml@engineer.com (Approved)');
  console.log('  - sarah.llm@engineer.com (Approved)');
  console.log('  - jason.agents@engineer.com (Approved)');
  console.log('  - junior@engineer.com (Pending Approval)');
  console.log('=========================================\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
