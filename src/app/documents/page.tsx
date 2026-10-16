import Link from "next/link";
import { redirect } from "next/navigation";
import { Status, type Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const pageSize = 10;
const statusLabels: Record<Status, string> = {
  DRAFT: "Draf",
  REVIEW: "Dalam review",
  APPROVED: "Disetujui",
  PUBLISHED: "Terbit",
};

type DocumentsPageProps = {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
};

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const query = params.q?.trim().slice(0, 120) ?? "";
  const status = Object.values(Status).find((value) => value === params.status);
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const where: Prisma.DocumentWhereInput = {
    ...(query ? { judul: { contains: query, mode: "insensitive" } } : {}),
    ...(status ? { status } : {}),
  };

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      include: { createdBy: { select: { name: true, username: true } }, currentVersion: { select: { nomor: true } } },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.document.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="workspace-shell">
      <section className="workspace-heading">
        <div>
          <p className="eyebrow">Ruang kerja</p>
          <h1>Dokumen</h1>
          <p className="workspace-description">Kelola draf dan telusuri dokumen petunjuk teknis dalam satu tempat.</p>
        </div>
        <Link className="button button-primary" href="/documents/new">Buat dokumen</Link>
      </section>

      <form className="document-filters" action="/documents" method="get">
        <label className="filter-search">
          <span className="sr-only">Cari judul dokumen</span>
          <input name="q" type="search" defaultValue={query} placeholder="Cari judul dokumen" />
        </label>
        <label className="filter-status">
          <span className="sr-only">Filter status</span>
          <select name="status" defaultValue={status ?? ""}>
            <option value="">Semua status</option>
            {Object.values(Status).map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}
          </select>
        </label>
        <button className="button button-outline" type="submit">Terapkan</button>
      </form>

      {documents.length ? (
        <>
          <div className="document-list" aria-label="Daftar dokumen">
            {documents.map((document) => (
              <Link className="document-row" href={`/documents/${document.id}`} key={document.id}>
                <span className="document-row-main">
                  <strong>{document.judul}</strong>
                  <small>Dibuat oleh {document.createdBy.name ?? document.createdBy.username ?? "Pengguna Arsipin"}</small>
                </span>
                <span className={`status-label status-${document.status.toLowerCase()}`}>{statusLabels[document.status]}</span>
                <span className="document-version">Versi {document.currentVersion?.nomor ?? 0}</span>
                <time className="document-date" dateTime={document.updatedAt.toISOString()}>
                  {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(document.updatedAt)}
                </time>
              </Link>
            ))}
          </div>
          <div className="list-footer">
            <p>{total} dokumen{query || status ? " ditemukan" : ""}</p>
            {totalPages > 1 ? (
              <nav className="pagination" aria-label="Halaman daftar dokumen">
                {page > 1 && <Link className="button button-outline" href={pageHref(page - 1, query, status)}>Sebelumnya</Link>}
                <span>Halaman {page} dari {totalPages}</span>
                {page < totalPages && <Link className="button button-outline" href={pageHref(page + 1, query, status)}>Berikutnya</Link>}
              </nav>
            ) : null}
          </div>
        </>
      ) : (
        <section className="documents-empty" aria-live="polite">
          <span className="empty-mark" aria-hidden="true">A</span>
          <h2>{query || status ? "Dokumen tidak ditemukan" : "Belum ada dokumen"}</h2>
          <p>{query || status ? "Coba ubah kata kunci atau filter status." : "Mulai dengan membuat dokumen Juknis pertama. Versi awal akan tersimpan sebagai draf."}</p>
          {query || status ? <Link className="button button-outline" href="/documents">Hapus filter</Link> : <Link className="button button-primary" href="/documents/new">Buat dokumen pertama</Link>}
        </section>
      )}
    </main>
  );
}

function pageHref(page: number, query: string, status?: Status) {
  const params = new URLSearchParams({ page: String(page) });
  if (query) params.set("q", query);
  if (status) params.set("status", status);
  return `/documents?${params.toString()}`;
}
