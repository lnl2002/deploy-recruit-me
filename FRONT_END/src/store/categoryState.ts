import { Category } from "@/models/Category";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";


const initialState: Category[] = [];

export const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      return action.payload; 
    },
    addCategory: (state, action: PayloadAction<Category>) => {
      state.push(action.payload);
    },
    removeCategory: (state, action: PayloadAction<string>) => {
      return state.filter(category => category.slug !== action.payload);
    },
  }
})

export const { setCategories, addCategory, removeCategory } = categorySlice.actions;
export const categoryReducer = categorySlice.reducer;
