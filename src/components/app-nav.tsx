import Link from "next/link";
import { signOut } from "@/auth";

type AppNavProps = { session: Promise<{ user?: { name?: string | null; email?: string | null } } | null> };

export async function AppNav({ session }: AppNavProps) {
  const currentSession = await session;
  const workspaceHref = currentSession ? "/documents" : "/";

  return (
    <header className="app-nav">
      <div className="nav-inner">
        <Link className="brand" href={workspaceHref} aria-label={currentSession ? "Arsipin, ruang kerja" : "Arsipin, beranda"}>
          <span className="brand-mark" aria-hidden="true">A</span>
          <span>Arsipin</span>
        </Link>
        <nav className="nav-links" aria-label="Navigasi utama">
          {currentSession ? (
            <Link href="/documents" aria-current="page">Dokumen</Link>
          ) : (
            <>
              <Link href="/#alur">Alur kerja</Link>
              <Link href="/#prinsip">Prinsip</Link>
            </>
          )}
        </nav>
        <div className="nav-actions">
          {currentSession ? <><span className="user-name">{currentSession.user?.name ?? currentSession.user?.email}</span><form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}><button className="button button-quiet" type="submit">Keluar</button></form></> : <Link className="button button-outline" href="/login">Masuk</Link>}
        </div>
      </div>
    </header>
  );
}
