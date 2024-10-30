import { BACKEND_URL } from "@/utils/env";
import axios from "axios";

export interface ICreateMeeting {
  participantIds: string[];
  timeStart: string;
  timeEnd: string;
  title: string;
}

export type Participant = {
  participant: string;
  status: "pending" | "approved" | "rejected";
};

export type Meeting = {
  _id: string;
  url: string;
  participants: Participant[];
  timeStart: string; // ISO date string
  timeEnd: string; // ISO date string
  rejectCount: number;
  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
};

export const meetingApi = {
  createSchedule: async ({
    participantIds,
    timeStart,
    timeEnd,
    title
  }: ICreateMeeting) => {
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/meeting-room/create`,
        {
          participantIds,
          timeStart,
          timeEnd,
          title
        }
      );
      
      if (res.status === 200) {
        return res.data.data;
      }  else {
        return null;
      }
    } catch (error: any) {
      console.error("Error fetching career list:", error);
      if(error.status === 400) {
        return error.response.data.data
      }
      
      return null;
    }
  },
  getScheduleById: async({
    interviewerId, startTime, endTime
  }: {
    interviewerId: string,
    startTime: string,
    endTime: string
  }): Promise<Meeting[] | null> => {
    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/v1/meeting-room/schedules?interviewerId=${interviewerId}&startTime=${startTime}&endTime=${endTime}`
      );
      if (res.status === 200) {
        return res.data.data;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching career list:", error);
      return null;
    }
  }
};

export default meetingApi;