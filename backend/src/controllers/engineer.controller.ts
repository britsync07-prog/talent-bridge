import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { uploadToR2 } from '../utils/r2';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const engineer = await prisma.engineerProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        interests: {
          include: {
            employer: true,
            job: true
          }
        },
        certificates: true
      }
    });

    if (!engineer) {
      return res.status(404).json({ message: 'Engineer profile not found' });
    }

    // Anonymize employer info for the engineer
    const anonymizedInterests = engineer.interests.map(interest => ({
      ...interest,
      employer: {
        ...interest.employer,
        companyName: `Opportunity #${interest.employerId.slice(0, 4)}`,
        website: null,
        description: 'Identity concealed until formal engagement.'
      }
    }));

    res.json({
      ...engineer,
      interests: anonymizedInterests
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { 
      fullName, country, skills, yearsExperience, hourlyRate, 
      aiSpecializations, languages, availabilityStatus, portfolioWebsite 
    } = req.body;

    // Get current profile
    const currentProfile = await prisma.engineerProfile.findUnique({
      where: { userId },
      include: { certificates: true }
    });

    if (!currentProfile) {
      return res.status(404).json({ message: 'Engineer profile not found' });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    const updateData: any = {
      fullName,
      country,
      skills,
      yearsExperience: parseInt(yearsExperience) || 0,
      hourlyRate: parseFloat(hourlyRate) || 0,
      aiSpecializations,
      languages,
      availabilityStatus,
      portfolioWebsite,
    };

    if (files?.resume) {
      updateData.resumeUrl = await uploadToR2(files.resume[0], 'engineers/resumes');
    }
    
    let profilePicUrl = currentProfile.profilePic;
    if (files?.profilePic) {
      profilePicUrl = await uploadToR2(files.profilePic[0], 'engineers/profile-pics');
      updateData.profilePic = profilePicUrl;
    }

    let videoUrl = currentProfile.videoUrl;
    if (files?.video) {
        videoUrl = await uploadToR2(files.video[0], 'engineers/videos');
        updateData.videoUrl = videoUrl;
    }

    // Handle Certifications (Up to 15)
    if (files?.certifications) {
      const existingCount = currentProfile.certificates.length;
      const newFiles = files.certifications;
      
      if (existingCount + newFiles.length > 15) {
        return res.status(400).json({ message: 'Maximum 15 certificates allowed' });
      }

      const certificatePromises = newFiles.map(async (file) => {
        const url = await uploadToR2(file, 'engineers/certifications');
        return prisma.certificate.create({
          data: {
            engineerId: currentProfile.id,
            url,
            name: file.originalname
          }
        });
      });

      await Promise.all(certificatePromises);
    }

    // Mandatory Field Validation
    // Engineer MUST have profilePic and videoUrl to be complete
    const isComplete = !!(profilePicUrl && videoUrl);
    updateData.isProfileComplete = isComplete;

    const updatedProfile = await prisma.engineerProfile.update({
      where: { userId },
      data: updateData,
      include: { certificates: true }
    });

    res.json(updatedProfile);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const engineer = await prisma.engineerProfile.findUnique({
      where: { userId }
    });

    if (!engineer) {
      return res.status(404).json({ message: 'Engineer profile not found' });
    }

    const certificate = await prisma.certificate.findUnique({
      where: { id: id as string }
    });

    if (!certificate || certificate.engineerId !== engineer.id) {
      return res.status(404).json({ message: 'Certificate not found or unauthorized' });
    }

    await prisma.certificate.delete({
      where: { id: id as string }
    });

    res.json({ message: 'Certificate removed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};


export const matchEngineers = async (req: AuthRequest, res: Response) => {
  try {
    const { requiredSkills, maxBudget } = req.query;
    const isAdmin = req.user?.role === 'ADMIN';

    if (!requiredSkills) {
      return res.status(400).json({ message: 'requiredSkills parameter is missing' });
    }

    const skillsArray = (requiredSkills as string).split(',').map(s => s.trim().toLowerCase());
    const budget = maxBudget ? parseFloat(maxBudget as string) : Infinity;

    const allEngineers = await prisma.engineerProfile.findMany({
      where: { isActive: true, isApproved: true }
    });

    const scoredEngineers = allEngineers.map(engineer => {
      let score = 0;
      let matchedSkills: string[] = [];

      // Split strings to arrays for searching
      const engineerSkillsArr = (engineer.skills as string).split(',').map(s => s.trim().toLowerCase());
      const engineerSpecsArr = (engineer.aiSpecializations as string).split(',').map(s => s.trim().toLowerCase());
      const allEngineerQuals = [...engineerSkillsArr, ...engineerSpecsArr];

      skillsArray.forEach(skill => {
        if (allEngineerQuals.some(es => es.includes(skill))) {
          score += 10;
          matchedSkills.push(skill);
        }
      });

      // Bonus for experience
      if (engineer.yearsExperience) {
        score += (engineer.yearsExperience * 2);
      }

      // Penalty if rate exceeds budget
      if (engineer.hourlyRate && engineer.hourlyRate > budget) {
        score -= 20;
      }

      // Filter sensitive data
      const safeEngineer = {
        id: engineer.id,
        fullName: engineer.fullName,
        profilePic: engineer.profilePic,
        country: engineer.country,
        skills: engineer.skills,
        yearsExperience: engineer.yearsExperience,
        ...(isAdmin && { hourlyRate: engineer.hourlyRate }),
        aiSpecializations: engineer.aiSpecializations,
        availabilityStatus: engineer.availabilityStatus,
        videoUrl: engineer.videoUrl,
        isFeatured: (engineer as any).isFeatured,
      };

      return {
        ...safeEngineer,
        fullName: isAdmin ? engineer.fullName : `Elite Operator #${engineer.id.slice(0, 4)}`,
        matchScore: score,
        matchedSkills,
        matchPercentage: Math.min(100, Math.max(0, (score / 50) * 100)) // Arbitrary 50 max base score for percentage
      };
    });

    // Filter out very low scores and sort by highest score
    const topMatches = scoredEngineers
      .filter(e => e.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5); // Return top 5

    res.json(topMatches);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getEngineers = async (req: AuthRequest, res: Response) => {
  try {
    const { specialization, country, minRate, maxRate } = req.query;
    const isAdmin = req.user?.role === 'ADMIN';

    let where: any = { isActive: true, isApproved: true };

    if (specialization) {
      where.aiSpecializations = { contains: specialization as string };
    }

    if (country) {
      where.country = country as string;
    }

    if (minRate || maxRate) {
      where.hourlyRate = {};
      if (minRate) where.hourlyRate.gte = parseFloat(minRate as string);
      if (maxRate) where.hourlyRate.lte = parseFloat(maxRate as string);
    }

    const engineers = await prisma.engineerProfile.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        profilePic: true,
        country: true,
        skills: true,
        yearsExperience: true,
        aiSpecializations: true,
        availabilityStatus: true,
        videoUrl: true,
        isFeatured: true,
        ...(isAdmin && { hourlyRate: true }),
      } as any,
      orderBy: [
          { isFeatured: 'desc' }, // Need any bypass if TS fails
          { yearsExperience: 'desc' }
      ] as any
    });

    const processedEngineers = engineers.map(eng => ({
        ...eng,
        fullName: isAdmin ? eng.fullName : `Elite Operator #${eng.id.slice(0, 4)}`
    }));

    res.json(processedEngineers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getEngineerById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const isAdmin = req.user?.role === 'ADMIN';

    const engineer = await prisma.engineerProfile.findUnique({
      where: { id },
    });

    if (!engineer) {
      return res.status(404).json({ message: 'Engineer not found' });
    }

    // Filter sensitive data
    const safeEngineer = {
        id: engineer.id,
        fullName: engineer.fullName,
        profilePic: engineer.profilePic,
        country: engineer.country,
        skills: engineer.skills,
        yearsExperience: engineer.yearsExperience,
        ...(isAdmin && { 
          hourlyRate: engineer.hourlyRate,
          monthlySalaryExpectation: engineer.monthlySalaryExpectation 
        }),
        aiSpecializations: engineer.aiSpecializations,
        availabilityStatus: engineer.availabilityStatus,
        videoUrl: engineer.videoUrl,
        languages: engineer.languages,
        isFeatured: (engineer as any).isFeatured,
        // specifically excluding github, linkedin, portfolioWebsite, resumeUrl, certifications, email
    };

    const data = isAdmin ? safeEngineer : {
        ...safeEngineer,
        fullName: `Elite Operator #${engineer.id.slice(0, 4)}`
    };

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getEngineerStats = async (req: AuthRequest, res: Response) => {
    try {
        const engineer = await prisma.engineerProfile.findUnique({
            where: { userId: req.user.id },
            include: { contracts: true }
        });

        if (!engineer) return res.status(404).json({ message: 'Engineer profile not found' });

        const invoices = await prisma.invoice.findMany({
            where: { contract: { engineerId: engineer.id }, status: 'PAID' }
        });

        const totalEarned = invoices.reduce((acc, inv) => acc + inv.amount, 0);
        const activeProjectCount = engineer.contracts.filter(c => c.status === 'ACTIVE').length;

        res.json({
            totalEarned,
            activeProjectCount,
            nextGoal: 50000, // Still a bit hardcoded but could be dynamic
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getSuggestedJobs = async (req: AuthRequest, res: Response) => {
    try {
        const engineer = await prisma.engineerProfile.findUnique({
            where: { userId: req.user.id }
        });
        if (!engineer) return res.status(404).json({ message: 'Engineer not found' });

        const skills = (engineer.skills || '').split(',').map(s => s.trim().toLowerCase());
        
        const jobs = await prisma.job.findMany({
            where: { status: 'OPEN' },
            take: 10
        });

        // Simple scoring
        const suggested = jobs.map(job => {
            const jobSkills = job.requiredSkills.split(',').map(s => s.trim().toLowerCase());
            const matchCount = skills.filter(s => jobSkills.includes(s)).length;
            return { ...job, matchCount };
        }).sort((a, b) => b.matchCount - a.matchCount).slice(0, 3);

        res.json(suggested);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getTimesheets = async (req: AuthRequest, res: Response) => {
    try {
        const engineer = await prisma.engineerProfile.findUnique({
            where: { userId: req.user.id }
        });
        if (!engineer) return res.status(404).json({ message: 'Engineer not found' });

        const timesheets = await prisma.timesheet.findMany({
            where: { contract: { engineerId: engineer.id } },
            include: { contract: { include: { employer: true } } },
            orderBy: { date: 'desc' }
        });

        res.json(timesheets);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getEndorsements = async (req: AuthRequest, res: Response) => {
    try {
        const engineer = await prisma.engineerProfile.findUnique({
            where: { userId: req.user.id }
        });
        if (!engineer) return res.status(404).json({ message: 'Engineer not found' });

        const endorsements = await prisma.endorsement.findMany({
            where: { engineerId: engineer.id },
            orderBy: { createdAt: 'desc' }
        });

        res.json(endorsements);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getEngineerInterviews = async (req: AuthRequest, res: Response) => {
    try {
        const engineer = await prisma.engineerProfile.findUnique({
            where: { userId: req.user.id }
        });
        if (!engineer) return res.status(404).json({ message: 'Engineer not found' });

        const interviews = await prisma.interest.findMany({
            where: {
                engineerId: engineer.id,
                status: 'CALLED',
                scheduledAt: { gte: new Date() }
            },
            include: { employer: true, job: true },
            orderBy: { scheduledAt: 'asc' }
        });

        // Redact employer info
        const safeInterviews = interviews.map(i => ({
            ...i,
            employer: i.employer ? { id: i.employer.id, companyName: 'Verified Client' } : null
        }));

        res.json(safeInterviews);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyEmployers = async (req: AuthRequest, res: Response) => {
    try {
        const engineer = await prisma.engineerProfile.findUnique({
            where: { userId: req.user.id }
        });
        if (!engineer) return res.status(404).json({ message: 'Engineer not found' });

        const contracts = await prisma.contract.findMany({
            where: { engineerId: engineer.id },
            include: { employer: true }
        });

        const employers = contracts
            .map(c => c.employer)
            .filter((e, index, self) => e && self.findIndex(se => se?.id === e.id) === index);

        // Redact sensitive info
        const safeEmployers = employers.map(e => ({
            id: e?.id,
            companyName: 'Verified Client',
            industry: e?.industry,
            location: e?.location
        }));

        res.json(safeEmployers);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};



