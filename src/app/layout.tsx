import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppNav } from "@/components/app-nav";
import { AppFooter } from "@/components/app-footer";
import { SmoothScroll } from "@/components/smooth-scroll";

export const metadata: Metadata = {
  title: "Arsipin | Manajer Dokumen Juknis",
  description: "Ruang kerja internal untuk menulis, meninjau, dan menerbitkan dokumen Juknis.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="id"><body><AppNav /><SmoothScroll />{children}<AppFooter /></body></html>;
}
