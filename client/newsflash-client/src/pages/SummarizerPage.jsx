// src/pages/SummarizerPage.jsx
import { useEffect, useState } from "react";
import { BASE_URL } from "../utils/base-http";

export default function SummarizerPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null);

  // Prefill from ?url=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const u = params.get("url") || "";
    if (u) setUrl(u);
  }, []);

  async function onSummarize(e) {
    e.preventDefault();
    setErr("");
    setResult(null);

    const cleanUrl = url.trim();
    if (!cleanUrl) {
      setErr("Please paste an article URL.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const res = await BASE_URL.post(
        "/ai/summarize",
        { url: cleanUrl },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
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
        return "border-[#34699A]/30 bg-[#FDF5AA] text-[#113F67]";
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
    // Accept numbers or strings; allow -1..1 or 0..1 ranges
    if (score == null) return null;
    const val = typeof score === "string" ? parseFloat(score) : Number(score);
    if (Number.isNaN(val)) return null;
    // If range looks like 0..1 convert to -1..1 centered at 0
    if (val >= 0 && val <= 1) {
      return (val - 0.5) * 2; // 0 => -1, 0.5 => 0, 1 => 1
    }
    // Clamp to -1..1 just in case
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

  // ---------- Safe getters ----------
  const title = result?.title ?? result?.article?.title ?? "Summary";
  const summary =
    result?.summary ?? result?.article?.summary ?? result?.data?.summary ?? "";
  const points = result?.keyPoints ?? result?.points ?? result?.bullets ?? [];
  const src = result?.sourceName ?? result?.article?.sourceName ?? "";
  const published = result?.publishedAt ?? result?.article?.publishedAt ?? "";
  const finalUrl = result?.url ?? result?.article?.url ?? url;

  // Derived impact & sentiment
  const impactInfo = parseImpact(getImpactRaw(result), getImpactDescription(result));
  const sentimentInfo = parseSentiment(getSentimentLabelRaw(result), getSentimentScoreRaw(result));

  return (
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
      <form onSubmit={onSummarize} className="rounded-2xl bg-white/90 p-4 shadow">
        <label className="block text-xs text-[#113F67]/80 mb-1">Article URL</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          type="url"
          placeholder="https://example.com/news/your-article"
          className="w-full rounded-lg px-3 py-2 bg-[#FDF5AA] outline-none ring-1 ring-[#34699A]/30 focus:ring-2 focus:ring-[#58A0C8]/60"
        />

        <div className="mt-3 flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className={`rounded-full px-4 py-2 text-sm text-white transition
              ${loading ? "bg-[#58A0C8]/70 cursor-wait" : "bg-[#113F67] hover:opacity-90"}`}
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
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}
      </form>

      {/* Result */}
      {loading && (
        <div className="mt-6 rounded-2xl bg-white p-4 shadow animate-pulse">
          <div className="h-4 w-1/3 bg-[#FDF5AA] rounded" />
          <div className="mt-3 h-3 w-full bg-[#FDF5AA] rounded" />
          <div className="mt-2 h-3 w-5/6 bg-[#FDF5AA] rounded" />
          <div className="mt-2 h-3 w-2/3 bg-[#FDF5AA] rounded" />
        </div>
      )}

      {!loading && result && (
        <div className="mt-6 rounded-2xl bg-white p-5 shadow">
          {/* Title + meta */}
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-[#113F67]">
              {title}
            </h2>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            {src && (
              <span className="px-2 py-0.5 rounded-full bg-[#FDF5AA] text-[#113F67]">
                {src}
              </span>
            )}
            {published && (
              <time className="text-[#34699A]" dateTime={new Date(published).toISOString()}>
                {new Date(published).toLocaleString()}
              </time>
            )}

            {/* Spacer */}
            <span className="flex-1" />

            {/* Impact badge */}
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

            {/* Sentiment badge */}
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
                  <span className="opacity-80">
                    ({sentimentInfo.score.toFixed(2)})
                  </span>
                )}
              </span>
            )}
          </div>

          {/* Summary */}
          {summary && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-[#113F67] mb-2">Summary</h3>
              <p className="text-sm text-[#113F67]/90 leading-relaxed whitespace-pre-line">
                {summary}
              </p>
            </div>
          )}

          {/* Impact details */}
          {impactInfo?.description && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-[#113F67] mb-2">Impact details</h3>
              <p className="text-sm text-[#113F67]/90">{impactInfo.description}</p>
            </div>
          )}

          {/* Sentiment details */}
          {sentimentInfo && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-[#113F67] mb-2">Sentiment details</h3>
              <p className="text-sm text-[#113F67]/90">
                Overall sentiment: <strong>{sentimentInfo.label}</strong>
                {sentimentInfo.score != null && (
                  <> with score <strong>{sentimentInfo.score.toFixed(2)}</strong></>
                )}
              </p>
              <p className="text-xs text-[#34699A] mt-1">
                *Score normalized to -1..1 (negative to positive).
              </p>
            </div>
          )}

          {/* Key points */}
          {Array.isArray(points) && points.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-[#113F67] mb-2">Key Points</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-[#113F67]/90">
                {points.slice(0, 8).map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
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
  );
}
