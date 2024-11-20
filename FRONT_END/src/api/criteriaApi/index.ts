import { BACKEND_URL } from "@/utils/env";
import axios from "axios";

const criteriaApi = {
  getCareerList: async (
    params: string
  ): Promise<{ criterias: ICriteria[] }> => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/criterias${params}`);

      return { criterias: res.data.data };
    } catch (error) {
      return { criterias: [] };
    }
  },
};

export default criteriaApi;

export interface ICriteriaDetails {
  _id: string;
  detail: string;
  weight: string;
}

export interface ICriteria extends Document {
  _id: string;
  career?: string;
  name: string;
  basic: ICriteriaDetails;
  beginer: ICriteriaDetails;
  intermediate: ICriteriaDetails;
  advanced: ICriteriaDetails;
  expert: ICriteriaDetails;
}
