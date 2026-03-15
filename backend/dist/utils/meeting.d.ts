export interface MeetingResponse {
    meeting_id: string;
    join_url: string;
    title: string;
}
export declare const createLeadHunterMeeting: (title: string, startTime: string) => Promise<MeetingResponse>;
