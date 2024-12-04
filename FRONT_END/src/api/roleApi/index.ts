import { BACKEND_URL } from "@/utils/env";
import axios from "axios";
import { TLocation } from "../locationApi";

const roleApi = {
  getRoleList: async (): Promise<{ roles: TRole[] }> => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/roles`);

      if (res.status === 200) {
        return { roles: res.data.data };
      } else {
        return { roles: [] };
      }
    } catch (error) {
      console.error("Error fetching roles list:", error);
      return { roles: [] };
    }
  },
};

export default roleApi;

export type TRole = {
  _id: string;
  roleName: string;
};
