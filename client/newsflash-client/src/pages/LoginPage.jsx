import { useNavigate } from "react-router";
import { BASE_URL } from "../utils/base-http";
import { useEffect, useCallback } from "react";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleCredentialResponse = useCallback(
    async (response) => {
      try {
        console.log(response.credential);
        const { data } = await BASE_URL.post("/auth/google", {
          idToken: response.credential,
        });
        console.log(data, "<< data credential");
        localStorage.setItem("access_token", data.access_token);
        navigate("/");
      } catch (error) {
        console.log(error, "<< Error Credential");
      }
    },
    [navigate]
  );

  useEffect(() => {
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });
    window.google.accounts.id.renderButton(
      document.getElementById("buttonDiv"),
      { theme: "outline", size: "large" }
    );
  }, [handleCredentialResponse]);

  return (
  <div className="relative min-h-screen flex items-center justify-center px-4 font-sans">
    {/* Background image */}
    <div className="absolute inset-0 -z-10 bg-[url('https://c0.wallpaperflare.com/preview/105/94/569/administration-articles-bank-black-and-white.jpg')] bg-cover bg-center" />
    {/* Dark overlay */}
    <div className="absolute inset-0 -z-10 bg-[#113F67]/70" />

    {/* Card */}
    <div className="w-full max-w-sm rounded-2xl shadow-lg bg-white/90 backdrop-blur p-6">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#113F67] text-white grid place-items-center font-bold">
          N
        </div>
        <div>
          <h1 className="font-display text-lg font-semibold text-[#113F67] tracking-tight">
            NewsFlashAI
          </h1>
        </div>
      </div>

      {/* Heading */}
      <h2 className="font-display text-2xl font-bold text-[#113F67] mb-2 tracking-tight text-center">
        Masuk
      </h2>
      <p className="text-sm text-[#34699A] mb-5 text-center">
        Gunakan akun Google Anda.
      </p>

      {/* Google button mount point */}
      <div id="buttonDiv" className="flex justify-center" />
    </div>
  </div>
);

}
