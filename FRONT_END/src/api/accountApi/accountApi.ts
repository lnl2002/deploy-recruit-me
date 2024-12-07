import { BACKEND_URL } from "@/utils/env";
import axios from "axios";

export interface ICreateAccount {
  name: string;
  email: string;
  role: string; //ObjectId
  unit?: string; //ObjectId
}

const accountApi = {
  getListAccount: async (
    params: string
  ): Promise<{
    accounts: IAccount[];
    total: number;
  }> => {
    let newParams = "?expiredDate=1&sort_by=createdAt&order=1" + params;
    try {
      const { status, data } = await axios.get(
        `${BACKEND_URL}/api/v1/accounts${newParams}`
      );

      if (status === 200) {
        return {
          accounts: data.data.accounts,
          total: data.data.total,
        };
      } else {
        return { accounts: [], total: 0 };
      }
    } catch (error) {
      return { accounts: [], total: 0 };
    }
  },
  getInterviewerByUnit: async (unitId: string) => {
    try {
      const { status, data } = await axios.get(
        `${BACKEND_URL}/api/v1/accounts/interviewers?unitId=${unitId}`
      );

      if (status === 200) {
        return data?.data || [];
      } else {
        return [];
      }
    } catch (error) {
      console.log("getInterviewerByUnit error:", error);

      return [];
    }
  },
  createAccount: async (info: ICreateAccount) => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/accounts`, info);

      return res?.data?.data;
    } catch (error) {
      console.log("Error createAccount", error);
      return undefined;
    }
  },
  updateStatus: async ({
    accountId,
    status,
  }: {
    accountId: string;
    status: string; //ObjectId
  }) => {
    try {
      const res = await axios.put(
        `${BACKEND_URL}/api/v1/accounts/${accountId}/status`,
        { status }
      );

      return res?.data?.data;
    } catch (error) {
      console.log("Error updateStatus", error);
      return undefined;
    }
  },
  getListAccountForAdmin: async ({
    limit = 10,
    name,
    email,
    sort_by = "createdAt",
    order = 1,
    role,
    page = 1,
    status,
  }: {
    limit?: number;
    name?: string;
    email?: string;
    sort_by?: string;
    order?: number;
    role?: string;
    page?: number;
    status?: string;
  }): Promise<{
    accounts: IAccount[];
    total: number;
  }> => {
    try {
      const skip = (page - 1) * limit;

      const params: Record<string, any> = {
        skip,
        limit,
        name,
        email,
        sort_by,
        order,
        role,
        status,
      };

      // Loại bỏ các giá trị undefined hoặc null
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(
          ([_, value]) => value !== undefined && value !== null && value !== ""
        )
      );

      const { status: code, data } = await axios.get(
        `${BACKEND_URL}/api/v1/accounts`,
        {
          params: filteredParams,
        }
      );

      if (code === 200) {
        return {
          accounts: data.data.accounts,
          total: data.data.total,
        };
      } else {
        return { accounts: [], total: 0 };
      }
    } catch (error) {
      return { accounts: [], total: 0 };
    }
  },
};

export default accountApi;

export interface IAccount {
  _id: string;
  googleId: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  unit?: string;
  cvs: string[];
  image?: string;
  createdAt: string;
  updatedAt: string;
  status: IAccoutStatus;
}

export enum IAccoutStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}
