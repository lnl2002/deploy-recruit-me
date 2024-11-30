import { BACKEND_URL } from "@/utils/env";
import axios, { AxiosError } from "axios";

export interface ICreateMeeting {
  participantIds: string[];
  timeStart: string;
  timeEnd: string;
  title: string;
  applyId: string;
}

export type Participant = {
  participant: string;
  status: "pending" | "approved" | "rejected";
};

export interface IMeeting {
  _id: string;
  url: string;
  participants: Participant[];
  timeStart: string; // ISO date string
  timeEnd: string; // ISO date string
  rejectCount: number;
  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  apply: string;
  __v: number;
}

export type MeetingPaticipant = {
  meetingRoomId: string;
  status: string;
  declineReason?: string;
};

export const meetingApi = {
  createSchedule: async ({
    participantIds,
    timeStart,
    timeEnd,
    title,
    applyId,
  }: ICreateMeeting) => {
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/meeting-room/create`,
        {
          participantIds,
          timeStart,
          timeEnd,
          title,
          applyId,
        }
      );

      if (res.status === 200) {
        return res.data.data;
      } else {
        return null;
      }
    } catch (error: any) {
      console.error("Error fetching career list:", error);
      if (error.status === 400) {
        return error.response.data.data;
      }

      return null;
    }
  },
  getScheduleById: async ({
    interviewerId,
    startTime,
    endTime,
  }: {
    interviewerId: string;
    startTime: string;
    endTime: string;
  }): Promise<IMeeting[] | null> => {
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
  },
  getAccessToken: async (
    identity: string,
    roomName: string
  ): Promise<{ data: string; status: number }> => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/rooms/access-token`, {
        identity,
        roomName,
      });

      const { data } = res.data;

      return { data, status: res.data.status };
    } catch (error: any) {
      console.error(
        "Error fetching access-token list:",
        error.response.data.data.message,
        error.response.status
      );
      return {
        data: error.response.data.data.message,
        status: error.response.status,
      };
    }
  },
  createRoom: async (roomName: string): Promise<boolean> => {
    try {
      await axios.post(`${BACKEND_URL}/api/v1/rooms/create-room`, {
        roomName,
      });

      return true;
    } catch (error) {
      console.error("Error fetching create-room list:", error);
      return false;
    }
  },
  endMeeting: async (roomSid: string): Promise<boolean> => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/rooms/end-room`, {
        roomSid,
      });

      if (res.status === 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error fetching career list:", error);
      return false;
    }
  },
  getCandidateListByInterview: async ({
    limit,
    page,
    sortOrder,
    statusFilter,
    jobId,
  }: {
    limit?: number;
    page?: number;
    sortOrder?: string;
    statusFilter?: string;
    jobId?: string;
  }) => {
    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/v1/meeting-room/list-candidate?page=${page}&limit=${limit}&sortOrder=${sortOrder}&statusFilter=${statusFilter}&jobId=${jobId}`
      );
      if (res.status === 200) {
        return res.data.data;
      } else {
        return {
          page: 1,
          data: [],
          total: 0,
          totalPages: 0,
        };
      }
    } catch (error) {
      console.error("Error fetching career list:", error);
      return {
        page: 1,
        data: [],
        total: 0,
        totalPages: 0,
      };
    }
  },
  getMeetingRoomByUrl: async (url: string): Promise<IMeeting | null> => {
    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/v1/meeting-room/url?url=${url}`
      );

      return res.data.data;
    } catch (error) {
      return null;
    }
  },

  getMeetingByApplyId: async (
    applyId: string
  ): Promise<IMeeting | undefined> => {
    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/v1/meeting-room/get/${applyId}`
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching career list:", error);
      return undefined;
    }
  },

  updateMeetingStatus: async ({
    meetingRoomId,
    status,
    declineReason,
  }: MeetingPaticipant): Promise<IMeeting | undefined> => {
    try {
      const accessToken = localStorage.getItem("access_token");

      const res = await axios.put(
        `${BACKEND_URL}/api/v1/meeting-room/update-status`,
        {
          meetingRoomId,
          status,
          declineReason,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching career list:", error);
      return undefined;
    }
  },

  getAllMeetingRoomsByJobId: async (
    jobId: string
  ): Promise<IMeeting | undefined> => {
    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/v1/meeting-room/get-all/${jobId}`
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching meeting room list:", error);
      return undefined;
    }
  },

  getCandidateRejectReason: async (applyId: string) => {
    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/v1/meeting-room/candidate-reject-reason?applyId=${applyId}`
      );
      return res?.data?.data;
    } catch (error) {
      console.error("Error candidate reject reason:", error);
      return undefined;
    }
  },

  addParticipantToMeetingRoom: async (
    meetingRoomId: string,
    participantId: string
  ): Promise<any | undefined> => {
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/meeting-room/add-participant`,
        { participantId, meetingRoomId }
      );
      return res?.data?.data;
    } catch (error) {
      console.error("Error adding participant:", error);
      return undefined;
    }
  },

  removeParticipantFromMeetingRoom: async (
    meetingRoomId: string,
    participantId: string
  ): Promise<any | undefined> => {
    try {
      const res = await axios.delete(
        `${BACKEND_URL}/api/v1/meeting-room/remove-participant`,
        {
          data: { participantId, meetingRoomId }, // DELETE request body must be sent in the `data` property
        }
      );
      return res?.data?.data;
    } catch (error) {
      console.error("Error removing participant:", error);
      return undefined;
    }
  },
};

export default meetingApi;
