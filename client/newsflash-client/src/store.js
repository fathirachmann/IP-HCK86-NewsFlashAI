import { configureStore } from "@reduxjs/toolkit";
import newsReducer from "./features/news/newsSlice";
import articlesReducer from "./features/articles/articlesSlice"; // ⬅️ baru

export const store = configureStore({
  reducer: {
    news: newsReducer,
    articles: articlesReducer, // ⬅️ daftar reducer baru
  },
});
