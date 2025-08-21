import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import { BASE_URL } from "../../utils/base-http"; // pastikan ini export string base URL

function buildApiUrl(path, params = {}) {
  const base = BASE_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const url = new URL(path.startsWith("/") ? path : `/${path}`, base);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && `${v}` !== "") url.searchParams.set(k, String(v));
  });
  return url.toString();
}

// Ambil artikel milik user yang SUDAH disummarize
export const fetchArticles = createAsyncThunk(
  "articles/fetch",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { search = "", page = 1, limit = 20 } = params;
      const url = buildApiUrl("/articles", { summarized: true, search, page, limit });

      const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // hapus kalau tidak pakai cookie/session
      });
      if (!res.ok) {
        let detail = null;
        try { detail = await res.json(); } catch {null}
        throw new Error(detail?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const rows = Array.isArray(data) ? data : data.data || [];
      return rows;
    } catch (err) {
      return rejectWithValue({ message: err.message || "Fetch failed" });
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
      s.loading = false; s.error = null;
      s.byId = {}; s.allIds = [];
      payload.forEach((row) => {
        if (!row?.id) return;
        s.byId[row.id] = row;
        s.allIds.push(row.id);
      });
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
