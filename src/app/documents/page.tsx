"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { apiRequest, formatApiError, isUnauthenticated, type DocumentList, type DocumentStatus } from "@/lib/api";
import { ErrorState, LoadingState } from "@/components/api-state";

const statusLabels: Record<DocumentStatus, string> = {
  DRAFT: "Draf",
  REVIEW: "Dalam review",
  APPROVED: "Disetujui",
  PUBLISHED: "Terbit",
};

export default function DocumentsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [status, setStatus] = useState("");
  const [statusValue, setStatusValue] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<DocumentList | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q") ?? "");
    setSearchValue(params.get("q") ?? "");
    setStatus(params.get("status") ?? "");
    setStatusValue(params.get("status") ?? "");
    setPage(Math.max(1, Number(params.get("page")) || 1));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (query.trim()) params.set("q", query.trim());
    if (status) params.set("status", status);
    let active = true;
    setLoading(true);
    setError("");
    apiRequest<DocumentList>(`/documents?${params.toString()}`)
      .then((result) => { if (active) setData(result); })
      .catch((reason: unknown) => {
        if (!active) return;
        if (isUnauthenticated(reason)) router.replace("/login?callbackUrl=%2Fdocuments");
        else setError(formatApiError(reason));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, query, status, router]);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextQuery = String(form.get("q") ?? "").trim().slice(0, 120);
    const nextStatus = String(form.get("status") ?? "");
    setPage(1);
    setQuery(nextQuery);
    setSearchValue(nextQuery);
    setStatus(nextStatus);
    setStatusValue(nextStatus);
    const params = new URLSearchParams();
    if (nextQuery) params.set("q", nextQuery);
    if (nextStatus) params.set("status", nextStatus);
    router.replace(params.size ? `/documents?${params}` : "/documents", { scroll: false });
  }

  function changePage(nextPage: number) {
    setPage(nextPage);
    const params = new URLSearchParams({ page: String(nextPage) });
    if (query) params.set("q", query);
    if (status) params.set("status", status);
    router.replace(`/documents?${params.toString()}`, { scroll: false });
  }

  return (
    <main className="workspace-shell">
      <section className="workspace-heading">
        <div><p className="eyebrow">Ruang kerja</p><h1>Dokumen</h1><p className="workspace-description">Kelola draf dan telusuri dokumen petunjuk teknis dalam satu tempat.</p></div>
        <Link className="button button-primary" href="/documents/new">Buat dokumen</Link>
      </section>
      <form className="document-filters" onSubmit={applyFilters}>
        <label className="filter-search"><span className="sr-only">Cari judul dokumen</span><input name="q" type="search" value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="Cari judul dokumen" /></label>
        <label className="filter-status"><span className="sr-only">Filter status</span><select name="status" value={statusValue} onChange={(event) => setStatusValue(event.target.value)}><option value="">Semua status</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <button className="button button-outline" type="submit">Terapkan</button>
      </form>
      {loading ? <LoadingState label="Memuat dokumen..." /> : error ? <ErrorState message={error} onRetry={() => window.location.reload()} /> : data?.items.length ? <>
        <div className="document-list" aria-label="Daftar dokumen">
          {data.items.map((document) => <Link className="document-row" href={`/documents/${document.id}`} key={document.id}>
            <span className="document-row-main"><strong>{document.judul}</strong><small>Dibuat oleh {document.createdBy.name ?? document.createdBy.username ?? "Pengguna Arsipin"}</small></span>
            <span className={`status-label status-${document.status.toLowerCase()}`}>{statusLabels[document.status]}</span>
            <span className="document-version">Versi {document.currentVersion?.nomor ?? 0}</span>
            <time className="document-date" dateTime={document.updatedAt}>{new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(document.updatedAt))}</time>
          </Link>)}
        </div>
        <div className="list-footer"><p>{data.total} dokumen{query || status ? " ditemukan" : ""}</p>{data.totalPages > 1 ? <nav className="pagination" aria-label="Halaman daftar dokumen">
          {page > 1 ? <button className="button button-outline" type="button" onClick={() => changePage(page - 1)}>Sebelumnya</button> : null}<span>Halaman {page} dari {data.totalPages}</span>{page < data.totalPages ? <button className="button button-outline" type="button" onClick={() => changePage(page + 1)}>Berikutnya</button> : null}
        </nav> : null}</div>
      </> : <section className="documents-empty" aria-live="polite"><span className="empty-mark" aria-hidden="true">A</span><h2>{query || status ? "Dokumen tidak ditemukan" : "Belum ada dokumen"}</h2><p>{query || status ? "Coba ubah kata kunci atau filter status." : "Mulai dengan membuat dokumen Juknis pertama. Versi awal akan tersimpan sebagai draf."}</p>{query || status ? <Link className="button button-outline" href="/documents">Hapus filter</Link> : <Link className="button button-primary" href="/documents/new">Buat dokumen pertama</Link>}</section>}
    </main>
  );
}
