import { BACKEND_URL } from "@/utils/env";
import axios from "axios";
import { TLocation } from "../locationApi";

const systemApi = {
  getAIResponse: async (input: string): Promise<{ response: string; data: Object }> => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/system/ai-chat`, {
        input: input
      });

      if (res.status === 200) {
        return res.data.data;
      } else {
        return {
          response: "Some error occur, we can anser you right now.",
          data: {},
        };
      }
    } catch (error) {
      console.error("Error fetching units list:", error);
      return {
        response: "Some error occur, we can anser you right now.",
        data: {},
      };
    }
  },
};

export default systemApi;
