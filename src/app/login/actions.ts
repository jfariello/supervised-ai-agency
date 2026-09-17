"use server";

import { redirect } from "next/navigation";
import { clearSimpleAuthCookie, getAppPassword, setSimpleAuthCookie } from "@/lib/simple-auth";

export async function loginWithPassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!getAppPassword() || password !== getAppPassword()) {
    redirect("/login?error=invalid");
  }

  await setSimpleAuthCookie();
  redirect("/dashboard");
}

export async function logout() {
  await clearSimpleAuthCookie();
  redirect("/login");
}
