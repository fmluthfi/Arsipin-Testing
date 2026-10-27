"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { apiRequest, formatApiError, isUnauthenticated, type DocumentDetail } from "@/lib/api";
import { ErrorState, LoadingState } from "@/components/api-state";

export default function EditDocumentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    apiRequest<DocumentDetail>(`/documents/${encodeURIComponent(id)}`)
      .then((result) => { if (active) setDocument(result); })
      .catch((reason) => {
        if (!active) return;
        if (isUnauthenticated(reason)) router.replace(`/login?callbackUrl=${encodeURIComponent(`/documents/${id}/edit`)}`);
        else setError(formatApiError(reason));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await apiRequest(`/documents/${encodeURIComponent(id)}/versions`, {
        method: "POST",
        body: JSON.stringify({ judul: form.get("judul"), isi: form.get("isi"), ringkasan: form.get("ringkasan") }),
      });
      router.push(`/documents/${id}`);
    } catch (reason) {
      if (isUnauthenticated(reason)) router.replace(`/login?callbackUrl=${encodeURIComponent(`/documents/${id}/edit`)}`);
      else setError(formatApiError(reason));
      setPending(false);
    }
  }

  if (loading) return <main className="workspace-shell editor-shell"><LoadingState label="Memuat draf..." /></main>;
  if (error || !document) return <main className="workspace-shell editor-shell"><ErrorState message={error || "Dokumen tidak ditemukan."} onRetry={() => window.location.reload()} /></main>;
  if (!document.canEdit || document.status !== "DRAFT") return <main className="workspace-shell editor-shell"><ErrorState message="Anda tidak dapat mengubah dokumen ini." /><Link className="button button-outline" href={`/documents/${id}`}>Kembali ke dokumen</Link></main>;

  return <main className="workspace-shell editor-shell">
    <Link className="back-link" href={`/documents/${id}`}>← Batal dan kembali</Link>
    <section className="workspace-heading editor-heading"><div><p className="eyebrow">Revisi dokumen · versi {document.currentVersion?.nomor ?? 0}</p><h1>Edit draf</h1><p className="workspace-description">Simpan revisi sebagai versi baru. Versi sebelumnya tetap tersimpan.</p></div></section>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <form onSubmit={handleSubmit} className="document-form">
      <label className="field">Judul dokumen<input name="judul" required minLength={3} maxLength={180} defaultValue={document.judul} /></label>
      <label className="field">Ringkasan perubahan<input name="ringkasan" required maxLength={500} placeholder="Contoh: Memperjelas tahapan pelaksanaan" /></label>
      <label className="field">Isi dokumen<textarea name="isi" required rows={18} defaultValue={document.currentVersion?.isi ?? ""} /><small>Setiap penyimpanan membuat versi baru. Versi lama tidak ditimpa.</small></label>
      <div className="form-actions"><Link className="button button-outline" href={`/documents/${id}`}>Batal</Link><button className="button button-primary" type="submit" disabled={pending}>{pending ? "Menyimpan..." : "Simpan versi baru"}</button></div>
    </form>
  </main>;
}
