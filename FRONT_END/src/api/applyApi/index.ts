import { BACKEND_URL } from "@/utils/env";
import axios from "axios";
import { IResponse, ITable } from "../common/type";

export interface IApply {
  _id: string;
  cv: string;
  job: string;
  status: string;
  assigns: string[];
}

const applyApi = {
  getApplyByJob: async ({
    _id,
    page,
    limit,
  }: {
    _id: string;
    page: number;
    limit: number;
  }): Promise<ITable<IApply>> => {
    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/v1/apply/cvs/${_id}?page=${page}&limit=${limit}`
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
};

export default applyApi;
