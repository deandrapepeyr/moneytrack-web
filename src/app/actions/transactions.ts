"use server";

import api from "@/lib/api";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addTransactionAction(formData: FormData) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user_data")?.value;
  
  if (!userCookie) {
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
  const name = formData.get("name") as string;
  const category_name = formData.get("category") as string;
  const date = formData.get("date") as string;
  
  try {
    const response = await api.post("transactions/create", {
      user_id: user.user_id,
      type,
      amount,
      name,
      category_name,
      date
    });

    if (response.success) {
      // Invalidate the cache for dashboard and transactions
      revalidatePath("/dashboard");
      revalidatePath("/transactions");
      redirect("/transactions");
    } else {
      redirect(`/transactions/add?error=${encodeURIComponent(response.error?.message || "Gagal menyimpan transaksi")}`);
    }
  } catch (error: any) {
    redirect(`/transactions/add?error=${encodeURIComponent(error.message || "Terjadi kesalahan server")}`);
  }
}
