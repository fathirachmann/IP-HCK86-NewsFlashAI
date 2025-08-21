import { configureStore } from "@reduxjs/toolkit";
import newsReducer from "./features/news/newsSlice";

export const store = configureStore({
  reducer: {
    news: newsReducer,
  },
});