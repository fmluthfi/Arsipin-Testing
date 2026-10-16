import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createDocument } from "@/app/documents/actions";

type NewDocumentPageProps = { searchParams: Promise<{ error?: string }> };

export default async function NewDocumentPage({ searchParams }: NewDocumentPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { error } = await searchParams;

  return (
    <main className="workspace-shell editor-shell">
      <Link className="back-link" href="/documents">← Kembali ke dokumen</Link>
      <section className="workspace-heading editor-heading">
        <div>
          <p className="eyebrow">Dokumen baru</p>
          <h1>Mulai draf Juknis</h1>
          <p className="workspace-description">Versi pertama disimpan sebagai draf dan tercatat atas nama akun Anda.</p>
        </div>
      </section>

      {error ? <p className="form-error" role="alert">{error === "validation" ? "Judul minimal 3 karakter dan isi dokumen wajib diisi." : "Dokumen gagal disimpan. Periksa koneksi database lalu coba lagi."}</p> : null}

      <form action={createDocument} className="document-form">
        <label className="field">
          Judul dokumen
          <input name="judul" required minLength={3} maxLength={180} placeholder="Contoh: Petunjuk Teknis Pengelolaan Arsip" />
        </label>
        <label className="field">
          Isi awal
          <textarea name="isi" required rows={18} placeholder={"# Judul Petunjuk Teknis\n\n## Tujuan\nTuliskan tujuan dokumen...\n\n## Ruang Lingkup\nJelaskan ruang lingkup..."} />
          <small>Gunakan Markdown untuk judul, daftar, dan penekanan teks.</small>
        </label>
        <div className="form-actions">
          <Link className="button button-outline" href="/documents">Batal</Link>
          <button className="button button-primary" type="submit">Simpan draf</button>
        </div>
      </form>
    </main>
  );
}
