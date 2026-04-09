"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.engineer = exports.employer = exports.admin = exports.optionalProtect = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
            req.user = await prisma_1.default.user.findUnique({
                where: { id: decoded.id },
                select: { id: true, email: true, role: true }
            });
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            next();
        }
        catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
exports.protect = protect;
const optionalProtect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
            req.user = await prisma_1.default.user.findUnique({
                where: { id: decoded.id },
                select: { id: true, email: true, role: true }
            });
        }
        catch (error) {
            console.error('Optional auth failed:', error.message);
            // Continue without req.user
        }
    }
    next();
};
exports.optionalProtect = optionalProtect;
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    }
    else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};
exports.admin = admin;
const employer = (req, res, next) => {
    if (req.user && req.user.role === 'EMPLOYER') {
        next();
    }
    else {
        res.status(403).json({ message: 'Not authorized as an employer' });
    }
};
exports.employer = employer;
const engineer = (req, res, next) => {
    if (req.user && req.user.role === 'ENGINEER') {
        next();
    }
    else {
        res.status(403).json({ message: 'Not authorized as an engineer' });
    }
};
exports.engineer = engineer;
