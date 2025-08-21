import { useEffect, useState } from "react";

export default function Navbar() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = () => {
      const t = localStorage.getItem("access_token");
      setAuthed(!!t);
      const u = localStorage.getItem("user");
      if (u) {
        try {
          setUser(JSON.parse(u));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      setAuthed(false);
      setUser(null);
      // ping tab lain agar sinkron
      try {
        localStorage.setItem("logout_at", String(Date.now()));
        localStorage.removeItem("logout_at");
      } catch {null}
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-[#113F67]/10">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        {/* LEFT: Brand + Links */}
        <div className="flex items-center gap-5">
          {/* Brand */}
          <a href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-[#113F67] text-white grid place-items-center font-bold">
              N
            </div>
            <span className="font-display text-lg text-[#113F67] font-semibold tracking-tight hidden sm:inline">
              NewsFlashAI
            </span>
          </a>

          {/* Links */}
          <div className="hidden md:flex items-center gap-4">
            <a href="/" className="text-sm text-[#113F67] hover:underline">
              Home
            </a>
            <a href="/articles" className="text-sm text-[#113F67] hover:underline">
              My Article
            </a>
            <a
              href={authed ? "/summarizer" : "#"}
              title={authed ? "AI Summarizer" : "Sign in to access"}
              className={`text-sm ${
                authed ? "text-[#113F67] hover:underline" : "text-gray-400 cursor-not-allowed"
              }`}
            >
              AI Summarizer
            </a>
          </div>
        </div>

        {/* RIGHT: Logout / Login */}
        {authed ? (
          <button
            onClick={handleLogout}
            className="rounded-full bg-[#58A0C8] text-white text-sm px-3 py-2 hover:opacity-90"
            title="Log out"
          >
            Logout
          </button>
        ) : (
          <a
            href="/login"
            className="rounded-full bg-[#58A0C8] text-white text-sm px-3 py-2 hover:opacity-90"
            title="Sign in"
          >
            Login
          </a>
        )}
      </div>

      {/* Mobile links */}
      <div className="md:hidden border-t border-[#113F67]/10 bg-white/90">
        <div className="mx-auto max-w-6xl px-4 py-2 flex items-center gap-4">
          <a href="/" className="text-sm text-[#113F67]">Home</a>
          <a href="/my-articles" className="text-sm text-[#113F67]">My Article</a>
          <a
            href={authed ? "/summarizer" : "#"}
            title={authed ? "AI Summarizer" : "Sign in to access"}
            className={`text-sm ${
              authed ? "text-[#113F67]" : "text-gray-400 cursor-not-allowed"
            }`}
          >
            AI Summarizer
          </a>
        </div>
      </div>
    </nav>
  );
}
