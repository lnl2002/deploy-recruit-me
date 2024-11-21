import { BACKEND_URL } from "@/utils/env";
import axios from "axios";
import { ICriteria } from "../criteriaApi";

const groupCriteriaApi = {
  getGroupCriterias: async (
    params: string
  ): Promise<{ groupCriterias: IGroupCriteria[] }> => {
    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/v1/group-criterias${params}`
      );

      if (res.status === 200) {
        return { groupCriterias: res.data.data };
      } else {
        return { groupCriterias: [] };
      }
    } catch (error) {
      return { groupCriterias: [] };
    }
  },
  getGroupCriteria: async (
    id: string
  ): Promise<{ groupCriteria: IGroupCriteria | null; code: number }> => {
    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/v1/group-criterias/${id}`
      );
      return { groupCriteria: res.data.data, code: res.status };
    } catch (error: any) {
      return { groupCriteria: null, code: error.response.status };
    }
  },
};

export default groupCriteriaApi;

export interface IGroupCriteria {
  _id: string;
  criterias?: string[] | ICriteria[];
  unit: string;
  name: string;
}
