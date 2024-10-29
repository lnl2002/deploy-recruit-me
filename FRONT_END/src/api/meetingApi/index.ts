import { BACKEND_URL } from "@/utils/env";
import axios from "axios";

const meetingApi = {
  getAccessToken: async (
    identity: string,
    roomName: string
  ): Promise<string> => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/rooms/access-token`, {
        identity,
        roomName,
      });

      if (res.status === 200) {
        return res.data.data.token;
      } else {
        return "";
      }
    } catch (error) {
      console.error("Error fetching career list:", error);
      return "";
    }
  },
  createRoom: async (roomName: string): Promise<boolean> => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/rooms/create-room`, {
        roomName,
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
};

export default meetingApi;
