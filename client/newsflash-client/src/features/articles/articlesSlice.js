import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import { BASE_API } from "../utils/http-client";

// Hanya ambil list artikel milik user yang SUDAH disummarize
export const fetchArticles = createAsyncThunk(
  "articles/fetch",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { search = "", page = 1, limit = 20 } = params;
      const { data } = await BASE_API.get("/articles", { params: { search, page, limit, summarized: true } });
      const rows = Array.isArray(data) ? data : data.data || [];
      return rows;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

const slice = createSlice({
  name: "articles",
  initialState: { byId: {}, allIds: [], loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchArticles.pending, (s) => { s.loading = true; s.error = null; });
    b.addCase(fetchArticles.fulfilled, (s, { payload }) => {
      s.loading = false; s.byId = {}; s.allIds = [];
      payload.forEach((row) => { s.byId[row.id] = row; s.allIds.push(row.id); });
    });
    b.addCase(fetchArticles.rejected, (s, { payload }) => {
      s.loading = false; s.error = payload?.message || "Failed to fetch";
    });
  }
});

export default slice.reducer;

// selectors
export const selectArticlesState = (st) => st.articles;
export const selectArticles = createSelector(selectArticlesState, (s) => s.allIds.map((id) => s.byId[id]));
export const selectArticlesLoading = createSelector(selectArticlesState, (s) => s.loading);
export const selectArticlesError = createSelector(selectArticlesState, (s) => s.error);
