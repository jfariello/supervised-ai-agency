import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";

const cookieName = "agencia_ia_session";

export function getAppPassword() {
  return process.env.APP_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD ?? "";
}

export function getSessionToken() {
  const password = getAppPassword();
  if (!password) return "";
  return crypto.createHash("sha256").update(`${password}:${process.env.AUTH_SECRET ?? "local"}`).digest("hex");
}

export async function requireSimpleAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  if (!token || token !== getSessionToken()) redirect("/login");
}

export async function setSimpleAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(cookieName, getSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });
}

export async function clearSimpleAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}

export async function isSimpleAuthed() {
  const cookieStore = await cookies();
  return cookieStore.get(cookieName)?.value === getSessionToken();
}
