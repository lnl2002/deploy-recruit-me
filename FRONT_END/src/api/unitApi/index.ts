import { BACKEND_URL } from "@/utils/env";
import axios from "axios";
import { TLocation } from "../locationApi";

const unitApi = {
  getUnitList: async (): Promise<{ units: TUnit[] }> => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/units`);

      if (res.status === 200) {
        return { units: res.data.data };
      } else {
        return { units: [] };
      }
    } catch (error) {
      console.error("Error fetching units list:", error);
      return { units: [] };
    }
  },
};

export default unitApi;

export type TUnit = {
  _id: string;
  name: string;
  image?: string;
  banner?: string;
  introduction?: string;
  locations: TLocation[];
};
