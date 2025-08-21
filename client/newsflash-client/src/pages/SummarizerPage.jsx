// src/pages/SummarizerPage.jsx
import { useEffect, useMemo, useState } from "react";
import { BASE_URL } from "../utils/base-http"; // Axios instance (.post)

export default function SummarizerPage() {
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageRequired, setImageRequired] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null);

  // Prefill from query: ?url=&imageUrl=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uParam = params.get("url") || "";
    const imgParam = params.get("imageUrl"); // may be "" if present but empty
    const hasImgParam = params.has("imageUrl");

    setUrl(uParam);
    setImageUrl(imgParam ?? "");
    setImageRequired(hasImgParam); // if homepage passed imageUrl, require it
  }, []);

  async function onSummarize(e) {
    e.preventDefault();
    setErr("");
    setResult(null);

    const cleanUrl = url.trim();
    const cleanImg = imageUrl.trim();

    if (!cleanUrl) {
      setErr("Please paste an article URL.");
      return;
    }
    if (imageRequired && !cleanImg) {
      setErr("Image URL is required for this request.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const body = imageRequired
        ? { url: cleanUrl, imageUrl: cleanImg }
        : (cleanImg ? { url: cleanUrl, imageUrl: cleanImg } : { url: cleanUrl });

      const res = await BASE_URL.post("/ai/summarize", body, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setResult(res.data);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        e?.message ||
        "Failed to summarize.";
      setErr(typeof msg === "string" ? msg : "Failed to summarize.");
    } finally {
      setLoading(false);
    }
  }

  // ---------- Impact helpers ----------
  const getImpactRaw = (r) =>
    r?.impact ?? r?.article?.impact ?? r?.data?.impact ?? r?.impactLevel ?? null;

  const getImpactDescription = (r) =>
    r?.impactDescription ??
    r?.impact_desc ??
    r?.impact_text ??
    r?.article?.impactDescription ??
    null;

  const parseImpact = (raw, fallbackDesc) => {
    if (!raw && !fallbackDesc) return null;

    let levelText = null;
    let descText = null;

    if (typeof raw === "string") {
      const parts = raw.split(/[-–—]/);
      levelText = parts[0]?.trim();
      if (parts.length > 1) descText = parts.slice(1).join(" ").trim();
    }

    const lv = (levelText || raw || "").toLowerCase();
    let level = null;
    if (/low|rendah/.test(lv)) level = "low";
    else if (/medium|moderate|sedang/.test(lv)) level = "medium";
    else if (/high|tinggi/.test(lv)) level = "high";

    const description = (descText || fallbackDesc || "").trim() || null;

    return {
      level,
      label: levelText || (level && level[0].toUpperCase() + level.slice(1)) || "Impact",
      description,
    };
  };

  const impactStyles = (level) => {
    switch (level) {
      case "low":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "medium":
        return "border-amber-200 bg-amber-50 text-amber-700";
      case "high":
        return "border-rose-200 bg-rose-50 text-rose-700";
      default:
        return "border-slate-200 bg-slate-50 text-slate-700";
    }
  };

  // ---------- Sentiment helpers ----------
  const getSentimentLabelRaw = (r) =>
    r?.sentiment ??
    r?.article?.sentiment ??
    r?.data?.sentiment ??
    r?.sentiment_label ??
    r?.article?.sentiment_label ??
    null;

  const getSentimentScoreRaw = (r) => {
    const s =
      r?.sentimentScore ??
      r?.sentiment_score ??
      r?.article?.sentimentScore ??
      r?.article?.sentiment_score ??
      r?.sentiment?.score ??
      null;
    return s;
  };

  const normalizeScore = (score) => {
    if (score == null) return null;
    const val = typeof score === "string" ? parseFloat(score) : Number(score);
    if (Number.isNaN(val)) return null;
    if (val >= 0 && val <= 1) return (val - 0.5) * 2;
    return Math.max(-1, Math.min(1, val));
  };

  const parseSentiment = (rawLabel, rawScore) => {
    const score = normalizeScore(rawScore);
    let label = null;

    if (typeof rawLabel === "string" && rawLabel.trim()) {
      const low = rawLabel.toLowerCase();
      if (/pos/i.test(low)) label = "Positive";
      else if (/neg/i.test(low)) label = "Negative";
      else if (/neutral|netral/i.test(low)) label = "Neutral";
    }

    if (!label && score != null) {
      if (score > 0.2) label = "Positive";
      else if (score < -0.2) label = "Negative";
      else label = "Neutral";
    }

    if (!label && (rawLabel == null && score == null)) return null;

    return { label: label || "Neutral", score };
  };

  const sentimentStyles = (label) => {
    switch ((label || "").toLowerCase()) {
      case "positive":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "negative":
        return "border-rose-200 bg-rose-50 text-rose-700";
      default:
        return "border-slate-200 bg-slate-50 text-slate-700";
    }
  };

  // ---------- Safe getters & derived ----------
  const points = useMemo(() => {
    if (!result) return [];
    return result?.keyPoints ?? result?.points ?? result?.bullets ?? [];
  }, [result]);

  const derivedSummary = useMemo(() => {
    const s =
      result?.summary ??
      result?.article?.summary ??
      result?.data?.summary ??
      (Array.isArray(points) && points.length ? points.join("\n") : "");
    return s || "";
  }, [result, points]);

  const keywords = useMemo(() => {
    const raw = result?.keywords ?? result?.article?.keywords ?? result?.data?.keywords;
    if (!raw) return [];
    return Array.isArray(raw)
      ? raw
      : String(raw)
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);
  }, [result]);

  const finalUrl = result?.url ?? result?.article?.url ?? url;
  const finalImage =
    (result?.imageUrl ?? result?.article?.imageUrl ?? result?.data?.imageUrl ?? imageUrl) || "";

  const title = result?.title ?? result?.article?.title ?? "AI Summary";
  const src = result?.sourceName ?? result?.article?.sourceName ?? "";
  const published = result?.publishedAt ?? result?.article?.publishedAt ?? "";

  const impactInfo = parseImpact(getImpactRaw(result), getImpactDescription(result));
  const sentimentInfo = parseSentiment(getSentimentLabelRaw(result), getSentimentScoreRaw(result));

  return (
    <div className="relative min-h-screen">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Background image */}
        <div className="absolute inset-0 bg-[url('https://wallpapers.com/images/featured/old-newspaper-background-xayuetybyd5mf1st.jpg')] bg-cover bg-center opacity-40" />
        {/* Gradient overlay (balanced: sedikit biru + kuning koran) */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(60% 60% at 100% 0%, rgba(88,160,200,0.18) 0%, rgba(88,160,200,0) 60%)," +
              "radial-gradient(55% 55% at 0% 100%, rgba(253,245,170,0.22) 0%, rgba(253,245,170,0) 60%)," +
              "linear-gradient(135deg, rgba(11,29,46,0.55) 0%, rgba(17,63,103,0.4) 42%, rgba(88,160,200,0.28) 100%)",
          }}
        />
        {/* Veil ringan agar form tetap kontras */}
        <div className="absolute inset-0 bg-white/15" />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-semibold text-[#113F67] tracking-tight">
            AI Summarizer
          </h1>
          <p className="text-sm text-[#34699A]">
            Paste an article URL and get a concise summary with impact & sentiment.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSummarize} className="rounded-2xl bg-white/90 p-4 shadow space-y-3">
          <div>
            <label className="block text-xs text-[#113F67]/80 mb-1">Article URL</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              type="url"
              placeholder="https://example.com/news/your-article"
              className="w-full rounded-lg px-3 py-2 bg-[#FDF5AA] outline-none ring-1 ring-[#34699A]/30 focus:ring-2 focus:ring-[#58A0C8]/60"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-[#113F67]/80 mb-1">
              Image URL{" "}
              {imageRequired ? (
                <span className="text-rose-600 font-semibold">(required)</span>
              ) : (
                <span className="opacity-60">(optional)</span>
              )}
            </label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              type="url"
              placeholder="https://cdn.example.com/cover.jpg"
              className={`w-full rounded-lg px-3 py-2 outline-none ring-1 focus:ring-2 ${
                imageRequired
                  ? "bg-white ring-rose-300 focus:ring-rose-400"
                  : "bg-white ring-[#34699A]/20 focus:ring-[#58A0C8]/60"
              }`}
              required={imageRequired}
            />
            {imageRequired && !imageUrl && (
              <p className="mt-1 text-xs text-rose-600">
                Please provide the Image URL passed from homepage.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className={`rounded-full px-4 py-2 text-sm text-white transition ${
                loading ? "bg-[#58A0C8]/70 cursor-wait" : "bg-[#113F67] hover:opacity-90"
              }`}
            >
              {loading ? "Summarizing…" : "Summarize"}
            </button>

            {finalUrl && (
              <a
                href={finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#113F67] underline underline-offset-2"
              >
                Open original
              </a>
            )}
          </div>

          {err && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {err}
            </div>
          )}
        </form>

        {/* Skeleton */}
        {loading && (
          <div className="mt-6 rounded-2xl bg-white p-4 shadow animate-pulse">
            <div className="h-4 w-1/3 bg-[#FDF5AA] rounded" />
            <div className="mt-3 h-3 w-full bg-[#FDF5AA] rounded" />
            <div className="mt-2 h-3 w-5/6 bg-[#FDF5AA] rounded" />
            <div className="mt-2 h-3 w-2/3 bg-[#FDF5AA] rounded" />
          </div>
        )}

        {/* Result */}
        {!loading && result && (
          <div className="mt-6 rounded-2xl bg-white p-5 shadow">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-xl font-semibold text-[#113F67]">{title}</h2>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              {src && (
                <span className="px-2 py-0.5 rounded-full bg-[#FDF5AA] text-[#113F67]">
                  {src}
                </span>
              )}
              {published && (
                <time
                  className="text-[#34699A]"
                  dateTime={new Date(published).toISOString()}
                >
                  {new Date(published).toLocaleString()}
                </time>
              )}

              <span className="flex-1" />

              {impactInfo && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${impactStyles(
                    impactInfo.level
                  )}`}
                  title={impactInfo.description || impactInfo.label}
                >
                  Impact: <strong className="font-semibold">{impactInfo.label}</strong>
                </span>
              )}

              {sentimentInfo && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${sentimentStyles(
                    sentimentInfo.label
                  )}`}
                  title={
                    sentimentInfo.score != null
                      ? `Sentiment score: ${sentimentInfo.score.toFixed(2)}`
                      : `Sentiment: ${sentimentInfo.label}`
                  }
                >
                  Sentiment: <strong className="font-semibold">{sentimentInfo.label}</strong>
                  {sentimentInfo.score != null && (
                    <span className="opacity-80">({sentimentInfo.score.toFixed(2)})</span>
                  )}
                </span>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-[220px,1fr] gap-4">
              <div className="w-full h-[180px] md:h-full bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center">
                {finalImage ? (
                  <img
                    src={finalImage}
                    alt="Article cover"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-slate-500 text-sm">No Image</span>
                )}
              </div>

              <div>
                {derivedSummary && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-[#113F67] mb-2">Summary</h3>
                    <p className="text-sm text-[#113F67]/90 leading-relaxed whitespace-pre-line">
                      {derivedSummary}
                    </p>
                  </div>
                )}

                {Array.isArray(points) && points.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-[#113F67] mb-2">Key Points</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-[#113F67]/90">
                      {points.slice(0, 8).map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {keywords.length > 0 && (
                  <div className="mb-2">
                    <h3 className="text-sm font-semibold text-[#113F67] mb-2">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((k, i) => (
                        <span
                          key={`${k}-${i}`}
                          className="text-xs px-2 py-1 rounded-full border border-slate-200 bg-white text-slate-700"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {(result?.savedArticleId || result?.article?.id) && (
              <div className="mt-4 text-xs text-[#34699A]">
                Saved to your library (Article ID:{" "}
                <strong>{result?.savedArticleId || result?.article?.id}</strong>).
               {" "}
                <a
                  href="/articles"
                  className="underline underline-offset-2 text-indigo-600 hover:text-indigo-700"
                >
                  Open My Articles
                </a>
              </div>
            )}

            <div className="mt-5 flex items-center gap-3">
              {finalUrl && (
                <a
                  href={finalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full px-4 py-2 text-sm bg-[#58A0C8] text-white hover:opacity-90"
                >
                  Read Original
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setErr("");
                  setTimeout(() => {
                    const input = document.querySelector("input[type='url']");
                    input?.focus();
                  }, 0);
                }}
                className="rounded-full px-4 py-2 text-sm bg-[#FDF5AA] text-[#113F67] hover:opacity-90"
              >
                Summarize Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
