import React from "react";

function parseImpact(raw) {
  if (!raw || typeof raw !== "string") return null;
  const parts = raw.split(/[-–—]/);
  const label = (parts[0] || "").trim();
  const lv = label.toLowerCase();
  let level = null;
  if (/low|rendah/.test(lv)) level = "low";
  else if (/medium|moderate|sedang/.test(lv)) level = "medium";
  else if (/high|tinggi/.test(lv)) level = "high";
  const description = parts.length > 1 ? parts.slice(1).join(" ").trim() : "";
  return { level, label: label || "Impact", description };
}

const impactBadge = (lvl) => {
  switch (lvl) {
    case "low":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "medium":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "high":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-[#34699A]/30 bg-[#FDF5AA] text-[#113F67]";
  }
};

const sentimentBadgeBy = (s) =>
  ({
    positive: "bg-emerald-100 text-emerald-900 border-emerald-200",
    neutral: "bg-slate-100 text-slate-900 border-slate-200",
    negative: "bg-rose-100 text-rose-900 border-rose-200",
  }[String(s || "").toLowerCase()] ||
  "bg-slate-100 text-slate-900 border-slate-200");

export default function ArticlePreview({ article, loading }) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#113F67]/10 bg-white/90 shadow-sm">
        <div className="flex">
          <div className="w-36 min-w-36 h-32 bg-[#FDF5AA] animate-pulse" />
          <div className="flex-1 p-4">
            <div className="h-5 w-2/3 bg-[#FDF5AA] rounded animate-pulse" />
            <div className="mt-2 h-3 w-1/2 bg-[#FDF5AA] rounded animate-pulse" />
            <div className="mt-3 h-3 w-full bg-[#FDF5AA] rounded animate-pulse" />
            <div className="mt-2 h-3 w-5/6 bg-[#FDF5AA] rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="overflow-hidden rounded-2xl border border-dashed border-[#113F67]/20 bg-white/80 p-6 text-center">
        <div className="mx-auto mb-2 h-12 w-12 rounded-2xl bg-[#FDF5AA] grid place-items-center text-[#113F67] text-lg">
          📰
        </div>
        <div className="text-[#113F67] font-semibold">Article details unavailable</div>
        <div className="text-sm text-[#34699A]">Catatan tetap bisa dibuat & disimpan.</div>
      </div>
    );
  }

  const {
    title,
    url,
    imageUrl: _imageUrl,
    picture,
    impact,
    image,
    urlToImage,
    sentiment,
    summary,
    sourceName,
    publishedAt,
  } = article;

  const imageUrl = _imageUrl || picture || image || urlToImage || "";
  const firstTwoPoints = String(summary || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2);

  const impactInfo = parseImpact(impact);
  const sentimentBadge = sentimentBadgeBy(sentiment);
  const pub = publishedAt ? new Date(publishedAt) : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#113F67]/10 bg-white/90 shadow-sm">
      <div className="flex">
        {/* Image */}
        <div className="w-36 min-w-36 h-32 bg-[#FDF5AA] flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title || "Article"}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-[#34699A] text-sm">No Image</span>
          )}
        </div>

        {/* Divider */}
        <div className="w-px bg-[#113F67]/10" />

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-base md:text-lg font-semibold text-[#113F67] truncate">
              {title || "-"}
            </h2>
            {sourceName && (
              <span className="px-2 py-0.5 rounded-full bg-[#FDF5AA] text-[#113F67] text-xs shrink-0">
                {sourceName}
              </span>
            )}
          </div>

          <div className="mt-0.5 flex items-center gap-2 text-xs text-[#34699A]">
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 break-all hover:opacity-90"
                title={url}
              >
                {url}
              </a>
            )}
            {pub && <time dateTime={pub.toISOString()}>{pub.toLocaleString()}</time>}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {impact && (
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${impactBadge(
                  impactInfo?.level
                )}`}
                title={impactInfo?.description || impact}
              >
                Impact: <strong className="font-semibold">{impactInfo?.label || impact}</strong>
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${sentimentBadge}`}
              title={`Sentiment: ${sentiment || "-"}`}
            >
              Sentiment: <strong className="font-semibold">{sentiment || "-"}</strong>
            </span>
          </div>

          {firstTwoPoints.length > 0 && (
            <ul className="mt-2 list-disc ml-5 text-xs text-[#113F67]/90 space-y-1">
              {firstTwoPoints.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
