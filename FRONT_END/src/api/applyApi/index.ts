import { BACKEND_URL } from "@/utils/env";
import axios, { AxiosError } from "axios";
import { IResponse, ITable } from "../common/type";
import { TJob } from "../jobApi";
import JobPosting from "@/type/job";
import { IAccount } from "../accountApi/accountApi";
import { IApplicantReport } from "../applicantReportApi";
import { ICriteria } from "../criteriaApi";

export interface IApply {
  _id: string;
  cv: string | ICV;
  job: string | TJob;
  status: string | any;
  statusUpdatedBy: string | IAccount[];
  createdBy: string | IAccount;
  assigns: string[] | IAccount[];
  applicantReports: string[] | IApplicantReport[];
  statusUpdatedAt: Date;
  cvScore?: ICVScore | null;
}

export interface ICVScore {
  averageScore: string;
  detailScore: {
    _id: string;
    criterionId: string | ICriteria;
    criterion: string;
    score: string;
    explanation: string;
  }[];
}

export interface IResposeApply {
  _id: string;
  cv: ICV;
  job: JobPosting;
  status: { name: string };
  assigns: string[];
  createdAt: string;
}

export interface ICV {
  address: string;
  cv: File;
  email: string;
  firstName: string;
  gender: string;
  lastName: string;
  phoneNumber: number;
}

export interface PaginatedApplies {
  [x: string]: any;
  applies: IApply[];
  totalApplies: number;
  currentPage: number;
  totalPages: number;
}

export interface QApply {
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string | string[];
  sortOrder?: "asc" | "desc";
}

export const applyApi = {
  getApplyByJob: async ({
    _id,
    page,
    limit,
    status,
    sort,
  }: {
    _id: string;
    page: number;
    limit: number;
    status?: string;
    sort?: string;
  }): Promise<ITable<IApply>> => {
    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/v1/apply/cvs/${_id}?page=${page}&limit=${limit}&status=${
          status ?? ""
        }&sort=${sort ?? ""}`
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

  applyToJob: async (cvData: ICV, jobId: string, cvInfo: any) => {
    try {
      const accessToken = localStorage.getItem("access_token");

      // Create FormData and append CV data and file
      const formData = new FormData();

      // Append all fields to FormData
      formData.append("address", cvData.address);
      formData.append("cv", cvData.cv); // File field
      formData.append("email", cvData.email);
      formData.append("firstName", cvData.firstName);
      formData.append("gender", cvData.gender);
      formData.append("lastName", cvData.lastName);
      formData.append("phoneNumber", cvData.phoneNumber.toString());

      // 3. Send the CV creation request
      const cvResponse = await (
        await axios.post(`${BACKEND_URL}/api/v1/cvs`, formData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        })
      ).data;

      console.log(cvResponse.data.cv._id);

      if (cvResponse.status === 201) {
        // CV created successfully!
        const cvId = cvResponse.data.cv._id;

        const formData = new FormData();

        formData.append("cv", cvData.cv);
        formData.append("cvId", cvId);
        formData.append("jobId", jobId);

        // 4. Send the job application request
        const applyResponse = await axios.post(
          `${BACKEND_URL}/api/v1/apply/apply-job`,
          {
            cvId: cvId,
            jobId: jobId,
            cvInfo: cvInfo,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (applyResponse.status === 201) {
          // Application successful!
          console.log("Job application successful:", applyResponse.data);
        } else {
          // Throw an error for non-201 responses
          throw new Error("Error applying to job. Please try again later.");
        }
      } else {
        // Throw an error for non-201 responses
        throw new Error("Error creating CV. Please try again later.");
      }
    } catch (err) {
      console.error("Error during API calls:", err);
      // Re-throw to propagate the error
      throw err;
    }
  },

  getApplicationById: async ({
    _id,
  }: {
    _id: string;
  }): Promise<IApply | null> => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/apply/${_id}`);

      if (res.status === 200) {
        return res.data.data;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching career list:", error);
      return null;
    }
  },

  updateApplyStatus: async ({
    applyId,
    newStatus,
  }: {
    applyId: string;
    newStatus: string;
  }): Promise<IApply | null> => {
    try {
      const res = await axios.put(
        `${BACKEND_URL}/api/v1/applies/update-status`,
        {
          applyId,
          newStatus,
        }
      );

      if (res.status === 200) {
        return res.data.data;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error update apply status:", error);
      return null;
    }
  },

  getCvFileById: async ({ cvId }: { cvId: string }) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/v1/cvs/${cvId}/download`,
        {
          responseType: "blob", // Important for downloading files
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      return url;
    } catch (error) {
      console.error("Error downloading CV:", error);
      return "n/a";
      // Handle errors gracefully (e.g., show a user-friendly error message)
    }
  },

  getApplicationsById: async (queryParams: QApply = {}) => {
    try {
      const response = await axios.get<PaginatedApplies>(
        `${BACKEND_URL}/api/v1/apply`,
        {
          params: queryParams, // Include query parameters
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`, // Replace with your token retrieval logic
          },
        }
      );

      return response.data;
    } catch (error: any) {
      // Handle API errors appropriately, e.g.,
      console.error("Error fetching applies:", error);
      throw error; // Or re-throw if you want to handle the error at a higher level
    }
  },

  getApplicationByApply: async (
    applyId: string
  ): Promise<{
    applicantReport: Partial<IApplicantReport>;
  }> => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/v1/applicant-reports/${applyId}/apply`
      );

      return { applicantReport: response.data.data };
    } catch (error: any) {
      // Handle API errors appropriately, e.g.,
      console.error("Error fetching applie:", (error as AxiosError).message);
      return { applicantReport: {} };
    }
  },

  fetchStatuses: async () => {
    try {
      const response = await axios.get<{ name: string; _id: string }[]>(
        `${BACKEND_URL}/api/v1/apply/statuses/all`
      );
      return response.data; // Return the array of CV statuses
    } catch (error: any) {
      console.error("Error fetching statuses:", error);
      throw error;
    }
  },

  getApplyInfo: async (jobId: string) => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await axios.get<{ name: string; _id: string }[]>(
        `${BACKEND_URL}/api/v1/apply/info/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data; // Return the array of CV statuses
    } catch (error: any) {
      console.error("Error fetching statuses:", error);
      // throw error;
    }
  },

  getOcrCV: async (file: File) => {
    try {
      const formData = new FormData();

      formData.append("cv", file);
      const res = await (
        await axios.post(`${BACKEND_URL}/api/v1/apply/ocr/cv`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      )?.data;
      return res;
    } catch (error) {
      console.log("Error get OCR CV", error);
      return null;
    }
  },
};

export default applyApi;
