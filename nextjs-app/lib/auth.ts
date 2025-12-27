import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token");
    return token?.value === "authenticated";
  } catch {
    return false;
  }
}

export async function setAuthToken() {
  const cookieStore = await cookies();
  cookieStore.set("admin_token", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function removeAuthToken() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
}

