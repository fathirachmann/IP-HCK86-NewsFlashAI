// /src/features/news/newsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "../../utils/base-http";

// params: { q, from, to, page, pageSize }
export const fetchNews = createAsyncThunk(
  "news/fetchNews",
  async (params, { rejectWithValue }) => {
    try {
      const res = await BASE_URL.get("/news/search", { params });
      return { data: res.data, params };
    } catch (err) {
      const msg = err?.response?.data || err?.message || "Request failed";
      return rejectWithValue(msg);
    }
  }
);

const initialState = {
  items: [],
  totalResults: 0,

  // last used query params (for pagination)
  q: "",
  from: "",
  to: "",
  page: 1,
  pageSize: 10,

  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const newsSlice = createSlice({
  name: "news",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state, action) => {
        state.status = "loading";
        const p = action.meta.arg || {};
        if (p.q !== undefined) state.q = p.q;
        if (p.from !== undefined) state.from = p.from;
        if (p.to !== undefined) state.to = p.to;
        if (p.page) state.page = p.page;
        if (p.pageSize) state.pageSize = p.pageSize;
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { data } = action.payload || {};
        state.items = data?.articles || [];
        state.totalResults = data?.totalResults ?? 0;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || String(action.error?.message || "Error");
      });
  },
});

export const selectNews = (state) => state.news;
export default newsSlice.reducer;