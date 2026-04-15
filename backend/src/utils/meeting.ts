import axios from 'axios';

const API_KEY = process.env.LEADHUNTER_API_KEY || 'nexus_super_secret_key';
const BASE_URL = process.env.LEADHUNTER_API_BASE_URL || 'https://meet.truecrm.online';

export interface MeetingResponse {
  meeting_id: string;
  join_url: string;
  title: string;
}

export const createLeadHunterMeeting = async (title: string, startTime: string): Promise<MeetingResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/api/meetings/create`, {
      title,
      startTime: new Date(startTime).toISOString(),
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Error creating LeadHunter meeting:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create meeting via LeadHunter API');
  }
};
