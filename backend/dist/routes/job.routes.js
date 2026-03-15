"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const job_controller_1 = require("../controllers/job.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', job_controller_1.getAllJobs);
router.get('/my-jobs', auth_middleware_1.protect, auth_middleware_1.employer, job_controller_1.getMyJobs);
router.get('/:id', job_controller_1.getJobById);
router.post('/', auth_middleware_1.protect, auth_middleware_1.employer, job_controller_1.createJob);
router.post('/interest', auth_middleware_1.protect, auth_middleware_1.employer, job_controller_1.showInterest);
router.delete('/interest/:id', auth_middleware_1.protect, auth_middleware_1.employer, job_controller_1.withdrawInterest);
router.delete('/:id', auth_middleware_1.protect, auth_middleware_1.employer, job_controller_1.deleteJob);
router.patch('/interest/:id/schedule', auth_middleware_1.protect, auth_middleware_1.employer, job_controller_1.scheduleCall);
// Admin only onboarding after video call
router.post('/admin/onboard', auth_middleware_1.protect, auth_middleware_1.admin, job_controller_1.hireEngineer);
exports.default = router;
