const axios = require("axios");
const cheerio = require("cheerio");

async function extractTextFromUrl(url) {
  const { data: html } = await axios.get(url, { timeout: 10000 });
  const $ = cheerio.load(html);

  const title = $("head > title").text()?.trim();
  const metaDesc = $('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content") || "";
  const ogTitle = $('meta[property="og:title"]').attr("content") || "";

  const paras = [];
  $("p").each((_, el) => {
    const t = $(el).text().trim();
    if (t && t.length > 40) paras.push(t);
  });

  const body = paras.slice(0, 8).join("\n\n");
  const combined = [ogTitle || title, metaDesc, body].filter(Boolean).join("\n\n");

  return combined || (title || metaDesc || "");
}

module.exports = { extractTextFromUrl };
