import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ArticleCard from "../components/ArticleCard";
import { BASE_URL } from "../utils/base-http";

export default function MyArticlesPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function getAuthHeaders() {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  function ensureAuthedOrRedirect() {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      navigate("/login");
      return false;
    }
    return true;
  }

  const loadArticles = async () => {
    if (!ensureAuthedOrRedirect()) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await BASE_URL.get("/articles", {
        headers: { ...getAuthHeaders() },
      });
      const rows = Array.isArray(data) ? data : data.data || [];
      setArticles(rows);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        try {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
        } catch {
          null;
        }
        navigate("/login");
        return;
      }
      setError(err?.response?.data?.message || err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResummarize = async (id) => {
    if (!ensureAuthedOrRedirect()) return;
    try {
      await BASE_URL.post(
        "/ai/summarize",
        { articleId: id, persist: true },
        { headers: { ...getAuthHeaders() } }
      );
      await loadArticles();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        try {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
        } catch {
          null;
        }
        navigate("/login");
      } else {
        console.error(err);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!ensureAuthedOrRedirect()) return;
    try {
      await BASE_URL.delete(`/articles/${id}`, {
        headers: { ...getAuthHeaders() },
      });
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        try {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
        } catch {
          null;
        }
        navigate("/login");
      } else {
        console.error(err);
      }
    }
  };

  const handleCheckNotes = (article) => {
    if (!article?.id) return;
    navigate(`/notes/${article.id}`, { state: { article } });
  };

  return (
    <div className="relative min-h-screen">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Background image */}
        <div className="absolute inset-0 bg-[url('https://wallpapers.com/images/featured/old-newspaper-background-xayuetybyd5mf1st.jpg')] bg-cover bg-center opacity-40" />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(60% 60% at 100% 0%, rgba(88,160,200,0.18) 0%, rgba(88,160,200,0) 60%)," +
              "radial-gradient(55% 55% at 0% 100%, rgba(253,245,170,0.25) 0%, rgba(253,245,170,0) 60%)," +
              "linear-gradient(135deg, rgba(11,29,46,0.7) 0%, rgba(17,63,103,0.5) 42%, rgba(88,160,200,0.35) 100%)",
          }}
        />
        {/* Veil */}
        <div className="absolute inset-0 bg-[#0b1d2e]/25" />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <header className="mb-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#FFFFFF]">
                My Articles
              </h1>
              <p className="text-sm text-[#FFFFFF]">
                Ringkasan artikel yang sudah kamu simpan & olah dengan AI.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadArticles}
                className="rounded-full bg-[#113F67] text-white px-4 py-2 text-sm hover:opacity-90"
                title="Refresh list"
              >
                Refresh
              </button>
              <a
                href="/summarizer"
                className="rounded-full bg-[#58A0C8] text-white px-4 py-2 text-sm hover:opacity-90"
                title="Summarize new article"
              >
                New Summary
              </a>
            </div>
          </div>

          {/* Stat bar */}
          <div className="mt-3 rounded-xl border border-[#113F67]/10 bg-white/90 shadow-sm px-3 py-2 text-sm text-[#113F67] flex items-center gap-3">
            <span className="px-2 py-0.5 rounded-full bg-[#FDF5AA] text-[#113F67]">
              {articles.length} items
            </span>
            <span className="text-[#34699A]">
              Last refresh: {new Date().toLocaleString()}
            </span>
          </div>
        </header>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-[#113F67]/10 bg-white shadow-sm"
              >
                <div className="flex">
                  <div className="w-40 min-w-40 h-40 bg-[#FDF5AA] animate-pulse" />
                  <div className="flex-1 p-4">
                    <div className="h-5 w-2/3 bg-[#FDF5AA] rounded animate-pulse" />
                    <div className="mt-2 h-3 w-1/3 bg-[#FDF5AA] rounded animate-pulse" />
                    <div className="mt-3 space-y-2">
                      <div className="h-3 w-full bg-[#FDF5AA] rounded animate-pulse" />
                      <div className="h-3 w-5/6 bg-[#FDF5AA] rounded animate-pulse" />
                      <div className="h-3 w-2/3 bg-[#FDF5AA] rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 mb-4 text-rose-700">
            {error}
          </div>
        )}

        {/* List */}
        {!loading && !error && (
          <section className="space-y-4">
            {articles.map((a) => (
              <div
                key={a.id}
                className="overflow-hidden rounded-2xl border border-[#113F67]/10 bg-white shadow-sm"
              >
                <ArticleCard
                  article={a}
                  onResummarize={() => handleResummarize(a.id)}
                  onDelete={() => handleDelete(a.id)}
                  onCheckNotes={handleCheckNotes}
                />
              </div>
            ))}

            {/* Empty state */}
            {!articles.length && (
              <div className="rounded-2xl border border-dashed border-[#113F67]/20 bg-white/70 p-8 text-center">
                <div className="mx-auto mb-3 h-14 w-14 rounded-2xl bg-[#FDF5AA] grid place-items-center text-[#113F67] text-xl">
                  📰
                </div>
                <h2 className="text-[#113F67] font-semibold">No articles yet</h2>
                <p className="text-sm text-[#34699A] mt-1">
                  Mulai dengan men-summary artikel favoritmu.
                </p>
                <a
                  href="/summarizer"
                  className="inline-block mt-4 rounded-full bg-[#58A0C8] text-white px-4 py-2 text-sm hover:opacity-90"
                >
                  Summarize an Article
                </a>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
