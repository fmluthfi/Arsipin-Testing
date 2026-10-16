import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <Link className="footer-brand" href="/" aria-label="Arsipin, beranda">
          <span className="brand-mark" aria-hidden="true">A</span>
          <span><strong>Arsipin</strong><small>Manajer Dokumen Juknis</small></span>
        </Link>
        <p className="footer-copyright">© {new Date().getFullYear()} Arsipin</p>
      </div>
    </footer>
  );
}
