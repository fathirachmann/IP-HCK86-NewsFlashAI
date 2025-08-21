import { Link } from "react-router";

export default function NewsCard({ article, onSummarize }) {
  if (!article) return null;

  const { title, url, imageUrl, sourceName, publishedAt, description } = article;
  const date = publishedAt ? new Date(publishedAt) : null;

  const authed =
    typeof window !== "undefined" && !!localStorage.getItem("access_token");

  const handleSummarize = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof onSummarize === "function") return onSummarize(article);

    if (!authed) {
      window.location.href = "/login";
      return;
    }

    // Sertakan imageUrl agar Summarizer menandai field sebagai required
    const target =
      `/summarizer?url=${encodeURIComponent(url || "")}` +
      `&imageUrl=${encodeURIComponent(imageUrl || "")}`;

    window.location.href = target;
  };

  return (
    <article className="rounded-xl bg-white p-4 shadow hover:shadow-md transition h-[440px] flex flex-col">
        {/* Thumbnail (fixed height) */}
        <div className="h-44 w-full overflow-hidden rounded-lg bg-[#FDF5AA]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title || "news thumbnail"}
              className="h-full w-full object-cover group-hover:scale-105 transition"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-[#34699A] text-sm">
              No image
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="mt-3 flex items-center gap-2 text-xs text-[#34699A]">
          {sourceName && (
            <span className="px-2 py-0.5 rounded-full bg-[#FDF5AA] text-[#113F67]">
              {sourceName}
            </span>
          )}
          {date && <time dateTime={date.toISOString()}>{date.toLocaleString()}</time>}
        </div>

        {/* Title (clamped) */}
        <h3
          className="mt-2 font-display text-base font-semibold text-[#113F67]"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </h3>

        {/* Description (clamped) */}
        {description && (
          <p
            className="mt-1 text-sm text-[#113F67]/80"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </p>
        )}

        <div className="mt-auto" />

      {/* Actions (pinned to bottom) */}
      <div className="pt-3">
        <button
          onClick={handleSummarize}
          title={authed ? "Summarize this article" : "Sign in to use AI Summarizer"}
          className={`w-full rounded-full px-4 py-2 text-sm transition
            ${authed ? "bg-[#58A0C8] text-white hover:opacity-90" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
          aria-label="Summarize article"
        >
          Summarize
        </button>
      </div>
    </article>
  );
}
