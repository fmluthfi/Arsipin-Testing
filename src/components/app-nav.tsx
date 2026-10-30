"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, type User } from "@/lib/api";

export function AppNav() {
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  useEffect(() => {
    apiRequest<{ user: User | null }>("/auth/session")
      .then((session) => setUser(session.user))
      .catch(() => setUser(null))
      .finally(() => setChecked(true));
  }, []);

  async function handleSignOut() {
    try {
      await apiRequest<void>("/auth/logout", { method: "POST" });
      window.location.assign("/");
    } catch {
      setSignOutError("Belum dapat keluar. Coba lagi.");
    }
  }

  return (
    <header className="app-nav">
      <div className={`nav-inner${user ? " nav-inner-authenticated" : ""}`}>
        <Link className="brand" href={user ? "/documents" : "/"} aria-label={user ? "Arsipin, ruang kerja" : "Arsipin, beranda"}>
          <span className="brand-mark" aria-hidden="true">A</span>
          <span>Arsipin</span>
        </Link>
        <nav className="nav-links" aria-label="Navigasi utama">
          {user ? <Link href="/documents" aria-current="page">Dokumen</Link> : <><Link href="/#alur">Alur kerja</Link><Link href="/#prinsip">Prinsip</Link></>}
        </nav>
        <div className="nav-actions">
          {!checked ? <span className="user-name" role="status">Memuat sesi...</span> : user ? <><span className="user-name">{user.name ?? user.email}</span><button className="button button-quiet" type="button" onClick={handleSignOut}>Keluar</button>{signOutError ? <span role="alert">{signOutError}</span> : null}</> : <Link className="button button-outline" href="/login">Masuk</Link>}
        </div>
      </div>
    </header>
  );
}
