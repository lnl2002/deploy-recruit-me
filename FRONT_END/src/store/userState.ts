import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  _id?: string;
  displayName?: string;
  email?: string;
  role?: string;
  image?: string;
}

interface UserState {
  userInfo: User | null;
  isLoggedIn: boolean;
}

const initialState: UserState = {
  userInfo: null,
  isLoggedIn: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.userInfo = action.payload;
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.userInfo = null;
      state.isLoggedIn = false;
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.clear();
    },
    updateUserInfo: (state, action: PayloadAction<Partial<User>>) => {
      state.userInfo = { ...state.userInfo, ...action.payload };
    },
  },
});

export const { login, logout, updateUserInfo } = userSlice.actions;
export const userReducer = userSlice.reducer;
