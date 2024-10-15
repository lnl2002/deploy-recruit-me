import { BACKEND_URL } from "@/utils/env";
import axios from "axios";
import { TLocation } from "../locationApi";
import { TUnit } from "../unitApi";
import { TCareer } from "../careerApi";

const jobApi = {
  getJobList: async (
    params: string
  ): Promise<{ jobs: TJob[]; total: number }> => {
    let newParams = "?expiredDate=1&sort_by=createdAt&order=1" + params;

    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/jobs${newParams}`);

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
};

export default jobApi;

export type TJob = {
  _id: string;
  title: string;
  minSalary: number;
  maxSalary: number;
  numberPerson: number;
  unit: TUnit;
  career: TCareer;
  account: {
    _id: string;
    googleId: string;
    email: string;
    name: string;
    role: string;
    image: string;
    cv: any[]; // Assuming cv is an array, if it's an array of specific objects, you can specify the type accordingly
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  interviewer: {
    _id: string;
    googleId: string;
    email: string;
    name: string;
    role: string;
    image: string;
    cv: any[]; // Same assumption as above
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  location: TLocation;
  expiredDate: string; // ISO date string
  type: string;
  isDelete: boolean;
  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
};
