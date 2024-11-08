import { BACKEND_URL } from "@/utils/env";
import axios from "axios";

const criteriaApi = {
  getCareerList: async (params: string): Promise<{ criterias: ICritera[] }> => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/criterias${params}`);

      if (res.status === 200) {
        return { criterias: res.data.data };
      } else {
        return { criterias: [] };
      }
    } catch (error) {
      return { criterias: [] };
    }
  },
};

export default criteriaApi;

export interface ICritera {
  _id: string;
  name: string;
  career: string;
}
