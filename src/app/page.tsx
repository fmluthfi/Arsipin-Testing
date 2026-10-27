import Link from "next/link";
import { LandingAnimations } from "@/components/landing-animations";

const workflow = [
  { number: "01", title: "Tulis", description: "Mulai dari editor Markdown yang ringan dan mudah dibaca." },
  { number: "02", title: "Revisi", description: "Simpan perubahan sebagai versi baru tanpa menghapus jejak lama." },
  { number: "03", title: "Review", description: "Ajukan dokumen untuk ditinjau dengan konteks versi yang jelas." },
  { number: "04", title: "Terbitkan", description: "Publikasikan versi yang sudah disetujui sebagai acuan resmi." },
];

export default function Home() {
  return (
    <main className="page-shell home-page">
      <LandingAnimations />
      <div className="background-stamp" aria-hidden="true">ARSIPIN / JUKNIS / RIWAYAT VERSI</div>
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-panel">
          <p className="eyebrow">Ruang kerja dokumen internal</p>
          <h1 id="hero-title">Dokumen Juknis yang tertata, dari draf hingga terbit.</h1>
          <p className="hero-copy">Arsipin membantu tim menulis, merevisi, meninjau, dan menjaga riwayat setiap perubahan dalam satu tempat.</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/login">Masuk ke Arsipin</Link>
            <a className="text-link" href="#alur">Lihat cara kerja <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <div className="document-preview" aria-label="Contoh tampilan dokumen Arsipin">
          <div className="preview-toolbar"><span className="preview-kicker">JUKNIS / 2026</span><span className="status-mark">DRAF</span></div>
          <div className="document-sheet">
            <span className="sheet-label">Petunjuk Teknis</span>
            <h2>Pengelolaan Arsip Dokumen</h2>
            <p className="sheet-meta">Versi 03 · terakhir diperbarui hari ini</p>
            <div className="sheet-lines" aria-hidden="true"><i /><i /><i /><i /><i /></div>
            <div className="sheet-footer"><span>Ringkasan perubahan</span><strong>Review berikutnya</strong></div>
          </div>
          <div className="preview-note"><span className="note-dot" aria-hidden="true" />Semua perubahan tercatat sebagai versi baru.</div>
        </div>
      </section>
      <section className="landing-section workflow-section" id="alur" tabIndex={-1} aria-labelledby="workflow-title">
        <div className="section-heading"><p className="eyebrow">Alur kerja</p><h2 id="workflow-title">Satu alur, setiap perubahan punya tempat.</h2></div>
        <div className="workflow-list">{workflow.map((item) => <article className="workflow-item" key={item.number}><span className="card-index">{item.number}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div>
      </section>
      <section className="landing-section principles-section" id="prinsip" tabIndex={-1} aria-labelledby="principles-title">
        <div className="principle-intro"><p className="eyebrow">Cara Arsipin bekerja</p><h2 id="principles-title">Jejak perubahan tetap utuh, keputusan tetap jelas.</h2></div>
        <div className="principle-list"><p><strong>Riwayat append-only.</strong> Penyimpanan baru tidak menimpa versi sebelumnya.</p><p><strong>Review berbasis versi.</strong> Yang ditinjau selalu versi tertentu, bukan isi yang kebetulan paling baru.</p><p><strong>Terbit dengan kendali.</strong> Versi terbit tetap terkunci sampai revisi baru melewati alur yang sama.</p></div>
      </section>
      <section className="closing-section" aria-labelledby="closing-title">
        <p className="eyebrow">Ruang kerja yang siap ditelusuri</p>
        <h2 id="closing-title">Mulai dari satu dokumen yang ingin Anda rapikan.</h2>
        <Link className="button button-primary" href="/login">Masuk ke Arsipin</Link>
      </section>
    </main>
  );
}
