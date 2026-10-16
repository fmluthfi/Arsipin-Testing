import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Status } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveDocumentVersion } from "@/app/documents/actions";

type EditDocumentPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditDocumentPage({ params, searchParams }: EditDocumentPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const document = await prisma.document.findUnique({
    where: { id },
    include: { currentVersion: true },
  });
  if (!document) notFound();
  if (document.createdById !== session.user.id) redirect(`/documents/${id}?error=forbidden`);
  if (document.status !== Status.DRAFT) redirect(`/documents/${id}?error=locked`);

  return (
    <main className="workspace-shell editor-shell">
      <Link className="back-link" href={`/documents/${id}`}>← Batal dan kembali</Link>
      <section className="workspace-heading editor-heading">
        <div>
          <p className="eyebrow">Revisi dokumen · versi {document.currentVersion?.nomor ?? 0}</p>
          <h1>Edit draf</h1>
          <p className="workspace-description">Simpan revisi sebagai versi baru. Versi sebelumnya tetap tersimpan.</p>
        </div>
      </section>

      {error ? <p className="form-error" role="alert">{error === "validation" ? "Judul, isi, dan ringkasan perubahan wajib diisi." : error === "conflict" ? "Versi baru saja disimpan oleh pengguna lain. Muat ulang lalu coba lagi." : "Perubahan gagal disimpan. Periksa koneksi database lalu coba lagi."}</p> : null}

      <form action={saveDocumentVersion} className="document-form">
        <input type="hidden" name="id" value={document.id} />
        <label className="field">
          Judul dokumen
          <input name="judul" required minLength={3} maxLength={180} defaultValue={document.judul} />
        </label>
        <label className="field">
          Ringkasan perubahan
          <input name="ringkasan" required maxLength={500} placeholder="Contoh: Memperjelas tahapan pelaksanaan" />
        </label>
        <label className="field">
          Isi dokumen
          <textarea name="isi" required rows={18} defaultValue={document.currentVersion?.isi ?? ""} />
          <small>Setiap penyimpanan membuat versi baru. Versi lama tidak ditimpa.</small>
        </label>
        <div className="form-actions">
          <Link className="button button-outline" href={`/documents/${id}`}>Batal</Link>
          <button className="button button-primary" type="submit">Simpan versi baru</button>
        </div>
      </form>
    </main>
  );
}
