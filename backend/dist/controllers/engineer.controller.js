"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEngineerById = exports.getEngineers = exports.matchEngineers = exports.updateProfile = exports.getProfile = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getProfile = async (req, res) => {
    try {
        const engineer = await prisma_1.default.engineerProfile.findUnique({
            where: { userId: req.user.id },
            include: {
                interests: {
                    include: {
                        employer: true,
                        job: true
                    }
                }
            }
        });
        if (!engineer) {
            return res.status(404).json({ message: 'Engineer profile not found' });
        }
        res.json(engineer);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullName, country, skills, yearsExperience, hourlyRate, aiSpecializations, languages, availabilityStatus, portfolioWebsite } = req.body;
        const files = req.files;
        const updateData = {
            fullName,
            country,
            skills,
            yearsExperience: parseInt(yearsExperience),
            hourlyRate: parseFloat(hourlyRate),
            aiSpecializations,
            languages,
            availabilityStatus,
            portfolioWebsite,
        };
        if (files?.resume) {
            updateData.resumeUrl = `/uploads/${files.resume[0].filename}`;
        }
        if (files?.video) {
            updateData.videoUrl = `/uploads/${files.video[0].filename}`;
        }
        if (files?.certifications) {
            // Assuming certifications is a comma-separated string or similar in DB
            // For now let's just save the latest uploaded file or handle multiple
            updateData.certifications = `/uploads/${files.certifications[0].filename}`;
        }
        if (files?.profilePic) {
            updateData.profilePic = `/uploads/${files.profilePic[0].filename}`;
        }
        const updatedProfile = await prisma_1.default.engineerProfile.update({
            where: { userId },
            data: updateData,
        });
        res.json(updatedProfile);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateProfile = updateProfile;
const matchEngineers = async (req, res) => {
    try {
        const { requiredSkills, maxBudget } = req.query;
        if (!requiredSkills) {
            return res.status(400).json({ message: 'requiredSkills parameter is missing' });
        }
        const skillsArray = requiredSkills.split(',').map(s => s.trim().toLowerCase());
        const budget = maxBudget ? parseFloat(maxBudget) : Infinity;
        const allEngineers = await prisma_1.default.engineerProfile.findMany({
            where: { isActive: true, isApproved: true }
        });
        const scoredEngineers = allEngineers.map(engineer => {
            let score = 0;
            let matchedSkills = [];
            // Split strings to arrays for searching
            const engineerSkillsArr = engineer.skills.split(',').map(s => s.trim().toLowerCase());
            const engineerSpecsArr = engineer.aiSpecializations.split(',').map(s => s.trim().toLowerCase());
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
                hourlyRate: engineer.hourlyRate,
                aiSpecializations: engineer.aiSpecializations,
                availabilityStatus: engineer.availabilityStatus,
                videoUrl: engineer.videoUrl,
                isFeatured: engineer.isFeatured,
            };
            return {
                ...safeEngineer,
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.matchEngineers = matchEngineers;
const getEngineers = async (req, res) => {
    try {
        const { specialization, country, minRate, maxRate } = req.query;
        let where = { isActive: true, isApproved: true };
        if (specialization) {
            where.aiSpecializations = { contains: specialization };
        }
        if (country) {
            where.country = country;
        }
        if (minRate || maxRate) {
            where.hourlyRate = {};
            if (minRate)
                where.hourlyRate.gte = parseFloat(minRate);
            if (maxRate)
                where.hourlyRate.lte = parseFloat(maxRate);
        }
        const engineers = await prisma_1.default.engineerProfile.findMany({
            where,
            select: {
                id: true,
                fullName: true,
                profilePic: true,
                country: true,
                skills: true,
                yearsExperience: true,
                hourlyRate: true,
                aiSpecializations: true,
                availabilityStatus: true,
                videoUrl: true,
                isFeatured: true, // Use assertion or wait for db generation
            },
            orderBy: [
                { isFeatured: 'desc' }, // Need any bypass if TS fails
                { yearsExperience: 'desc' }
            ]
        });
        res.json(engineers);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getEngineers = getEngineers;
const getEngineerById = async (req, res) => {
    try {
        const id = req.params.id;
        const engineer = await prisma_1.default.engineerProfile.findUnique({
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
            hourlyRate: engineer.hourlyRate,
            aiSpecializations: engineer.aiSpecializations,
            availabilityStatus: engineer.availabilityStatus,
            videoUrl: engineer.videoUrl,
            languages: engineer.languages,
            isFeatured: engineer.isFeatured,
            // specifically excluding github, linkedin, portfolioWebsite, resumeUrl, certifications, email
        };
        res.json(safeEngineer);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getEngineerById = getEngineerById;
