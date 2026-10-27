"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest, formatApiError, isUnauthenticated, type DocumentDetail } from "@/lib/api";
import { ErrorState, LoadingState } from "@/components/api-state";

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiRequest<DocumentDetail>(`/documents/${encodeURIComponent(id)}`)
      .then((result) => { if (active) setDocument(result); })
      .catch((reason) => {
        if (!active) return;
        if (isUnauthenticated(reason)) router.replace(`/login?callbackUrl=${encodeURIComponent(`/documents/${id}`)}`);
        else setError(formatApiError(reason));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, router]);

  if (loading) return <main className="workspace-shell detail-shell"><LoadingState label="Memuat dokumen..." /></main>;
  if (error || !document) return <main className="workspace-shell detail-shell"><ErrorState message={error || "Dokumen tidak ditemukan."} onRetry={() => window.location.reload()} /></main>;

  return <main className="workspace-shell detail-shell">
    <Link className="back-link" href="/documents">← Kembali ke dokumen</Link>
    <header className="document-detail-heading"><div><p className="eyebrow">Dokumen / {document.status === "DRAFT" ? "Draf" : document.status}</p><h1>{document.judul}</h1><p className="workspace-description">Versi {document.currentVersion?.nomor ?? 0} · dibuat oleh {document.createdBy.name ?? document.createdBy.username ?? "Pengguna Arsipin"} · diperbarui {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(document.updatedAt))}</p></div>
      <div className="detail-actions"><span className={`status-label status-${document.status.toLowerCase()}`}>{document.status === "DRAFT" ? "Draf" : document.status}</span>{document.status === "DRAFT" && document.canEdit ? <Link className="button button-outline" href={`/documents/${id}/edit`}>Edit draf</Link> : null}</div>
    </header>
    <article className="document-content"><div className="document-content-toolbar"><span>Isi dokumen</span><span>Markdown · versi {document.currentVersion?.nomor ?? 0}</span></div><pre>{document.currentVersion?.isi ?? "Isi dokumen belum tersedia."}</pre></article>
  </main>;
}
