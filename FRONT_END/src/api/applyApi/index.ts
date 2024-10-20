import axios from "axios";
import { TJob } from "../jobApi";
import { BACKEND_URL } from "@/utils/env";

export const applyApi = {
  applyToJob: async (cvData: Partial<TJob>, jobId: string) => {
    try {
      // 3. Send the CV creation request
      const cvResponse = (await (await axios.post(`${BACKEND_URL}/api/v1/cvs`, cvData)).data);

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
