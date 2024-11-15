import { BACKEND_URL } from "@/utils/env";
import axios, { AxiosError } from "axios";
import { IAccount } from "../accountApi/accountApi";

const applicantReportApi = {
  updateApplicantReport: async (
    body: any
  ): Promise<{ status: number; data: Partial<IApplicantReport> }> => {
    try {
      const res = await axios.patch(
        `${BACKEND_URL}/api/v1/applicant-reports`,
        body
      );
      return { status: res.data.status, data: res.data.data };
    } catch (error: any) {
      return { status: (error as AxiosError)?.status as number, data: {} };
    }
  },
};

export default applicantReportApi;

export interface IApplicantReport {
  _id: string;
  details: IDetailCriteria[];
  createdBy: string | IAccount;
  comment: string;
  isPass: boolean;
}

export interface IDetailCriteria {
  _id?: string;
  criteriaName: string;
  comment: string;
}