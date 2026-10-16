"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Prisma, Status } from "@prisma/client";
import { z } from "zod";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const documentSchema = z.object({
  judul: z.string().trim().min(3, "Judul minimal 3 karakter.").max(180, "Judul maksimal 180 karakter."),
  isi: z.string().trim().min(1, "Isi dokumen tidak boleh kosong.").max(200_000, "Isi dokumen terlalu panjang."),
});

const revisionSchema = documentSchema.extend({
  id: z.string().min(1),
  ringkasan: z.string().trim().min(1, "Ringkasan perubahan wajib diisi.").max(500),
});

export async function createDocument(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = documentSchema.safeParse({
    judul: formData.get("judul"),
    isi: formData.get("isi"),
  });

  if (!parsed.success) redirect("/documents/new?error=validation");

  let documentId: string;
  try {
    documentId = await prisma.$transaction(async (tx) => {
      const document = await tx.document.create({
        data: { judul: parsed.data.judul, createdById: session.user.id },
      });
      const version = await tx.documentVersion.create({
        data: {
          documentId: document.id,
          nomor: 1,
          isi: parsed.data.isi,
          ringkasan: "Versi awal",
          createdById: session.user.id,
        },
      });
      await tx.document.update({
        where: { id: document.id },
        data: { currentVersionId: version.id },
      });
      return document.id;
    });
  } catch {
    redirect("/documents/new?error=save");
  }

  redirect(`/documents/${documentId}`);
}

export async function saveDocumentVersion(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = revisionSchema.safeParse({
    id: formData.get("id"),
    judul: formData.get("judul"),
    isi: formData.get("isi"),
    ringkasan: formData.get("ringkasan"),
  });
  if (!parsed.success) redirect(`/documents/${String(formData.get("id"))}/edit?error=validation`);

  let outcome: "saved" | "missing" | "forbidden" | "locked" | "conflict" | "failed" = "failed";
  try {
    outcome = await prisma.$transaction(async (tx) => {
      const document = await tx.document.findUnique({
        where: { id: parsed.data.id },
        include: { versions: { orderBy: { nomor: "desc" }, take: 1, select: { nomor: true } } },
      });
      if (!document) return "missing";
      if (document.createdById !== session.user.id) return "forbidden";
      if (document.status !== Status.DRAFT) return "locked";

      const nextNumber = (document.versions[0]?.nomor ?? 0) + 1;
      const version = await tx.documentVersion.create({
        data: {
          documentId: document.id,
          nomor: nextNumber,
          isi: parsed.data.isi,
          ringkasan: parsed.data.ringkasan,
          createdById: session.user.id,
        },
      });
      await tx.document.update({
        where: { id: document.id },
        data: { judul: parsed.data.judul, currentVersionId: version.id },
      });
      return "saved";
    });
  } catch (error) {
    outcome = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002" ? "conflict" : "failed";
  }

  if (outcome === "missing") notFound();
  if (outcome === "forbidden") redirect(`/documents/${parsed.data.id}?error=forbidden`);
  if (outcome === "locked") redirect(`/documents/${parsed.data.id}?error=locked`);
  if (outcome === "conflict") redirect(`/documents/${parsed.data.id}/edit?error=conflict`);
  if (outcome !== "saved") redirect(`/documents/${parsed.data.id}/edit?error=save`);

  revalidatePath("/documents");
  revalidatePath(`/documents/${parsed.data.id}`);
  redirect(`/documents/${parsed.data.id}`);
}
