import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

export const registerEmployer = async (req: Request, res: Response) => {
  try {
    const { email, password, companyName, website, size, industry, description, location } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'EMPLOYER',
        employerProfile: {
          create: {
            companyName,
            website,
            size,
            industry,
            description,
            location,
          }
        },
        activity_logs: {
          create: {
            action: 'registration',
            details: 'Employer account registered'
          }
        }
      },
      include: {
        employerProfile: true
      }
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const registerEngineer = async (req: Request, res: Response) => {
  try {
    const { 
      email, 
      password, 
      fullName, 
      country, 
      skills, 
      yearsExperience, 
      hourlyRate, 
      monthlySalaryExpectation,
      aiSpecializations,
      languages,
      portfolioWebsite,
      github,
      linkedin,
      resumeUrl,
      certifications
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const hRate = parseFloat(hourlyRate) || 0;
    const mSalary = parseFloat(monthlySalaryExpectation) || (hRate * 160); // Default to 160 hours/month

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ENGINEER',
        engineerProfile: {
          create: {
            fullName,
            country,
            skills,
            yearsExperience: parseInt(yearsExperience) || 0,
            hourlyRate: hRate,
            monthlySalaryExpectation: mSalary,
            aiSpecializations,
            languages: languages || '',
            portfolioWebsite,
            github,
            linkedin,
            resumeUrl,
            certifications,
            isApproved: false, // Must be approved by admin
          }
        },
        activity_logs: {
          create: {
            action: 'registration',
            details: 'Engineer account registered'
          }
        }
      },
      include: {
        engineerProfile: true
      }
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    console.log(`Login attempt for: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        adminProfile: true,
        employerProfile: true,
        engineerProfile: true
      }
    });

    if (!user) {
      console.log('User not found in database');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password match: ${isMatch}`);

    if (isMatch) {
      // Create activity log
      await prisma.activity_log.create({
        data: {
          userId: user.id,
          action: 'user login',
          details: `User logged in with role: ${user.role}`
        }
      });

      res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.adminProfile || user.employerProfile || user.engineerProfile,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        adminProfile: true,
        employerProfile: true,
        engineerProfile: true
      }
    });

    if (user) {
      res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.adminProfile || user.employerProfile || user.engineerProfile,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
