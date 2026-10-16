import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type DocumentDetailProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function DocumentDetailPage({ params, searchParams }: DocumentDetailProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      createdBy: { select: { name: true, username: true } },
      currentVersion: true,
    },
  });
  if (!document) notFound();
  const errorMessage = error === "forbidden"
    ? "Anda hanya dapat mengubah dokumen yang Anda buat."
    : error === "locked"
      ? "Dokumen ini terkunci karena statusnya bukan draf."
      : null;

  return (
    <main className="workspace-shell detail-shell">
      <Link className="back-link" href="/documents">← Kembali ke dokumen</Link>
      <header className="document-detail-heading">
        <div>
          <p className="eyebrow">Dokumen / {document.status === "DRAFT" ? "Draf" : document.status}</p>
          <h1>{document.judul}</h1>
          <p className="workspace-description">
            Versi {document.currentVersion?.nomor ?? 0} · dibuat oleh {document.createdBy.name ?? document.createdBy.username ?? "Pengguna Arsipin"} · diperbarui {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(document.updatedAt)}
          </p>
        </div>
        <div className="detail-actions">
          <span className={`status-label status-${document.status.toLowerCase()}`}>{document.status === "DRAFT" ? "Draf" : document.status}</span>
          {document.status === "DRAFT" && document.createdById === session.user.id
            ? <Link className="button button-outline" href={`/documents/${id}/edit`}>Edit draf</Link>
            : null}
        </div>
      </header>
      {errorMessage ? <p className="form-error" role="alert">{errorMessage}</p> : null}
      <article className="document-content">
        <div className="document-content-toolbar">
          <span>Isi dokumen</span>
          <span>Markdown · versi {document.currentVersion?.nomor ?? 0}</span>
        </div>
        <pre>{document.currentVersion?.isi ?? "Isi dokumen belum tersedia."}</pre>
      </article>
    </main>
  );
}
