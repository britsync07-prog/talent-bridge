"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const engineer_controller_1 = require("../controllers/engineer.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const multer_1 = require("../utils/multer");
const router = (0, express_1.Router)();
router.get('/profile', auth_middleware_1.protect, auth_middleware_1.engineer, engineer_controller_1.getProfile);
router.patch('/profile', auth_middleware_1.protect, auth_middleware_1.engineer, multer_1.upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'certifications', maxCount: 1 },
    { name: 'profilePic', maxCount: 1 }
]), engineer_controller_1.updateProfile);
router.get('/match', engineer_controller_1.matchEngineers);
router.get('/', engineer_controller_1.getEngineers);
router.get('/:id', engineer_controller_1.getEngineerById);
exports.default = router;
