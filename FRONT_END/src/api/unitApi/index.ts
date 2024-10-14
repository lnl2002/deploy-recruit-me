import axios from "axios";

const unitApi = {
  getUnitList: async (): Promise<{ units: TUnit[] }> => {
    try {
      const res = await axios.get("http://localhost:9999/api/v1/units");

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
  introduction?: string;
  locations: string[];
};
