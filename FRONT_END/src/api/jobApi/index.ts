import { BACKEND_URL } from "@/utils/env";
import axios from "axios";
import { TLocation } from "../locationApi";
import { TUnit } from "../unitApi";
import { TCareer } from "../careerApi";
import { IAccount } from "../accountApi/accountApi";
import { IApply } from "../applyApi";

const jobApi = {
  getJobList: async (
    params: string,
    owner?: boolean
  ): Promise<{ jobs: TJob[]; total: number }> => {
    let newParams = "?expiredDate=1&sort_by=createdAt&order=1" + params;
    console.log(newParams);

    try {
      const res = await (owner ? axios : axios.create()).get(
        `${BACKEND_URL}/api/v1/jobs${newParams}`
      );

      if (res.status === 200) {
        return { jobs: res.data.data.jobs, total: res.data.data.total };
      } else {
        return { jobs: [], total: 0 };
      }
    } catch (error) {
      console.error("Error fetching job list:", error);
      return { jobs: [], total: 0 };
    }
  },

  getJobListOwn: async (
    params: string,
    id: string
  ): Promise<{ jobs: TJob[]; total: number }> => {
    let newParams = "?expiredDate=1&sort_by=createdAt&order=1" + params;
    console.log(newParams);
    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/v1/jobs/user/${id}${newParams}`
      );

      if (res.status === 200) {
        return { jobs: res.data.data.jobs, total: res.data.data.total };
      } else {
        return { jobs: [], total: 0 };
      }
    } catch (error) {
      console.error("Error fetching job list:", error);
      return { jobs: [], total: 0 };
    }
  },

  getJobById: async (id: string): Promise<{ job: Partial<TJob> }> => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/jobs/${id}`);

      if (res.status === 200) {
        return { job: res.data.data };
      } else {
        return { job: {} };
      }
    } catch (error) {
      return { job: {} };
    }
  },

  addJob: async (job: Partial<TJob>): Promise<{ job: Partial<TJob> }> => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/jobs`, job);

      if (res.status === 201) {
        return { job: res.data.data };
      } else {
        return { job: {} };
      }
    } catch (error) {
      return { job: {} };
    }
  },
};

export default jobApi;

export interface TJob {
  _id: string;
  title: string;
  description: string;
  minSalary: number;
  maxSalary: number;
  numberPerson: number;
  requests: string;
  benefits: string;
  address: string;
  unit: string | TUnit;
  career: string | TCareer;
  account: string | IAccount;
  interviewManager: string | IAccount;
  location: string | TLocation;
  expiredDate: string;
  type: string;
  isDelete: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  applies: string[] | Partial<IApply>[];
  __v: number;
}
