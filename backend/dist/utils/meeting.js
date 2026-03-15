"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLeadHunterMeeting = void 0;
const axios_1 = __importDefault(require("axios"));
const API_KEY = process.env.LEADHUNTER_API_KEY || 'nexus_super_secret_key';
const BASE_URL = process.env.LEADHUNTER_API_BASE_URL || 'http://leadhunter-crm.work.gd:3001';
const createLeadHunterMeeting = async (title, startTime) => {
    try {
        const response = await axios_1.default.post(`${BASE_URL}/api/meetings/create`, {
            title,
            startTime: new Date(startTime).toISOString(),
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
            }
        });
        return response.data;
    }
    catch (error) {
        console.error('Error creating LeadHunter meeting:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to create meeting via LeadHunter API');
    }
};
exports.createLeadHunterMeeting = createLeadHunterMeeting;
