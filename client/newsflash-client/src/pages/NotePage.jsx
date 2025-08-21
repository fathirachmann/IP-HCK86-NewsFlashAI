// src/pages/NotePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { BASE_URL } from "../utils/base-http";
import ArticlePreview from "../components/ArticlePreview";

function getAuthHeaders() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
function ensureAuthedOrRedirect(navigate) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  if (!token) {
    navigate("/login");
    return false;
  }
  return true;
}
const toDate = (v) => (v ? new Date(v) : null);

// toleran ke payload server
function extractArticlePayload(resData) {
  return (
    resData?.data?.article ??
    resData?.article ??
    (Array.isArray(resData?.data) ? resData.data[0] : resData?.data) ??
    resData ??
    null
  );
}
function extractNotesArray(resData) {
  return (
    (Array.isArray(resData) ? resData : null) ??
    (Array.isArray(resData?.data) ? resData.data : null) ??
    (Array.isArray(resData?.notes) ? resData.notes : null) ??
    []
  );
}
function normalizeNote(n) {
  const id = n?.id ?? n?.noteId ?? n?._id;
  const content = n?.content ?? n?.body ?? n?.text ?? "";
  const createdAt = n?.createdAt ?? n?.created_at ?? n?.created_at_utc ?? null;
  const updatedAt = n?.updatedAt ?? n?.updated_at ?? null;
  return { id, content, createdAt, updatedAt };
}

export default function NotePage() {
  const { id: articleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // ⬇️ ambil artikel dari navigation state (instan render)
  const seededArticle = location.state?.article ?? null;

  const [article, setArticle] = useState(seededArticle);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  async function fetchArticle() {
    if (seededArticle) return seededArticle;
    try {
      const res = await BASE_URL.get(`/articles/${articleId}`, {
        headers: { ...getAuthHeaders() },
      });
      return extractArticlePayload(res.data);
    } catch {
      return null;
    }
  }
  async function fetchNotes() {
    const res = await BASE_URL.get(`/articles/${articleId}/notes`, {
      headers: { ...getAuthHeaders() },
    });
    return extractNotesArray(res.data).map(normalizeNote);
  }
  async function updateNote(noteId, content) {
    const res = await BASE_URL.put(
      `/articles/${articleId}/notes/${noteId}`,
      { content },
      { headers: { ...getAuthHeaders() } }
    );
    return normalizeNote(res.data?.data ?? res.data ?? {});
  }
  async function removeNote(noteId) {
    await BASE_URL.delete(`/articles/${articleId}/notes/${noteId}`, {
      headers: { ...getAuthHeaders() },
    });
    return true;
  }

  async function loadAll() {
    if (!ensureAuthedOrRedirect(navigate)) return;
    setLoading(true);
    setErr(null);
    try {
      const [art, nts] = await Promise.all([fetchArticle(), fetchNotes()]);
      setArticle(art);
      setNotes(nts);
    } catch (e) {
      const status = e?.response?.status;
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
      setErr(e?.response?.data?.message || e.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  async function addNote() {
    if (!newNote.trim()) return;
    if (!ensureAuthedOrRedirect(navigate)) return;
    setSaving(true);
    try {
      const res = await BASE_URL.post(
        `/articles/${articleId}/notes`,
        { content: newNote.trim() },
        { headers: { ...getAuthHeaders() } }
      );
      const created = normalizeNote(res.data?.data ?? res.data ?? {});
      setNotes((prev) => [created, ...prev]);
      setNewNote("");
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Failed to add note");
    } finally {
      setSaving(false);
    }
  }
  function startEdit(note) {
    setEditingId(note.id);
    setEditingText(note.content);
  }
  function cancelEdit() {
    setEditingId(null);
    setEditingText("");
  }
  async function saveEdit(noteId) {
    if (!editingText.trim()) return;
    if (!ensureAuthedOrRedirect(navigate)) return;
    try {
      const updated = await updateNote(noteId, editingText.trim());
      setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, ...updated } : n)));
      cancelEdit();
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Failed to save");
    }
  }
  async function deleteNote(noteId) {
    if (!confirm("Delete this note?")) return;
    if (!ensureAuthedOrRedirect(navigate)) return;
    try {
      await removeNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Failed to delete");
    }
  }

  const articleTitle = article?.title || `Article #${articleId}`;
  const articleUrl = article?.url || null;
  const lastUpdated = useMemo(() => {
    const dt =
      notes.reduce((acc, n) => {
        const d = toDate(n.updatedAt || n.createdAt);
        return d && (!acc || d > acc) ? d : acc;
      }, null) || (article ? toDate(article.updatedAt || article.createdAt) : null);
    return dt ? dt.toLocaleString() : "—";
  }, [notes, article]);

  return (
    <div className="relative min-h-screen">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Background image */}
        <div className="absolute inset-0 bg-[url('https://wallpapers.com/images/featured/old-newspaper-background-xayuetybyd5mf1st.jpg')] bg-cover bg-center opacity-40" />
        {/* Gradient overlay (soft, dominan putih) */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(60% 60% at 100% 0%, rgba(88,160,200,0.15) 0%, rgba(88,160,200,0) 60%)," +
              "radial-gradient(55% 55% at 0% 100%, rgba(253,245,170,0.2) 0%, rgba(253,245,170,0) 60%)," +
              "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.4) 100%)",
          }}
        />
        {/* Veil putih lebih pekat */}
        <div className="absolute inset-0 bg-white/55" />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <header className="mb-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-[#113F67]">
                Notes
              </h1>
              <div className="mt-1">
                <div className="text-sm text-[#113F67] font-medium truncate">
                  {articleTitle}
                </div>
                {articleUrl && (
                  <a
                    href={articleUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#113F67] underline underline-offset-2 break-all hover:opacity-90"
                  >
                    {articleUrl}
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate(-1)}
                className="rounded-full bg-white border border-[#113F67]/20 text-[#113F67] px-4 py-2 text-sm hover:bg-[#FDF5AA] transition"
                title="Back"
              >
                Back
              </button>
              <button
                onClick={loadAll}
                className="rounded-full bg-[#113F67] text-white px-4 py-2 text-sm hover:opacity-90"
                title="Refresh"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-[#113F67]/10 bg-white/90 shadow-sm px-3 py-2 text-sm text-[#113F67] flex items-center gap-3">
            <span className="px-2 py-0.5 rounded-full bg-[#FDF5AA] text-[#113F67]">
              {notes.length} notes
            </span>
            <span className="text-[#34699A]">Last update: {lastUpdated}</span>
          </div>
        </header>

        {/* Article Preview */}
        <section className="mb-4">
          <ArticlePreview article={article} loading={loading} />
        </section>

        {/* Error */}
        {err && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 mb-4 text-rose-700">
            {err}
          </div>
        )}

        {/* Add note */}
        {!loading && (
          <section className="rounded-2xl border border-[#113F67]/10 bg-white p-4 shadow-sm">
            <label className="block text-xs text-[#113F67]/80 mb-1">
              Add a note
            </label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
              placeholder="Write your note here…"
              className="w-full rounded-lg px-3 py-2 bg-white outline-none ring-1 ring-[#34699A]/20 focus:ring-2 focus:ring-[#58A0C8]/60"
            />
            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setNewNote("")}
                disabled={!newNote}
                className="rounded-full bg-white border border-[#113F67]/20 text-[#113F67] px-4 py-2 text-sm disabled:opacity-40"
              >
                Clear
              </button>
              <button
                onClick={addNote}
                disabled={!newNote || saving}
                className={`rounded-full px-4 py-2 text-sm text-white ${
                  saving
                    ? "bg-[#58A0C8]/70 cursor-wait"
                    : "bg-[#58A0C8] hover:opacity-90"
                }`}
              >
                {saving ? "Saving…" : "Add Note"}
              </button>
            </div>
          </section>
        )}

        {/* Notes list */}
        {!loading && (
          <section className="mt-4 space-y-3">
            {notes.map((n) => {
              const created = toDate(n.createdAt);
              const updated = toDate(n.updatedAt);
              const timestamp =
                updated && created && updated.getTime() !== created.getTime()
                  ? `Updated ${updated.toLocaleString()} • Created ${created.toLocaleString()}`
                  : created
                  ? created.toLocaleString()
                  : "—";

              const isEditing = editingId === n.id;

              return (
                <div
                  key={n.id}
                  className="rounded-2xl border border-[#113F67]/10 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-xs text-[#34699A]">{timestamp}</div>
                    <div className="shrink-0 flex items-center gap-2">
                      {!isEditing ? (
                        <>
                          <button
                            onClick={() => startEdit(n)}
                            className="rounded-full bg-white border border-[#113F67]/20 text-[#113F67] px-3 py-1.5 text-xs hover:bg-[#FDF5AA]"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteNote(n.id)}
                            className="rounded-full border border-rose-200 bg-rose-50 text-rose-700 px-3 py-1.5 text-xs hover:bg-rose-100"
                            title="Delete"
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => saveEdit(n.id)}
                            className="rounded-full bg-[#113F67] text-white px-3 py-1.5 text-xs hover:opacity-90"
                            title="Save"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="rounded-full bg-white border border-[#113F67]/20 text-[#113F67] px-3 py-1.5 text-xs"
                            title="Cancel"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {!isEditing ? (
                    <p className="mt-2 text-sm text-[#113F67] whitespace-pre-line">
                      {n.content || (
                        <span className="italic text-[#34699A]">Empty note</span>
                      )}
                    </p>
                  ) : (
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      rows={3}
                      className="mt-2 w-full rounded-lg px-3 py-2 bg-white outline-none ring-1 ring-[#34699A]/20 focus:ring-2 focus:ring-[#58A0C8]/60 text-sm"
                    />
                  )}
                </div>
              );
            })}

            {!notes.length && !err && (
              <div className="rounded-2xl border border-dashed border-[#113F67]/20 bg-white/70 p-8 text-center">
                <div className="mx-auto mb-3 h-14 w-14 rounded-2xl bg-[#FDF5AA] grid place-items-center text-[#113F67] text-xl">
                  ✍️
                </div>
                <h2 className="text-[#113F67] font-semibold">No notes yet</h2>
                <p className="text-sm text-[#34699A] mt-1">
                  Tulis catatan pertama untuk artikel ini.
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
