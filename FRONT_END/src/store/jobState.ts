import JobPosting from "@/type/job";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface JobState {
  job: JobPosting | null;
}

const initialState: JobState = {
  job: null,
};

const jobSlice = createSlice({
  name: "job",
  initialState,
  reducers: {
    setJob: (state, action: PayloadAction<JobPosting>) => {
      state.job = action.payload;
    },
    clearJob: (state) => {
      state.job = null;
    },
  },
});

export const { setJob, clearJob } = jobSlice.actions;
export const jobReducer = jobSlice.reducer;
