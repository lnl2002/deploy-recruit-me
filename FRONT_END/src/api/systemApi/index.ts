import { BACKEND_URL } from "@/utils/env";
import axios from "axios";

// Adjust the Content type to use the Part type
interface Content {
  role: string;
  content: string;
  // Add other properties as needed
}

const systemApi = {
  getAIResponse: async (input: string, history: Content[]): Promise<{ response: string; data: Object }> => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/system/ai-chat`, {
        input: input,
        history: history
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
};

export default systemApi;
