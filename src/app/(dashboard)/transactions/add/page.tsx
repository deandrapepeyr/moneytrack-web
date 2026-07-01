import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { addTransactionAction } from "@/app/actions/transactions";

export default async function AddTransactionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const resolvedParams = await searchParams;
  const cookieStore = await cookies();
  const theme = cookieStore.get("moneytrack_theme")?.value || "masculine";
  
  // Default to today's date in YYYY-MM-DD format
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

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
          }`}>Tambah Transaksi</h1>
          <p className={`text-sm mt-1 ${
            theme === "feminine" ? "text-pink-600/70" : "text-slate-500"
          }`}>Catat pemasukan atau pengeluaran baru</p>
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

        <form action={addTransactionAction} className="space-y-6">
          
          <div className="space-y-2">
            <label className={`text-sm font-semibold ${
              theme === "feminine" ? "text-pink-900" : "text-slate-700"
            }`}>Tipe Transaksi</label>
            <div className="flex gap-4">
              <label className="flex-1">
                <input type="radio" name="type" value="OUTCOME" className="peer sr-only" defaultChecked />
                <div className={`text-center py-3 rounded-xl border-2 cursor-pointer font-bold transition-all peer-checked:shadow-sm ${
                  theme === "feminine"
                    ? "border-pink-100 text-pink-400 hover:bg-pink-50 peer-checked:border-pink-500 peer-checked:bg-pink-50 peer-checked:text-pink-600"
                    : "border-slate-100 text-slate-400 hover:bg-slate-50 peer-checked:border-rose-500 peer-checked:bg-rose-50 peer-checked:text-rose-600"
                }`}>
                  Pengeluaran
                </div>
              </label>
              <label className="flex-1">
                <input type="radio" name="type" value="INCOME" className="peer sr-only" />
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
                placeholder="0"
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
              placeholder="Contoh: Makan siang"
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
              <input 
                type="text" 
                name="category"
                required
                placeholder="Contoh: Makanan"
                className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all ${
                  theme === "feminine" 
                    ? "bg-pink-50/30 border-pink-100 focus:border-pink-400 focus:ring-pink-200/50 text-pink-900 placeholder:text-pink-300" 
                    : "bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 text-slate-900"
                }`}
              />
            </div>

            <div className="space-y-2">
              <label className={`text-sm font-semibold ${
                theme === "feminine" ? "text-pink-900" : "text-slate-700"
              }`}>Tanggal</label>
              <input 
                type="date" 
                name="date"
                required
                defaultValue={todayStr}
                className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all ${
                  theme === "feminine" 
                    ? "bg-pink-50/30 border-pink-100 focus:border-pink-400 focus:ring-pink-200/50 text-pink-900" 
                    : "bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 text-slate-900"
                }`}
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className={`w-full text-white px-5 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm ${
                theme === "feminine" ? "bg-pink-600 hover:bg-pink-700 shadow-pink-500/25" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25"
              }`}
            >
              <Save className="w-5 h-5" />
              <span>Simpan Transaksi</span>
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}
