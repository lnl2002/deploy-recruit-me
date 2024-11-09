import JobPosting from "@/type/job";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface JobState {
  job: JobPosting | null;
  statusJobFilterIndex: number;
}

const initialState: JobState = {
  job: null,
  statusJobFilterIndex: 0,
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
    setStatusJobFilterIndex: (state, action: PayloadAction<number>) => {
      state.statusJobFilterIndex = action.payload;
    },
  },
});

export const { setJob, clearJob, setStatusJobFilterIndex } = jobSlice.actions;
export const jobReducer = jobSlice.reducer;
