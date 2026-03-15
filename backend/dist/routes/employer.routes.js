"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/profile', auth_middleware_1.protect, auth_middleware_1.employer, async (req, res) => {
    try {
        const profile = await prisma_1.default.employerProfile.findUnique({
            where: { userId: req.user.id }
        });
        res.json(profile);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
