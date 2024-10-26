import { BACKEND_URL } from "@/utils/env";
import axios from "axios";

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
}
