"use server";

import { cookies } from "next/headers";

export async function setThemeAction(formData: FormData) {
  const newTheme = formData.get("theme") as string;
  if (!newTheme) return;
  
  const cookieStore = await cookies();
  cookieStore.set("moneytrack_theme", newTheme, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}
