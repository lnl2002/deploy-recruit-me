import { BACKEND_URL } from "@/utils/env";
import axios from "axios";

const careerApi = {
  getCareerList: async (): Promise<{ careers: TCareer[] }> => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/careers`);

      if (res.status === 200) {
        return { careers: res.data.data };
      } else {
        return { careers: [] };
      }
    } catch (error) {
      console.error("Error fetching career list:", error);
      return { careers: [] };
    }
  },
};

export default careerApi;

export type TCareer = {
  _id: string;
  name: string;
  image: string;
  introduction: string;
};
