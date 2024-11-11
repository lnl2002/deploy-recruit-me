import { IResposeApply } from "@/api/applyApi";
import JobPosting from "@/type/job";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ApplyState {
  applyInfo: IResposeApply | null;
}

const initialState: ApplyState = {
    applyInfo: null,
};

const applyInfoSlice = createSlice({
  name: "applyInfo",
  initialState,
  reducers: {
    setApplyInfo: (state, action: PayloadAction<IResposeApply>) => {
      state.applyInfo = action.payload;
    },
    clearApplyInfo: (state) => {
      state.applyInfo = null;
    },
  },
});

export const { setApplyInfo, clearApplyInfo } = applyInfoSlice.actions;
export const applyInfoReducer = applyInfoSlice.reducer;
