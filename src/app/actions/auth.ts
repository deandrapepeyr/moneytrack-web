"use server";

import { cookies } from "next/headers";
import api from "@/lib/api";

export async function loginAction(email: string, pin: string) {
  try {
    const response = await api.post("auth/pin", { email, pin });

    if (response.success) {
      // Set HTTP-only cookies
      const cookieStore = await cookies();
      
      cookieStore.set("auth_token", response.data.token, {
        httpOnly: false, // So client side api.ts can read it
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      cookieStore.set("user_data", JSON.stringify(response.data.user), {
        httpOnly: false, // So client side layout can read it
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return { success: true };
    }
    return { success: false, error: "Failed to login" };
  } catch (error: any) {
    return { success: false, error: error.message || "Invalid credentials" };
  }
}

export async function registerAction(email: string, pin: string) {
  try {
    const response = await api.post("auth/register", {
      email,
      pin,
      display_name: email.split("@")[0]
    });

    if (response.success) {
      // Auto login after successful register
      return await loginAction(email, pin);
    }
    return { success: false, error: "Registration failed" };
  } catch (error: any) {
    return { success: false, error: error.message || "Registration failed. Email might already exist." };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("user_data");
  return { success: true };
}
