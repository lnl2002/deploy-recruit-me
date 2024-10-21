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

  applyToJob: async (cvData: Partial<TJob>, jobId: string) => {
    try {
      // 3. Send the CV creation request
      const cvResponse = await (
        await axios.post(`${BACKEND_URL}/api/v1/cvs`, cvData)
      ).data;

      console.log(cvResponse.data.cv._id);

      if (cvResponse.status === 201) {
        // CV created successfully!
        const cvId = cvResponse.data.cv._id;

        // 4. Send the job application request
        const applyResponse = await axios.post(
          `${BACKEND_URL}/api/v1/apply/apply-job`,
          { cvId, jobId }
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
};

export default applyApi;
