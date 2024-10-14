import { BACKEND_URL } from "@/utils/env";
import axios from "axios";

const jobApi = {
  getJobList: async (
    params: string
  ): Promise<{ jobs: any[]; total: number }> => {
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
};

export default jobApi;

export type TJob = {
  _id: string;
  title: string;
  minSalary: number;
  maxSalary: number;
  numberPerson: number;
  unit: {
    _id: string;
    name: string;
    banner: string;
    image: string;
    location: {
      _id: string;
      city: string;
      __v: number;
    };
    __v: number;
  };
  career: {
    _id: string;
    name: string;
    __v: number;
  };
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
  location: {
    _id: string;
    city: string;
    __v: number;
  };
  expiredDate: string; // ISO date string
  type: string;
  isDelete: boolean;
  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
};
