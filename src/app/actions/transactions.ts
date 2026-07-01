"use server";

import api from "@/lib/api";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export async function addTransactionAction(formData: FormData) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user_data")?.value;
  const token = cookieStore.get("auth_token")?.value;
  
  if (!userCookie || !token) {
    redirect("/login");
  }

  let user = null;
  try {
    try {
      user = JSON.parse(decodeURIComponent(userCookie));
    } catch {
      user = JSON.parse(userCookie);
    }
  } catch (e) {
    redirect("/login");
  }

  const type = formData.get("type") as string;
  const amount = parseInt(formData.get("amount") as string, 10);
  const description = formData.get("name") as string;
  const category_id = formData.get("category") as string;
  const date = formData.get("date") as string;
  
  let isSuccess = false;
  let errorMessage = "";

  try {
    const response = await api.post("transactions/create", {
      user_id: user.user_id,
      token: token,
      type,
      amount,
      category_id,
      description,
      date
    });

    if (response.success) {
      isSuccess = true;
    } else {
      errorMessage = response.error?.message || "Gagal menyimpan transaksi";
    }
  } catch (error: any) {
    errorMessage = error.message || "Terjadi kesalahan server";
  }

  if (isSuccess) {
    // Invalidate the cache for dashboard and transactions
    // @ts-ignore - Next.js types sometimes expect 2 arguments incorrectly
    revalidateTag(`user-${user.user_id}`);
    redirect("/transactions");
  } else {
    redirect(`/transactions/add?error=${encodeURIComponent(errorMessage)}`);
  }
}
