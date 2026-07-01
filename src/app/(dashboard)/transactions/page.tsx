import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  CalendarDays,
  ArrowRightLeft,
  Search
} from "lucide-react";

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { search?: string; type?: string; month?: string; year?: string }
}) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user_data")?.value;
  const theme = cookieStore.get("moneytrack_theme")?.value || "masculine";
  
  if (!userCookie) redirect("/login");
  
  let user = null;
  try {
    user = JSON.parse(decodeURIComponent(userCookie));
  } catch (e) {
    redirect("/login");
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://script.google.com/macros/s/AKfycbxcBwrRwiv3dRFvD_zB9O1Ru-jGF4rJorSge7ptYuI3rnbANtKSEkFrGr-2vE0KhyrM/exec';
  
  let transactions = [];

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "dashboard/recent", user_id: user.id, limit: 100 }),
      cache: 'no-store'
    });
    const result = await res.json();
    if (result.success) {
      transactions = result.data;
    }
  } catch (err) {
    console.error("Error fetching data:", err);
  }

  const query = searchParams.search?.toLowerCase() || "";
  const typeFilter = searchParams.type || "ALL";

  const filteredTransactions = transactions.filter((txn: any) => {
    if (typeFilter !== "ALL" && txn.type !== typeFilter) return false;
    
    if (query) {
      const name = (txn.name || txn.description || "").toLowerCase();
      const cat = (txn.category_name || "").toLowerCase();
      if (!name.includes(query) && !cat.includes(query)) return false;
    }

    return true;
  });

  // Group by date
  const groupedTransactions = filteredTransactions.reduce((groups: any, txn: any) => {
    const date = txn.date;
    if (!groups[date]) {
      groups[date] = {
        date,
        totalIncome: 0,
        totalOutcome: 0,
        items: []
      };
    }
    
    if (txn.type === "INCOME") {
      groups[date].totalIncome += txn.amount;
    } else {
      groups[date].totalOutcome += txn.amount;
    }
    
    groups[date].items.push(txn);
    return groups;
  }, {});

  const groupArray = Object.values(groupedTransactions).sort((a: any, b: any) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className={`p-4 md:p-8 lg:p-10 flex flex-col min-h-screen transition-colors duration-500 ${
      theme === "feminine" ? "bg-fuchsia-50/50" : "bg-[#f8fafc]"
    }`}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${
            theme === "feminine" ? "text-pink-950" : "text-[#0f172a]"
          }`}>Transactions</h1>
          <p className={`text-sm mt-1 ${
            theme === "feminine" ? "text-pink-600/70" : "text-slate-500"
          }`}>Kelola dan pantau semua transaksi kamu</p>
        </div>
        
        <Link 
          href="/transactions/add"
          className={`text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm w-full md:w-auto justify-center ${
            theme === "feminine" ? "bg-pink-600 hover:bg-pink-700" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Transaksi</span>
        </Link>
      </div>

      {/* Controls Container */}
      <div className={`rounded-2xl p-2 mb-6 border ${
        theme === "feminine" ? "bg-white/80 border-pink-100 backdrop-blur-sm" : "bg-white border-slate-200"
      }`}>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          
          <form method="GET" action="/transactions" className="relative w-full sm:w-auto flex-1">
            <input type="hidden" name="type" value={typeFilter} />
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              theme === "feminine" ? "text-pink-400" : "text-slate-400"
            }`} />
            <input 
              type="text" 
              name="search"
              defaultValue={query}
              placeholder="Cari transaksi..." 
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all ${
                theme === "feminine" 
                  ? "bg-pink-50/30 border-pink-100 focus:border-pink-300 focus:ring-pink-200/50 text-pink-900 placeholder:text-pink-300" 
                  : "bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 text-slate-900"
              }`}
            />
          </form>

          <div className={`flex w-full sm:w-auto p-1 rounded-xl ${
            theme === "feminine" ? "bg-pink-100/50" : "bg-slate-100"
          }`}>
            {(["ALL", "INCOME", "OUTCOME"] as const).map((t) => (
              <Link
                key={t}
                href={`/transactions?type=${t}${query ? `&search=${query}` : ""}`}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[13px] font-bold transition-all text-center ${
                  typeFilter === t
                    ? (theme === "feminine" ? "bg-white text-pink-600 shadow-sm" : "bg-white text-indigo-600 shadow-sm")
                    : (theme === "feminine" ? "text-pink-400 hover:text-pink-600" : "text-slate-500 hover:text-slate-700")
                }`}
              >
                {t === "ALL" ? "Semua" : t === "INCOME" ? "Pemasukan" : "Pengeluaran"}
              </Link>
            ))}
          </div>

        </div>
      </div>

      {/* Transaction List */}
      <div className={`flex-1 rounded-[24px] border shadow-sm overflow-hidden flex flex-col ${
        theme === "feminine" ? "bg-white/80 border-pink-100 backdrop-blur-sm" : "bg-white border-slate-200"
      }`}>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {groupArray.length > 0 ? (
            <div className="space-y-8">
              {groupArray.map((group: any, idx) => (
                <div key={idx} className="space-y-3">
                  <div className={`flex items-center justify-between px-2 pb-2 border-b ${
                    theme === "feminine" ? "border-pink-100" : "border-slate-100"
                  }`}>
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${
                      theme === "feminine" ? "text-pink-900" : "text-slate-800"
                    }`}>
                      <CalendarDays className={`w-4 h-4 ${theme === "feminine" ? "text-pink-500" : "text-indigo-500"}`} />
                      {new Date(group.date).toLocaleDateString("id-ID", { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long',
                        year: 'numeric'
                      })}
                    </h3>
                    <div className="flex items-center gap-3 text-xs font-semibold">
                      {group.totalIncome > 0 && (
                        <span className={`px-2 py-1 rounded-md ${
                          theme === "feminine" ? "text-fuchsia-600 bg-fuchsia-50" : "text-emerald-500 bg-emerald-50"
                        }`}>
                          +{formatIDR(group.totalIncome)}
                        </span>
                      )}
                      {group.totalOutcome > 0 && (
                        <span className={`px-2 py-1 rounded-md ${
                          theme === "feminine" ? "text-pink-600 bg-pink-50" : "text-rose-500 bg-rose-50"
                        }`}>
                          -{formatIDR(group.totalOutcome)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {group.items.map((txn: any) => {
                      const isIncome = txn.type === "INCOME";
                      
                      return (
                        <div key={txn.id || txn.name} className={`flex items-center justify-between p-3 rounded-2xl transition-colors group border border-transparent ${
                          theme === "feminine" ? "hover:bg-pink-50/50 hover:border-pink-100" : "hover:bg-slate-50 hover:border-slate-100"
                        }`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                              isIncome 
                                ? (theme === "feminine" ? "bg-fuchsia-100 text-fuchsia-500" : "bg-emerald-50 text-emerald-500")
                                : (theme === "feminine" ? "bg-pink-100 text-pink-500" : "bg-rose-50 text-rose-500")
                            }`}>
                              {isIncome ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                            </div>
                            <div>
                              <h4 className={`text-[14px] font-bold mb-1 ${
                                theme === "feminine" ? "text-pink-950" : "text-slate-900"
                              }`}>{txn.name || txn.description}</h4>
                              <div className="flex items-center gap-2">
                                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                                  theme === "feminine" ? "bg-pink-50 text-pink-600" : "bg-slate-100 text-slate-600"
                                }`}>
                                  {txn.category_name}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className={`text-[15px] font-bold ${
                              isIncome 
                                ? (theme === "feminine" ? "text-fuchsia-500" : "text-emerald-500")
                                : (theme === "feminine" ? "text-pink-900" : "text-slate-900")
                            }`}>
                              {isIncome ? "+" : "-"}{formatIDR(txn.amount)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                theme === "feminine" ? "bg-pink-50" : "bg-slate-50"
              }`}>
                <ArrowRightLeft className={`w-8 h-8 ${theme === "feminine" ? "text-pink-300" : "text-slate-400"}`} />
              </div>
              <h3 className={`text-lg font-bold mb-1 ${
                theme === "feminine" ? "text-pink-900" : "text-slate-900"
              }`}>Belum Ada Transaksi</h3>
              <p className={`text-sm max-w-[250px] ${
                theme === "feminine" ? "text-pink-500/70" : "text-slate-500"
              }`}>
                Mulai catat pemasukan dan pengeluaran kamu dengan menekan tombol Tambah Transaksi.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
