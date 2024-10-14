import axios from "axios";

const locationApi = {
  getLocationList: async (): Promise<{ locations: TLocation[] }> => {
    try {
      const res = await axios.get("http://localhost:9999/api/v1/locations");

      if (res.status === 200) {
        return { locations: res.data.data };
      } else {
        return { locations: [] };
      }
    } catch (error) {
      console.error("Error fetching location list:", error);
      return { locations: [] };
    }
  },
};

export default locationApi;

export type TLocation = { _id: string; city?: string };
