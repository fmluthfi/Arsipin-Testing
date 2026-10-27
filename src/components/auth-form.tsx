"use client";

import { useState, type FormEvent } from "react";
import { apiRequest, apiUrl, formatApiError } from "@/lib/api";

type AuthMode = "login" | "register";

function PasswordField({ label, name, autoComplete }: { label: string; name: string; autoComplete: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="field">
      <span>{label}</span>
      <span className="password-control">
        <input name={name} type={visible ? "text" : "password"} autoComplete={autoComplete} minLength={8} required />
        <button className={`password-eye ${visible ? "is-open" : "is-closed"}`} type="button" aria-label={visible ? "Sembunyikan password" : "Tampilkan password"} aria-pressed={visible} onClick={() => setVisible((current) => !current)}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path className="eye-outline" d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" /><circle className="eye-pupil" cx="12" cy="12" r="2.6" /><path className="eye-lid" d="M3 12h18" /></svg>
        </button>
      </span>
    </label>
  );
}

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      await apiRequest(mode === "login" ? "/auth/login" : "/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      window.location.assign("/documents");
    } catch (error) {
      setMessage(formatApiError(error));
      setPending(false);
    }
  }

  function handleGoogleSignIn() {
    try {
      const returnTo = `${window.location.origin}/documents`;
      window.location.assign(apiUrl(`/auth/google?returnTo=${encodeURIComponent(returnTo)}`));
    } catch (error) {
      setMessage(formatApiError(error));
    }
  }

  return (
    <section className="auth-card auth-card-wide" aria-labelledby="auth-title">
      <p className="eyebrow">Arsipin / akses internal</p>
      <h1 id="auth-title">{mode === "login" ? "Masuk ke ruang kerja." : "Buat akun Arsipin."}</h1>
      <p>{mode === "login" ? "Gunakan akun lokal atau lanjutkan dengan Google." : "Daftar dengan username, email, dan password untuk memulai."}</p>
      <div className="auth-tabs" role="tablist" aria-label="Pilihan akses">
        <button className={mode === "login" ? "is-active" : ""} type="button" role="tab" aria-selected={mode === "login"} onClick={() => { setMode("login"); setMessage(""); }}>Masuk</button>
        <button className={mode === "register" ? "is-active" : ""} type="button" role="tab" aria-selected={mode === "register"} onClick={() => { setMode("register"); setMessage(""); }}>Daftar</button>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        {mode === "login" ? <>
          <label className="field"><span>Username atau email</span><input name="identifier" type="text" autoComplete="username" required /></label>
          <PasswordField label="Password" name="password" autoComplete="current-password" />
        </> : <>
          <label className="field"><span>Username</span><input name="username" type="text" autoComplete="username" pattern="[A-Za-z0-9._-]+" minLength={3} maxLength={32} required /><small>Gunakan 3–32 karakter: huruf, angka, titik, garis bawah, atau strip.</small></label>
          <label className="field"><span>Email</span><input name="email" type="email" autoComplete="email" required /></label>
          <PasswordField label="Password" name="password" autoComplete="new-password" />
          <PasswordField label="Konfirmasi password" name="passwordConfirmation" autoComplete="new-password" />
        </>}
        {message ? <p className="auth-message" role="alert">{message}</p> : null}
        <button className="button button-primary" type="submit" disabled={pending}>{pending ? "Memeriksa..." : mode === "login" ? "Masuk" : "Buat akun"}</button>
        <div className="auth-divider"><span>atau</span></div>
        <button className="button google-button" type="button" disabled={pending} onClick={handleGoogleSignIn}><GoogleMark />{mode === "login" ? "Masuk dengan Google" : "Daftar dengan Google"}</button>
      </form>
    </section>
  );
}

function GoogleMark() {
  return <svg className="google-mark" viewBox="0 0 48 48" aria-hidden="true"><path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z" /><path fill="#34A853" d="M24 44c5.5 0 10.2-1.8 13.6-4.8L31 34.1c-1.8 1.2-4.1 2-7 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z" /><path fill="#FBBC05" d="M12.6 27.7a12 12 0 0 1 0-7.4V15H5.8a20 20 0 0 0 0 18l6.8-5.3Z" /><path fill="#EA4335" d="M24 11.9c3 0 5.7 1 7.8 3.1l5.9-5.9A19.7 19.7 0 0 0 24 4 20 20 0 0 0 5.8 15l6.8 5.3c1.6-4.8 6.1-8.4 11.4-8.4Z" /></svg>;
}
