"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { apiRequest, formatApiError, isUnauthenticated } from "@/lib/api";

export default function NewDocumentPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await apiRequest<{ id: string }>("/documents", { method: "POST", body: JSON.stringify({ judul: form.get("judul"), isi: form.get("isi") }) });
      router.push(`/documents/${result.id}`);
    } catch (reason) {
      if (isUnauthenticated(reason)) router.replace("/login?callbackUrl=%2Fdocuments%2Fnew");
      else setError(formatApiError(reason));
      setPending(false);
    }
  }

  return <main className="workspace-shell editor-shell">
    <Link className="back-link" href="/documents">← Kembali ke dokumen</Link>
    <section className="workspace-heading editor-heading"><div><p className="eyebrow">Dokumen baru</p><h1>Mulai draf Juknis</h1><p className="workspace-description">Versi pertama disimpan sebagai draf dan tercatat atas nama akun Anda.</p></div></section>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <form onSubmit={handleSubmit} className="document-form">
      <label className="field">Judul dokumen<input name="judul" required minLength={3} maxLength={180} placeholder="Contoh: Petunjuk Teknis Pengelolaan Arsip" /></label>
      <label className="field">Isi awal<textarea name="isi" required rows={18} placeholder={"# Judul Petunjuk Teknis\n\n## Tujuan\nTuliskan tujuan dokumen...\n\n## Ruang Lingkup\nJelaskan ruang lingkup..."} /><small>Gunakan Markdown untuk judul, daftar, dan penekanan teks.</small></label>
      <div className="form-actions"><Link className="button button-outline" href="/documents">Batal</Link><button className="button button-primary" type="submit" disabled={pending}>{pending ? "Menyimpan..." : "Simpan draf"}</button></div>
    </form>
  </main>;
}
