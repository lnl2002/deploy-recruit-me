import { BACKEND_URL } from "@/utils/env";
import axios, { AxiosError } from "axios";
import { TLocation } from "../locationApi";
import { TUnit } from "../unitApi";
import { TCareer } from "../careerApi";
import { IAccount } from "../accountApi/accountApi";
import { IApply } from "../applyApi";
import { IGroupCriteria } from "../groupCriteriaApi";
import { ICriteria } from "../criteriaApi";

const jobApi = {
  getJobList: async (
    params: string,
    owner?: boolean
  ): Promise<{ jobs: TJob[]; total: number }> => {
    let newParams = "?sort_by=createdAt&order=1" + params;
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
      console.error("Error fetching job list:", (error as AxiosError).status);
      if ((error as AxiosError).status === 401) {
        window.location.href = "/login";
      }
      return { jobs: [], total: 0 };
    }
  },

  getJobById: async (id: string): Promise<{ job: Partial<TJob> }> => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/jobs/${id}`);

      return { job: res.data.data };
    } catch (error) {
      return { job: {} };
    }
  },

  updateJob: async (
    id: string,
    newJob: Partial<TJob>
  ): Promise<{ job: Partial<TJob> }> => {
    try {
      const res = await axios.patch(`${BACKEND_URL}/api/v1/jobs/${id}`, newJob);

      return { job: res.data.data };
    } catch (error: any) {
      const { status } = error as AxiosError;
      if (status === 401) {
        window.location.href = "/login";
      }
      return { job: {} };
    }
  },

  addJob: async (job: Partial<TJob>): Promise<{ job: Partial<TJob> }> => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/jobs`, job);

      if (res.status === 200) {
        return { job: res.data.data };
      } else {
        return { job: {} };
      }
    } catch (error) {
      return { job: {} };
    }
  },

  getJobsByInterviewManager: async ({
    limit,
    page,
    status,
    search,
  }: {
    limit: number;
    page: number;
    status?: string;
    search?: string;
  }) => {
    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/v1/jobs/interview-manager/list-jobs?limit=${limit}&page=${page}&status=${status}&search=${search}`
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

  updateJobStatus: async ({
    jobId,
    status,
    rejectReason,
  }: {
    jobId: string;
    status: string;
    rejectReason?: string;
  }) => {
    try {
      const res = await axios.put(`${BACKEND_URL}/api/v1/jobs/update-status`, {
        jobId,
        status,
        rejectReason,
      });
      if (res.status === 200) {
        return res.data.data;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error update job status:", error);
      return null;
    }
  },

  deleteJob: async (id: string): Promise<{ job: Partial<TJob> }> => {
    try {
      const res = await axios.delete(`${BACKEND_URL}/api/v1/jobs/${id}`);

      return { job: res.data.data };
    } catch (error: any) {
      const { status } = error as AxiosError;
      if (status === 401) {
        window.location.href = "/login";
      }
      return { job: {} };
    }
  },

  restoreJob: async (id: string): Promise<{ job: Partial<TJob> }> => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/jobs/${id}/restore`);

      return { job: res.data.data };
    } catch (error: any) {
      const { status } = error as AxiosError;
      if (status === 401) {
        window.location.href = "/login";
      }
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
  startDate: string;
  type: string;
  isDelete: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  applies: string[] | Partial<IApply>[];
  status: JobStatus;
  criterias: string[] | ICriteria[];
  __v: number;
}

export enum JobStatus {
  PENDING = "pending",
  APPROVED = "approved",
  PUBLISHED = "published",
  EXPIRED = "expired",
  REOPENED = "reopened",
  REJECTED = "rejected",
}
