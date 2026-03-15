"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatPartners = exports.getMessages = exports.sendMessage = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const sendMessage = async (req, res) => {
    try {
        const { receiverId, content, fileUrl } = req.body;
        const senderId = req.user.id;
        const message = await prisma_1.default.message.create({
            data: {
                senderId,
                receiverId,
                content
            }
        });
        res.status(201).json(message);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.sendMessage = sendMessage;
const getMessages = async (req, res) => {
    try {
        const receiverId = req.params.receiverId;
        const senderId = req.user.id;
        const messages = await prisma_1.default.message.findMany({
            where: {
                OR: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getMessages = getMessages;
const getChatPartners = async (req, res) => {
    try {
        const userId = req.user.id;
        // Find all unique users this user has messaged or been messaged by
        const sentTo = await prisma_1.default.message.findMany({
            where: { senderId: userId },
            select: { receiverId: true }
        });
        const receivedFrom = await prisma_1.default.message.findMany({
            where: { receiverId: userId },
            select: { senderId: true }
        });
        const partnerIds = Array.from(new Set([
            ...sentTo.map((m) => m.receiverId),
            ...receivedFrom.map((m) => m.senderId)
        ]));
        const partners = await prisma_1.default.user.findMany({
            where: { id: { in: partnerIds } },
            select: {
                id: true,
                email: true,
                role: true,
                adminProfile: true,
                employerProfile: true,
                engineerProfile: true
            }
        });
        res.json(partners);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getChatPartners = getChatPartners;
