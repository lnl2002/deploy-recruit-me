import { BACKEND_URL } from "@/utils/env";
import axios from "axios";
import { IResponse, ITable } from "../common/type";
import { TJob } from "../jobApi";

export interface IApply {
  _id: string;
  cv: string;
  job: string;
  status: string;
  assigns: string[];
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

export const applyApi = {
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

  applyToJob: async (cvData: ICV, jobId: string) => {
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

        // 4. Send the job application request
        const applyResponse = await axios.post(
          `${BACKEND_URL}/api/v1/apply/apply-job`,
          { cvId, jobId },
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
      const response = await axios.get(`${BACKEND_URL}/api/v1/cvs/${cvId}/download`, {
        responseType: "blob", // Important for downloading files
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf'}));
      return url;
    } catch (error) {
      console.error("Error downloading CV:", error);
      return "n/a"
      // Handle errors gracefully (e.g., show a user-friendly error message)
    }
  },
};

export default applyApi;
