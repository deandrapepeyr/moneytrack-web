import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Wallet, ArrowUpRight, ArrowDownRight, PiggyBank, CalendarDays, ArrowRightLeft } from "lucide-react";
import ChartsWrapper from "./ChartsWrapper";

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user_data")?.value;
  
  if (!userCookie) redirect("/login");
  
  let user = null;
  try {
    user = JSON.parse(decodeURIComponent(userCookie));
  } catch (e) {
    redirect("/login");
  }

  // Fetch data directly on the server
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://script.google.com/macros/s/AKfycbxcBwrRwiv3dRFvD_zB9O1Ru-jGF4rJorSge7ptYuI3rnbANtKSEkFrGr-2vE0KhyrM/exec';
  
  let summary = null;
  let cashflow = [];
  let recentTxns = [];

  try {
    const fetchApi = async (action: string, extraData = {}) => {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, user_id: user.id, ...extraData }),
        cache: 'no-store'
      });
      return res.json();
    };

    const [summaryRes, cashflowRes, recentRes] = await Promise.all([
      fetchApi("dashboard/summary"),
      fetchApi("dashboard/cashflow"),
      fetchApi("dashboard/recent", { limit: "5" })
    ]);

    if (summaryRes.success) summary = summaryRes.data;
    if (cashflowRes.success) {
      cashflow = cashflowRes.data.map((item: any) => {
        const dateObj = new Date(item.date);
        return {
          ...item,
          displayDate: `${dateObj.getDate()} ${dateObj.toLocaleString('default', { month: 'short' })}`
        };
      });
    }
    if (recentRes.success) recentTxns = recentRes.data;
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
  }

  const balance = summary?.current_balance || 0;
  const income = summary?.total_income || 0;
  const expense = summary?.total_outcome || 0;
  const totalBudget = summary?.budget_overview?.reduce((sum: number, b: any) => sum + b.remaining, 0) || 0;
  const remainingBudget = totalBudget > 0 ? totalBudget : (income - expense);

  const demoChartData = [
    { displayDate: "1 Jun", income: 800000, outcome: 400000 },
    { displayDate: "5 Jun", income: 1200000, outcome: 600000 },
    { displayDate: "10 Jun", income: 900000, outcome: 700000 },
    { displayDate: "15 Jun", income: 1500000, outcome: 500000 },
    { displayDate: "20 Jun", income: 1100000, outcome: 650000 },
    { displayDate: "25 Jun", income: 1700000, outcome: 800000 },
    { displayDate: "30 Jun", income: 1300000, outcome: 550000 },
  ];

  const hasRealCashflow = cashflow.length > 1 && cashflow.some((d: any) => (d.income > 0 || d.outcome > 0));
  const chartData = hasRealCashflow ? cashflow : demoChartData;

  const recentData = recentTxns.length > 0 ? recentTxns : [
    { name: "Belum ada transaksi", type: "OUTCOME", amount: 0, category_name: "-", date: new Date().toISOString() },
  ];

  return (
    <div className="p-4 md:p-8 lg:p-10 flex flex-col gap-6">

      {/* Unified Balance Card */}
      <div className="rounded-[24px] p-6 lg:p-8 text-white relative overflow-hidden shadow-xl shadow-slate-900/10 bg-[#0f172a]">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Wallet className="w-64 h-64 rotate-12" />
        </div>
        
        <div className="relative z-10">
          <p className="text-[13px] font-medium text-slate-400 mb-2 uppercase tracking-wider">Total Balance</p>
          <h3 className="text-[36px] md:text-[48px] font-bold tracking-tight mb-8">
            {formatIDR(balance)}
          </h3>

          <div className="flex flex-col sm:flex-row gap-6 sm:gap-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-500/10">
                <ArrowDownRight className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium mb-0.5 uppercase tracking-wide">Income</p>
                <p className="text-[15px] font-semibold text-white">{formatIDR(income)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-rose-500/10">
                <ArrowUpRight className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium mb-0.5 uppercase tracking-wide">Expense</p>
                <p className="text-[15px] font-semibold text-white">{formatIDR(expense)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium mb-0.5 uppercase tracking-wide">Sisa Budget</p>
                <p className="text-[15px] font-semibold text-white">{formatIDR(remainingBudget)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChartsWrapper chartData={chartData} />

      {/* Recent Transactions & Budget Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Transactions List */}
        <div className="bg-white border border-[#e9e9f2] rounded-[24px] p-5 lg:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[16px] font-bold text-[#181825]">Recent Transactions</h2>
            <div className="w-8 h-8 rounded-full bg-[#f8fafc] flex items-center justify-center border border-[#e9e9f2]">
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#6b6d80]" />
            </div>
          </div>
          
          <div className="space-y-4">
            {recentData.map((txn: any, idx: number) => {
              const isIncome = txn.type === "INCOME";
              const dateObj = new Date(txn.date);
              
              return (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#f8fafc] transition-colors group border border-transparent hover:border-[#e9e9f2]">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                      isIncome ? "bg-[#e8fbf4] text-[#0ecf8f]" : "bg-[#fff0f2] text-[#ff4d6d]"
                    }`}>
                      {isIncome ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-[#181825] mb-1">{txn.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#f1f1f5] text-[#6b6d80]">
                          {txn.category_name}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-[15px] font-bold mb-1 ${isIncome ? "text-[#0ecf8f]" : "text-[#181825]"}`}>
                      {isIncome ? "+" : "-"}{formatIDR(txn.amount)}
                    </p>
                    <p className="text-[11px] font-medium text-[#9a9cae] flex items-center justify-end gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
