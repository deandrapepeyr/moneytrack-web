import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { Wallet, ArrowUpRight, ArrowDownRight, PiggyBank, CalendarDays, ArrowRightLeft } from "lucide-react";

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
  const theme = cookieStore.get("moneytrack_theme")?.value || "masculine";
  
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

  // Fetch data directly on the server
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://script.google.com/macros/s/AKfycbxcBwrRwiv3dRFvD_zB9O1Ru-jGF4rJorSge7ptYuI3rnbANtKSEkFrGr-2vE0KhyrM/exec';
  
  // Wrap the fetch in unstable_cache to memorize the response on Vercel
  const getDashboardData = unstable_cache(
    async (userId: string) => {
      try {
        const fetchApi = async (action: string, extraData = {}) => {
          const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, user_id: userId, ...extraData }),
          });
          return res.json();
        };

        const [summaryRes, cashflowRes, recentRes] = await Promise.all([
          fetchApi("dashboard/summary"),
          fetchApi("dashboard/cashflow"),
          fetchApi("dashboard/recent", { limit: "5" })
        ]);

        return { summaryRes, cashflowRes, recentRes };
      } catch (err) {
        console.error("Error fetching data:", err);
        return { summaryRes: {}, cashflowRes: {}, recentRes: {} };
      }
    },
    ['dashboard-data'],
    { tags: ['dashboard', `user-${user.user_id}`], revalidate: 3600 }
  );

  let summary = null;
  let cashflow = [];
  let recentTxns = [];

  const { summaryRes, cashflowRes, recentRes } = await getDashboardData(user.user_id);

  if (summaryRes?.success) summary = summaryRes.data;
  if (cashflowRes?.success) {
    cashflow = cashflowRes.data.map((item: any) => {
      const dateObj = new Date(item.date);
      return {
        ...item,
        displayDate: `${dateObj.getDate()} ${dateObj.toLocaleString('default', { month: 'short' })}`
      };
    });
  }
  if (recentRes?.success) recentTxns = recentRes.data;

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
      <div className={`rounded-[24px] p-6 lg:p-8 text-white relative overflow-hidden shadow-xl transition-colors duration-500 ${
        theme === "feminine" 
          ? "bg-pink-500 shadow-pink-500/20" 
          : "bg-[#0f172a] shadow-slate-900/10"
      }`}>
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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                theme === "feminine" ? "bg-white/20 text-white" : "bg-emerald-500/10 text-emerald-500"
              }`}>
                <ArrowDownRight className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-[11px] font-medium mb-0.5 uppercase tracking-wide ${
                  theme === "feminine" ? "text-pink-100" : "text-slate-400"
                }`}>Income</p>
                <p className="text-[15px] font-semibold text-white">{formatIDR(income)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                theme === "feminine" ? "bg-white/20 text-white" : "bg-rose-500/10 text-rose-500"
              }`}>
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-[11px] font-medium mb-0.5 uppercase tracking-wide ${
                  theme === "feminine" ? "text-pink-100" : "text-slate-400"
                }`}>Expense</p>
                <p className="text-[15px] font-semibold text-white">{formatIDR(expense)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                theme === "feminine" ? "bg-white/20 text-white" : "bg-blue-500/10 text-blue-500"
              }`}>
                <PiggyBank className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-[11px] font-medium mb-0.5 uppercase tracking-wide ${
                  theme === "feminine" ? "text-pink-100" : "text-slate-400"
                }`}>Sisa Budget</p>
                <p className="text-[15px] font-semibold text-white">{formatIDR(remainingBudget)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                <div key={idx} className={`flex items-center justify-between p-3 rounded-2xl transition-colors group border border-transparent ${
                  theme === "feminine" ? "hover:bg-pink-50 hover:border-pink-100" : "hover:bg-[#f8fafc] hover:border-[#e9e9f2]"
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                      isIncome 
                        ? (theme === "feminine" ? "bg-fuchsia-100 text-fuchsia-500" : "bg-[#e8fbf4] text-[#0ecf8f]")
                        : (theme === "feminine" ? "bg-pink-100 text-pink-500" : "bg-[#fff0f2] text-[#ff4d6d]")
                    }`}>
                      {isIncome ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className={`text-[14px] font-bold mb-1 ${theme === "feminine" ? "text-pink-900" : "text-[#181825]"}`}>{txn.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                          theme === "feminine" ? "bg-pink-50 text-pink-600" : "bg-[#f1f1f5] text-[#6b6d80]"
                        }`}>
                          {txn.category_name}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-[15px] font-bold mb-1 ${
                      isIncome 
                        ? (theme === "feminine" ? "text-fuchsia-500" : "text-[#0ecf8f]") 
                        : (theme === "feminine" ? "text-pink-900" : "text-[#181825]")
                    }`}>
                      {isIncome ? "+" : "-"}{formatIDR(txn.amount)}
                    </p>
                    <p className={`text-[11px] font-medium flex items-center justify-end gap-1 ${
                      theme === "feminine" ? "text-pink-400" : "text-[#9a9cae]"
                    }`}>
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
