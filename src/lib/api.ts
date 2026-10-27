export type Role = "PENULIS" | "REVIEWER" | "ADMIN";
export type DocumentStatus = "DRAFT" | "REVIEW" | "APPROVED" | "PUBLISHED";

export type User = {
  id: string;
  name: string | null;
  email: string;
  username?: string | null;
  role: Role;
};

export type DocumentSummary = {
  id: string;
  judul: string;
  status: DocumentStatus;
  createdBy: { name: string | null; username: string | null };
  currentVersion: { nomor: number } | null;
  updatedAt: string;
};

export type DocumentDetail = DocumentSummary & {
  createdById: string;
  canEdit: boolean;
  currentVersion: { nomor: number; isi: string } | null;
};

export type DocumentList = {
  items: DocumentSummary[];
  total: number;
  page: number;
  totalPages: number;
};

export class ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export function apiUrl(path: string) {
  if (!apiBaseUrl) throw new ApiError("Alamat backend belum dikonfigurasi.");
  return `${apiBaseUrl}${path}`;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = apiUrl(path);
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      credentials: "include",
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError("Backend belum dapat dihubungi. Pastikan API berjalan.");
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { message?: string } | null;
    throw new ApiError(payload?.message ?? "Permintaan gagal. Silakan coba lagi.", response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function isUnauthenticated(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

export function formatApiError(error: unknown) {
  return error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi.";
}
