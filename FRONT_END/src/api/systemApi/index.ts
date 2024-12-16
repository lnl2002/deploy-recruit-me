import { BACKEND_URL } from "@/utils/env";
import axios from "axios";
import { TJob } from "../jobApi";

export interface INoti {
  _id: string;
  receiver: string;
  content: string;
  url: string;
  createdAt: Date;
  updateAt: Date;
  seen: Boolean;
}

// Adjust the Content type to use the Part type
interface Content {
  role: string;
  parts: { text: string }[];
  // Add other properties as needed
}

interface notiData {
  notifications: INoti[];
  totalPages: number;
  currentPage: number;
}

interface DataQuery {
  readyToFind?: boolean;
}

const systemApi = {
  getAIResponse: async (
    input: string,
    history: Content[]
  ): Promise<{ response: string; data: DataQuery }> => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/system/ai-chat`, {
        input: input,
        history: history,
      });

      if (res.status === 200) {
        return res.data.data;
      } else {
        return {
          response: "Some error occur, we can answer you right now.",
          data: {},
        };
      }
    } catch (error) {
      console.error("Error fetching units list:", error);
      return {
        response: "Some error occur, we can answer you right now.",
        data: {},
      };
    }
  },

  getAIJobsResponse: async (history: Content[]): Promise<TJob[]> => {
    try {
      const url = `${BACKEND_URL}/api/v1/system/ai-chat/jobs`;

      const res = await axios.post(url, { history: history });
      console.log(res.data);
      if (res.status === 200) {
        return res.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error fetching units list:", error);
      return [];
    }
  },

  createNotification: async ({
    receiver,
    content,
    url,
  }: {
    receiver: string;
    content: string;
    url: string;
  }) => {
    console.log("Noti", receiver + "==" + content + "==" + url);

    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/system/notifications`,
        {
          receiver: receiver,
          content: content,
          url: url,
        }
      );

      if (res.status === 200) {
        console.log("Notification sent");
      }
    } catch (error) {
      console.error("Error fetching units list:", error);
      return {
        response: "Some error occur, we can answer you right now.",
        data: {},
      };
    }
  },

  getUserNotifications: async (
    seen: string,
    page = 1,
    limit = 10
  ): Promise<notiData> => {
    try {
      const queryParams = new URLSearchParams({
        seen: seen ? seen.toString() : "all",
        page: page.toString(),
        limit: limit.toString(),
      });
      const res = await axios.get(
        `${BACKEND_URL}/api/v1/system/notifications?${queryParams}`
      );

      return res.data.data;
    } catch (error) {
      console.error("Error fetching units list:", error);
      return { currentPage: 1, totalPages: 1, notifications: [] };
    }
  },

  markAsSeen: async (notificationId: string) => {
    try {
      const response = await axios.patch(
        `${BACKEND_URL}/api/v1/system/notifications/${notificationId}/seen`
      );
      console.log("Notification marked as seen:", response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  },
};

export default systemApi;
