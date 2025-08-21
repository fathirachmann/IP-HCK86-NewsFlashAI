export default function ArticleCard({
  article,
  onResummarize,
  onDelete,
  onCheckNotes,
}) {
  if (!article) return null;

  const {
    imageUrl: _imageUrl,
    picture,
    title,
    url,
    impact,
    sentiment,
    summary,
    keywords: _keywords,
    keyword: _keyword,
  } = article;

  const imageUrl = _imageUrl || picture || "";
  const summaryPoints = String(summary || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const keywords = String(_keywords ?? _keyword ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Impact helpers
  const parseImpact = (raw) => {
    if (!raw || typeof raw !== "string") return null;
    const parts = raw.split(/[-–—]/);
    const levelText = (parts[0] || "").trim();
    const lv = levelText.toLowerCase();
    let level = null;
    if (/low|rendah/.test(lv)) level = "low";
    else if (/medium|moderate|sedang/.test(lv)) level = "medium";
    else if (/high|tinggi/.test(lv)) level = "high";
    const desc = parts.length > 1 ? parts.slice(1).join(" ").trim() : "";
    return { level, label: levelText || "Impact", description: desc };
  };
  const impactInfo = parseImpact(impact);
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

  const sentimentBadge =
    {
      positive: "bg-emerald-100 text-emerald-900 border-emerald-200",
      neutral: "bg-slate-100 text-slate-900 border-slate-200",
      negative: "bg-rose-100 text-rose-900 border-rose-200",
    }[String(sentiment || "").toLowerCase()] ||
    "bg-slate-100 text-slate-900 border-slate-200";

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-[#113F67]/10 bg-white shadow-sm">
      <div className="flex">
        {/* Left image (fixed), always fills */}
        <div className="relative w-40 min-w-[10rem] h-40 overflow-hidden bg-[#FDF5AA]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title || "Article image"}
              className="absolute inset-0 h-full w-full object-cover block"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-[#34699A] text-sm">
              No Image
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px bg-[#113F67]/10" />

        {/* Right content: column layout with footer pinned to bottom-right */}
        <div className="flex-1 p-4 md:p-5 flex flex-col min-h-[10rem]">
          {/* Top block */}
          <div className="min-w-0">
            <h3
              className="text-base md:text-lg font-semibold text-[#113F67] break-words"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
              title={title}
            >
              {title || "-"}
            </h3>

            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-sm text-[#113F67] underline underline-offset-2 break-all hover:opacity-90"
              title={url}
            >
              {url || "-"}
            </a>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              {impact && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${impactBadge(
                    impactInfo?.level
                  )}`}
                  title={impactInfo?.description || impact}
                >
                  Impact:{" "}
                  <strong className="font-semibold">
                    {impactInfo?.label || impact}
                  </strong>
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${sentimentBadge}`}
                title={`Sentiment: ${sentiment || "-"}`}
              >
                Sentiment:{" "}
                <strong className="font-semibold">{sentiment || "-"}</strong>
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-3 text-sm">
            <div className="font-medium text-[#113F67] mb-1">
              Article Summary
            </div>
            {summaryPoints.length ? (
              <ul className="list-disc ml-5 leading-6 text-[#113F67]/90">
                {summaryPoints.map((b, i) => (
                  <li key={i} className="pl-1">
                    {b}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-[#34699A] italic">No summary</div>
            )}
          </div>

          {/* Keywords */}
          <div className="mt-3">
            <div className="font-medium text-[#113F67] mb-1">Keywords</div>
            {keywords.length ? (
              <div className="flex flex-wrap gap-2">
                {keywords.map((k, i) => (
                  <span
                    key={`${k}-${i}`}
                    className="text-xs px-2 py-1 rounded-full border border-[#113F67]/15 bg-white text-[#113F67]"
                  >
                    {k}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-[#34699A] italic text-sm">—</div>
            )}
          </div>

          {/* Footer actions — pinned bottom-right */}
          <div className="mt-auto">
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={onResummarize}
                className="px-3 py-2 rounded-xl bg-[#113F67] text-white hover:opacity-90 active:scale-[.98] transition"
                aria-label="Resummarize article"
                title="Resummarize"
              >
                Resummarize
              </button>
              <button
                onClick={onDelete}
                className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 active:scale-[.98] transition"
                aria-label="Delete article"
                title="Delete"
              >
                Delete
              </button>
              <button
                onClick={() => onCheckNotes?.(article)}
                className="px-3 py-2 rounded-xl bg-[#58A0C8] text-white hover:opacity-90 active:scale-[.98] transition"
                aria-label="Check notes"
                title="Check Notes"
              >
                Check Notes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
