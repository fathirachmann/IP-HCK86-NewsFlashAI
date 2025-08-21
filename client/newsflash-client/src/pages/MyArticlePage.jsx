// src/pages/MyArticlePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchArticles,
  resummarizeArticle,
  deleteArticle,
  selectArticles,
  selectArticlesLoading,
  selectArticlesError,
} from "../store/articlesSlice";

// ------------------------------
// TEMPORARY HORIZONTAL CARD (NewsFlashAI style)
// ------------------------------
function TempHorizontalCard({ article, onResummarize, onDelete }) {
  const { picture, title, url, impact, sentiment, summary, keywords } = article;

  const bullets = String(summary || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const chips = String(keywords || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const sentimentBadge = {
    positive:
      "bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700/60",
    neutral:
      "bg-slate-100 text-slate-900 border-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-700",
    negative:
      "bg-rose-100 text-rose-900 border-rose-200 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-700/60",
  }[sentiment] || "bg-slate-100 text-slate-900 border-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-700";

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm dark:bg-slate-900/60 dark:border-slate-800">
      <div className="flex">
        {/* Left image */}
        <div className="w-40 min-w-40 h-40 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          {picture ? (
            <img
              src={picture}
              alt={title || "Article image"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-slate-500 text-sm">No Image</span>
          )}
        </div>

        {/* Divider */}
        <div className="w-px bg-slate-200 dark:bg-slate-800" />

        {/* Right content */}
        <div className="flex-1 p-4 md:p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                {title || "-"}
              </h3>

              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-sm text-indigo-600 hover:text-indigo-700 underline underline-offset-2 break-all dark:text-indigo-400 dark:hover:text-indigo-300"
                title={url}
              >
                {url || "-"}
              </a>

              <div className="mt-2 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Impact:
                </span>{" "}
                <span className="text-slate-800 dark:text-slate-200">
                  {impact || "-"}
                </span>
              </div>

              <div className="mt-1">
                <span
                  className={`inline-block text-xs px-2 py-1 rounded-full border ${sentimentBadge}`}
                >
                  Sentiment: {sentiment || "-"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={onResummarize}
                className="px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-[.98] transition dark:border-indigo-900/40 dark:bg-indigo-900/30 dark:text-indigo-200 dark:hover:bg-indigo-900/40"
              >
                Resummarize
              </button>
              <button
                onClick={onDelete}
                className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 active:scale-[.98] transition dark:border-rose-900/40 dark:bg-rose-900/30 dark:text-rose-200 dark:hover:bg-rose-900/40"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-3 text-sm">
            <div className="font-medium text-slate-700 dark:text-slate-300 mb-1">
              Article Summary
            </div>
            {bullets.length ? (
              <ul className="list-disc ml-5 leading-6 text-slate-800 dark:text-slate-200">
                {bullets.map((b, i) => (
                  <li key={i} className="pl-1">
                    {b}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-slate-500 italic">No summary</div>
            )}
          </div>

          {/* Keywords */}
          <div className="mt-3">
            <div className="font-medium text-slate-700 dark:text-slate-300 mb-1">
              Keywords
            </div>
            {chips.length ? (
              <div className="flex flex-wrap gap-2">
                {chips.map((k, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded-full border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {k}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 italic text-sm">—</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------
// PAGE (NewsFlashAI style)
// ------------------------------
export default function MyArticlePage() {
  const dispatch = useDispatch();
  const articles = useSelector(selectArticles);
  const loading = useSelector(selectArticlesLoading);
  const error = useSelector(selectArticlesError);

  // optional search (client-side for now)
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchArticles());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter((a) => {
      const hay = `${a.title ?? ""} ${a.url ?? ""} ${a.summary ?? ""} ${a.keywords ?? ""} ${a.impact ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [articles, search]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
      <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          My Articles
        </h1>

        {/* Search (optional) */}
        <div className="relative w-full sm:w-80">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, URL, keywords…"
            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs"
            >
              Clear
            </button>
          )}
        </div>
      </header>

      {loading && (
        <div className="text-slate-500 mb-3">Loading…</div>
      )}

      {error && (
        <div className="text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 mb-4 dark:bg-rose-900/20 dark:text-rose-200 dark:border-rose-800">
          {String(error)}
        </div>
      )}

      <section className="space-y-4">
        {filtered.map((a) => (
          <TempHorizontalCard
            key={a.id}
            article={a}
            onResummarize={() => dispatch(resummarizeArticle(a.id))}
            onDelete={() => dispatch(deleteArticle(a.id))}
          />
        ))}

        {!loading && !filtered.length && (
          <div className="text-slate-500 italic">
            {search ? "No articles match your search." : "No articles yet."}
          </div>
        )}
      </section>
    </div>
  );
}
