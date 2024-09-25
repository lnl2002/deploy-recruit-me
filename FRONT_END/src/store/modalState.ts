import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface appModal {
    isLoading_g: boolean,
    isSuccess_g: boolean,
    message_g: string,
}

const initialState: appModal = {
    isLoading_g: false,
    isSuccess_g: true,
    message_g: "Vui lòng đợi...",
}
// The official documentation defines a slice as “a collection of Redux reducer logic and actions for a single feature in your app.”
export const appModalSlice = createSlice({
    name: 'appModal',
    initialState,
    reducers: {
        setIsloading_g: (state, action: PayloadAction<boolean>) => {
            state.isLoading_g = action.payload;
        },
        setIsSuccess_g: (state, action: PayloadAction<boolean>) => {
            state.isSuccess_g = action.payload;
        },
        setMessage_g:  (state, action: PayloadAction<string>)  => {
            state.message_g = action.payload
        },
    }
})

export const {setIsloading_g, setMessage_g, setIsSuccess_g} = appModalSlice.actions;
export const appModalReducer = appModalSlice.reducer;