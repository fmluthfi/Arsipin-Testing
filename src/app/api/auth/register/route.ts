import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registrationSchema = z.object({
  username: z.string().trim().min(3).max(32).regex(/^[a-zA-Z0-9._-]+$/),
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
  passwordConfirmation: z.string(),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Konfirmasi password tidak sama.",
  path: ["passwordConfirmation"],
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registrationSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ message: "Periksa username, email, dan password Anda." }, { status: 400 });
    }

    const username = parsed.data.username.toLowerCase();
    const email = parsed.data.email.toLowerCase();
    const existingUser = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existingUser) {
      return Response.json({ message: "Username atau email sudah digunakan." }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: { username, email, name: username, passwordHash: await hash(parsed.data.password, 12) },
      select: { id: true, username: true },
    });
    return Response.json({ id: user.id, username: user.username }, { status: 201 });
  } catch {
    return Response.json({ message: "Pendaftaran gagal. Silakan coba lagi." }, { status: 500 });
  }
}
