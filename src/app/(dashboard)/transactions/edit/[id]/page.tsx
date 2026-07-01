import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { updateTransactionAction, deleteTransactionAction } from "@/app/actions/transactions";

export default async function EditTransactionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedParams = await searchParams;
  const { id } = await params;
  
  const cookieStore = await cookies();
  const theme = cookieStore.get("moneytrack_theme")?.value || "masculine";
  const userCookie = cookieStore.get("user_data")?.value;
  
  if (!userCookie) redirect("/login");
  
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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://script.google.com/macros/s/AKfycbxcBwrRwiv3dRFvD_zB9O1Ru-jGF4rJorSge7ptYuI3rnbANtKSEkFrGr-2vE0KhyrM/exec';
  const token = cookieStore.get("auth_token")?.value || "";
  
  const getCategories = unstable_cache(
    async (userId: string, token: string) => {
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "categories/list", user_id: userId, token }),
        });
        const result = await res.json();
        return result.success ? result.data : [];
      } catch (err) {
        console.error("Error fetching categories:", err);
        return [];
      }
    },
    ['categories-data'],
    { tags: ['categories', `user-${user.user_id}`], revalidate: 3600 }
  );

  const getTransaction = async (txnId: string, userId: string, token: string) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "transactions/get", id: txnId, user_id: userId, token }),
      });
      const result = await res.json();
      return result.success ? result.data : null;
    } catch (err) {
      console.error("Error fetching transaction:", err);
      return null;
    }
  };

  const [categories, transaction] = await Promise.all([
    getCategories(user.user_id, token),
    getTransaction(id, user.user_id, token)
  ]);

  if (!transaction) {
    redirect("/transactions");
  }

  const incomeCategories = categories.filter((c: any) => c.type === "INCOME");
  const outcomeCategories = categories.filter((c: any) => c.type === "OUTCOME");
  
  // Format date for the input defaultValue
  const txDate = new Date(transaction.date);
  const txDateStr = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}-${String(txDate.getDate()).padStart(2, '0')}`;

  return (
    <div className={`p-4 md:p-8 lg:p-10 flex flex-col min-h-screen transition-colors duration-500 ${
      theme === "feminine" ? "bg-fuchsia-50/50" : "bg-[#f8fafc]"
    }`}>
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/transactions" 
          className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
            theme === "feminine" 
              ? "bg-white border-pink-200 text-pink-600 hover:bg-pink-50" 
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className={`text-2xl font-bold ${
            theme === "feminine" ? "text-pink-950" : "text-[#0f172a]"
          }`}>Edit Transaksi</h1>
          <p className={`text-sm mt-1 ${
            theme === "feminine" ? "text-pink-600/70" : "text-slate-500"
          }`}>Ubah data atau hapus transaksi ini</p>
        </div>
      </div>

      <div className={`max-w-2xl rounded-2xl border shadow-sm p-6 md:p-8 ${
        theme === "feminine" ? "bg-white/80 border-pink-100 backdrop-blur-sm" : "bg-white border-slate-200"
      }`}>
        
        {resolvedParams.error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-medium">
            {resolvedParams.error}
          </div>
        )}

        <form action={updateTransactionAction} className="space-y-6">
          <input type="hidden" name="id" value={transaction.transaction_id} />
          
          <div className="space-y-2">
            <label className={`text-sm font-semibold ${
              theme === "feminine" ? "text-pink-900" : "text-slate-700"
            }`}>Tipe Transaksi</label>
            <div className="flex gap-4">
              <label className="flex-1">
                <input type="radio" name="type" value="OUTCOME" className="peer sr-only" defaultChecked={transaction.type === "OUTCOME"} />
                <div className={`text-center py-3 rounded-xl border-2 cursor-pointer font-bold transition-all peer-checked:shadow-sm ${
                  theme === "feminine"
                    ? "border-pink-100 text-pink-400 hover:bg-pink-50 peer-checked:border-pink-500 peer-checked:bg-pink-50 peer-checked:text-pink-600"
                    : "border-slate-100 text-slate-400 hover:bg-slate-50 peer-checked:border-rose-500 peer-checked:bg-rose-50 peer-checked:text-rose-600"
                }`}>
                  Pengeluaran
                </div>
              </label>
              <label className="flex-1">
                <input type="radio" name="type" value="INCOME" className="peer sr-only" defaultChecked={transaction.type === "INCOME"} />
                <div className={`text-center py-3 rounded-xl border-2 cursor-pointer font-bold transition-all peer-checked:shadow-sm ${
                  theme === "feminine"
                    ? "border-pink-100 text-pink-400 hover:bg-fuchsia-50 peer-checked:border-fuchsia-500 peer-checked:bg-fuchsia-50 peer-checked:text-fuchsia-600"
                    : "border-slate-100 text-slate-400 hover:bg-slate-50 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-600"
                }`}>
                  Pemasukan
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-semibold ${
              theme === "feminine" ? "text-pink-900" : "text-slate-700"
            }`}>Jumlah (Rp)</label>
            <div className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold ${
                theme === "feminine" ? "text-pink-400" : "text-slate-400"
              }`}>Rp</span>
              <input 
                type="number" 
                name="amount"
                required
                min="0"
                defaultValue={transaction.amount}
                className={`w-full pl-12 pr-4 py-3 rounded-xl font-bold text-lg border focus:outline-none focus:ring-2 transition-all ${
                  theme === "feminine" 
                    ? "bg-pink-50/30 border-pink-100 focus:border-pink-400 focus:ring-pink-200/50 text-pink-950 placeholder:text-pink-300" 
                    : "bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 text-slate-900"
                }`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-semibold ${
              theme === "feminine" ? "text-pink-900" : "text-slate-700"
            }`}>Nama Transaksi</label>
            <input 
              type="text" 
              name="name"
              required
              defaultValue={transaction.description}
              className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all ${
                theme === "feminine" 
                  ? "bg-pink-50/30 border-pink-100 focus:border-pink-400 focus:ring-pink-200/50 text-pink-900 placeholder:text-pink-300" 
                  : "bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 text-slate-900"
              }`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={`text-sm font-semibold ${
                theme === "feminine" ? "text-pink-900" : "text-slate-700"
              }`}>Kategori</label>
              <select 
                name="category"
                required
                defaultValue={transaction.category_id}
                className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                  theme === "feminine" 
                    ? "bg-pink-50/30 border-pink-100 focus:border-pink-400 focus:ring-pink-200/50 text-pink-900" 
                    : "bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 text-slate-900"
                }`}
              >
                <option value="" disabled>Pilih kategori...</option>
                <optgroup label="Pengeluaran">
                  {outcomeCategories.map((cat: any) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Pemasukan">
                  {incomeCategories.map((cat: any) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="space-y-2">
              <label className={`text-sm font-semibold ${
                theme === "feminine" ? "text-pink-900" : "text-slate-700"
              }`}>Tanggal</label>
              <input 
                type="date" 
                name="date"
                required
                defaultValue={txDateStr}
                className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all ${
                  theme === "feminine" 
                    ? "bg-pink-50/30 border-pink-100 focus:border-pink-400 focus:ring-pink-200/50 text-pink-900" 
                    : "bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 text-slate-900"
                }`}
              />
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button 
              type="submit"
              className={`flex-1 text-white px-5 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm ${
                theme === "feminine" ? "bg-pink-600 hover:bg-pink-700 shadow-pink-500/25" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25"
              }`}
            >
              <Save className="w-5 h-5" />
              <span>Simpan Perubahan</span>
            </button>
            <button 
              formAction={deleteTransactionAction}
              className={`flex-1 px-5 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm border-2 ${
                theme === "feminine" 
                  ? "bg-white border-pink-200 text-pink-600 hover:bg-pink-50" 
                  : "bg-white border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200"
              }`}
            >
              <Trash2 className="w-5 h-5" />
              <span>Hapus Transaksi</span>
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}
