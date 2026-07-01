import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  CalendarDays,
  ArrowRightLeft
} from "lucide-react";

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default async function TransactionsPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user_data")?.value;
  
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

  // Group by date
  const groupedTransactions = transactions.reduce((groups: any, txn: any) => {
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
    <div className="p-4 md:p-8 lg:p-10 flex flex-col h-full bg-[#f8fafc]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Transactions</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola dan pantau semua transaksi kamu</p>
        </div>
        
        <Link 
          href="/transactions/add"
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm w-full md:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Transaksi</span>
        </Link>
      </div>

      {/* Transaction List */}
      <div className="flex-1 bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {groupArray.length > 0 ? (
            <div className="space-y-8">
              {groupArray.map((group: any, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-indigo-500" />
                      {new Date(group.date).toLocaleDateString("id-ID", { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long',
                        year: 'numeric'
                      })}
                    </h3>
                    <div className="flex items-center gap-3 text-xs font-semibold">
                      {group.totalIncome > 0 && (
                        <span className="text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">
                          +{formatIDR(group.totalIncome)}
                        </span>
                      )}
                      {group.totalOutcome > 0 && (
                        <span className="text-rose-500 bg-rose-50 px-2 py-1 rounded-md">
                          -{formatIDR(group.totalOutcome)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {group.items.map((txn: any) => {
                      const isIncome = txn.type === "INCOME";
                      
                      return (
                        <div key={txn.id || txn.name} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                              isIncome ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
                            }`}>
                              {isIncome ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                            </div>
                            <div>
                              <h4 className="text-[14px] font-bold text-slate-900 mb-1">{txn.name || txn.description}</h4>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                  {txn.category_name}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className={`text-[15px] font-bold ${isIncome ? "text-emerald-500" : "text-slate-900"}`}>
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
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <ArrowRightLeft className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Belum Ada Transaksi</h3>
              <p className="text-slate-500 text-sm max-w-[250px]">
                Mulai catat pemasukan dan pengeluaran kamu dengan menekan tombol Tambah Transaksi.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
