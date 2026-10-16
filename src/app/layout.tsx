import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { auth } from "@/auth";
import { AppNav } from "@/components/app-nav";
import { AppFooter } from "@/components/app-footer";
import { SmoothScroll } from "@/components/smooth-scroll";

export const metadata: Metadata = {
  title: "Arsipin — Manajer Dokumen Juknis",
  description: "Ruang kerja internal untuk menulis, meninjau, dan menerbitkan dokumen Juknis.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="id"
      className="h-full antialiased"
    >
      <body className="min-h-full"><AppNav session={auth()} /><SmoothScroll />{children}<AppFooter /></body>
    </html>
  );
}
