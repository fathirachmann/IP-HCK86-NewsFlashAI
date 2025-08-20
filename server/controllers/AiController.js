const { GoogleGenAI } = require("@google/genai");
const { Article } = require("../models");
const { extractTextFromUrl } = require("../utils/extractText");

// Schema JSON final
// { "bullets": string[<=5], "sentiment": "positive|neutral|negative", "keywords": string[<=5] }

const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY});

// cepat: "gemini-1.5-flash"; lebih akurat: "gemini-1.5-pro"
const MODEL_ID = process.env.GEMINI_MODEL || "gemini-1.5-flash";

function buildPrompt(text) {
  const clipped = (text || "").slice(0, 8000); // safety batas panjang
  return `You are an expert news summariser.
Summarise the following article into EXACTLY 5 concise bullet points (max ~15 words each).
Then classify overall sentiment as "positive", "neutral", or "negative".
Also provide up to 5 keywords.
Finally, assess the potential impact of the news and return it as a single string in the format:
"Level - short description impact"
Example: "High - Could affect global nickel supply chain".

Return STRICT JSON ONLY with keys: bullets, sentiment, keywords, impact.
NO extra text.

Article:
"""
${clipped}
"""

JSON schema:
{
  "bullets": ["...", "...", "...", "...", "..."],
  "sentiment": "positive|neutral|negative",
  "keywords": ["...", "..."],
  "impact": "Level - short description"
}`;
}

async function callGemini(text) {
  const prompt = buildPrompt(text);
  const resp = await ai.models.generateContent({
    model: MODEL_ID,
    contents: prompt,
  });
  const raw = resp.text;
  const jsonStr = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(jsonStr);
}

class AiController {
  static async summarize(req, res, next) {
    try {
      const { content, url, articleId, persist = true } = req.body;

      // 1) Resolve teks sumber
      let text = content;
      let targetArticle = null;

      if (!text && url) {
        text = await extractTextFromUrl(url);
      }

      if (!text && articleId) {
        targetArticle = await Article.findByPk(articleId);
        if (!targetArticle) throw { status: 404, message: "Article not found" };
        // Prioritas: coba url → ekstrak; fallback: title
        if (targetArticle.url) {
          text = await extractTextFromUrl(targetArticle.url);
        }
        if (!text) text = `${targetArticle.title || ""}`;
      }

      if (!text || text.trim().length < 40) {
        throw { status: 400, message: "Not enough content to summarize. Provide content, url, or valid articleId." };
      }

      // 2) Panggil Gemini
      let result;
      try {
        result = await callGemini(text);
      } catch (e) {
        // fallback parsing bila output tidak valid JSON
        // cari blok {...}
        const m = (e.output || e.message || "").match(/\{[\s\S]*\}/);
        if (m) result = JSON.parse(m[0]);
        else throw e;
      }

      // Validasi minimal
      if (!result || !Array.isArray(result.bullets) || !result.sentiment || !result.impact) {
        throw { status: 502, message: "AI response invalid" };
      }

      // 3) Persist (opsional) ke Article
      let saved = null;
      if (persist && (articleId || url)) {
        if (!targetArticle && articleId) {
          targetArticle = await Article.findByPk(articleId);
        }
        // Jika belum ada Article & ada url + user, boleh buat otomatis
        if (!targetArticle && url && req.user?.id) {
          saved = await Article.create({
            userId: req.user.id,
            url,
            title: (text.split("\n")[0] || "").slice(0, 180),
            summary: result.bullets.join("\n"),
            sentiment: result.sentiment,
            keywords: (result.keywords || []).join(","),
          });
        } else if (targetArticle) {
          await targetArticle.update({
            summary: result.bullets.join("\n"),
            sentiment: result.sentiment,
            keywords: (result.keywords || []).join(","),
            impact: result.impact,
          });
          saved = targetArticle;
        }
      }

      res.json({
        bullets: result.bullets,
        sentiment: result.sentiment,
        keywords: result.keywords || [],
        impact: result.impact,
        savedArticleId: saved?.id || null,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AiController;
