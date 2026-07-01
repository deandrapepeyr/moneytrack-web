"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
} from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import api from "@/lib/api";

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function DashboardPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [cashflow, setCashflow] = useState<any[]>([]);
  const [recentTxns, setRecentTxns] = useState<any[]>([]);
  const [greeting, setGreeting] = useState("Selamat pagi");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Selamat pagi");
    else if (hour < 17) setGreeting("Selamat siang");
    else if (hour < 19) setGreeting("Selamat sore");
    else setGreeting("Selamat malam");

    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(user.display_name || "User");
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const cachedSummary = localStorage.getItem("dashboard_summary");
      const cachedCashflow = localStorage.getItem("dashboard_cashflow");
      const cachedRecent = localStorage.getItem("dashboard_recent");

      let hasCache = false;

      if (cachedSummary && cachedCashflow && cachedRecent) {
        try {
          setSummary(JSON.parse(cachedSummary));
          setCashflow(JSON.parse(cachedCashflow));
          setRecentTxns(JSON.parse(cachedRecent));
          hasCache = true;
          setIsLoading(false);
        } catch (e) {}
      }

      if (!hasCache) setIsLoading(true);

      try {
        const [summaryRes, cashflowRes, recentRes] = await Promise.all([
          api.get("dashboard/summary"),
          api.get("dashboard/cashflow"),
          api.get("dashboard/recent", { limit: "5" })
        ]);

        if (summaryRes.success) {
          setSummary(summaryRes.data);
          localStorage.setItem("dashboard_summary", JSON.stringify(summaryRes.data));
        }
        if (cashflowRes.success) {
          const formattedData = cashflowRes.data.map((item: any) => {
            const dateObj = new Date(item.date);
            return {
              ...item,
              displayDate: `${dateObj.getDate()} ${dateObj.toLocaleString('default', { month: 'short' })}`
            };
          });
          setCashflow(formattedData);
          localStorage.setItem("dashboard_cashflow", JSON.stringify(formattedData));
        }
        if (recentRes.success) {
          setRecentTxns(recentRes.data);
          localStorage.setItem("dashboard_recent", JSON.stringify(recentRes.data));
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        if (!hasCache) setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        <div className="h-16 rounded-2xl bg-[#e9e9f2] animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-[92px] rounded-2xl bg-[#e9e9f2] animate-pulse" />
          ))}
        </div>
        <div className="h-[180px] rounded-2xl bg-[#ffffff] animate-pulse border border-[#e9e9f2]" />
        <div className="h-64 rounded-2xl bg-[#ffffff] animate-pulse border border-[#e9e9f2]" />
      </div>
    );
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

  // Only use real data if it has actual non-zero values
  const hasRealCashflow = cashflow.length > 1 && cashflow.some((d: any) => (d.income > 0 || d.outcome > 0));
  const chartData = hasRealCashflow ? cashflow : demoChartData;

  const recentData = recentTxns.length > 0 ? recentTxns : [
    { name: "Gaji bulanan", type: "INCOME", amount: 6200000, category_name: "Income", date: "2026-06-30" },
    { name: "Belanja bulanan", type: "OUTCOME", amount: 850000, category_name: "Groceries", date: "2026-06-28" },
    { name: "Listrik & air", type: "OUTCOME", amount: 420000, category_name: "Utilities", date: "2026-06-25" },
    { name: "Freelance project", type: "INCOME", amount: 1500000, category_name: "Income", date: "2026-06-22" },
    { name: "Makan di luar", type: "OUTCOME", amount: 275000, category_name: "Food", date: "2026-06-20" },
  ];

  return (
    <div className="p-4 md:p-8 lg:p-10 animate-in fade-in duration-500 flex flex-col gap-6">


      {/* Unified Balance Card */}
      <div className={`rounded-[24px] p-6 lg:p-8 text-white relative overflow-hidden shadow-xl shadow-slate-900/10 transition-colors duration-500 ${
        theme === "feminine" ? "bg-fuchsia-900" : "bg-[#0f172a]"
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
                theme === "feminine" ? "bg-pink-500/20" : "bg-emerald-500/10"
              }`}>
                <ArrowDownRight className={`w-5 h-5 ${theme === "feminine" ? "text-pink-400" : "text-emerald-500"}`} />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium mb-0.5 uppercase tracking-wide">Income</p>
                <p className="text-[15px] font-semibold text-white">{formatIDR(income)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                theme === "feminine" ? "bg-fuchsia-400/20" : "bg-rose-500/10"
              }`}>
                <ArrowUpRight className={`w-5 h-5 ${theme === "feminine" ? "text-fuchsia-400" : "text-rose-500"}`} />
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

      {/* Cashflow Panel */}
      <div className="bg-white border border-[#e9e9f2] rounded-[24px] p-5 lg:p-6 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-[16px] font-bold text-[#181825]">Cashflow</h2>
            <p className="text-[12px] text-[#9a9cae] mt-1">Income vs expense</p>
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#6b6d80]">
              <span className={`w-2 h-2 rounded-full ${theme === "feminine" ? "bg-pink-500" : "bg-[#0ecf8f]"}`} />
              Income
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#6b6d80]">
              <span className={`w-2 h-2 rounded-full ${theme === "feminine" ? "bg-fuchsia-600" : "bg-[#ff4d6d]"}`} />
              Expense
            </span>
          </div>
        </div>
        
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eceef5" />
              <XAxis 
                dataKey="displayDate" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9a9cae', fontSize: 11, fontWeight: 500 }}
                dy={8}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #e9e9f2',
                  borderRadius: '10px',
                  color: '#181825',
                  fontSize: '11px',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  padding: '6px 10px',
                }}
                itemStyle={{ color: '#6b6d80', fontWeight: 500 }}
                formatter={(value: any) => formatIDR(Number(value) || 0)}
              />
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke={theme === "feminine" ? "#ec4899" : "#0ecf8f"}
                strokeWidth={2.5}
                fillOpacity={0} 
                fill="transparent" 
                activeDot={{ r: 4, fill: theme === "feminine" ? "#ec4899" : "#0ecf8f" }}
              />
              <Area 
                type="monotone" 
                dataKey="outcome" 
                stroke={theme === "feminine" ? "#c026d3" : "#ff4d6d"}
                strokeWidth={2.5}
                fillOpacity={0} 
                fill="transparent" 
                activeDot={{ r: 4, fill: theme === "feminine" ? "#c026d3" : "#ff4d6d" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaksi Terakhir Panel */}
      <div className="bg-white border border-[#e9e9f2] rounded-[24px] p-5 lg:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[16px] font-bold text-[#181825]">Transaksi Terakhir</h2>
          <button 
            onClick={() => router.push('/transactions')}
            className="text-[12px] text-[#5b4fe0] font-bold hover:bg-[#5b4fe0]/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            Lihat semua →
          </button>
        </div>
        
        <div className="flex flex-col gap-1">
          {recentData.map((txn, idx) => {
            const isIncome = txn.type === 'INCOME';
            const dateObj = new Date(txn.date);
            const dateStr = `${dateObj.getDate()} ${dateObj.toLocaleString('default', { month: 'short' })}`;
            
            return (
              <div 
                key={idx} 
                onClick={() => router.push('/transactions')}
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-sm transition-transform group-hover:scale-105 ${
                  isIncome 
                    ? (theme === "feminine" ? "bg-pink-500 shadow-pink-500/20" : "bg-gradient-to-br from-[#0ecf8f] to-[#08a873]") 
                    : (theme === "feminine" ? "bg-fuchsia-600 shadow-fuchsia-500/20" : "bg-gradient-to-br from-[#ff4d6d] to-[#e11d48]")
                }`}>
                  {isIncome ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-bold text-[#181825] truncate group-hover:text-[#5b4fe0] transition-colors">{txn.name || txn.description}</h4>
                  <p className="text-[12px] text-[#9a9cae] mt-0.5 font-medium">
                    {txn.category_name} · {dateStr}
                  </p>
                </div>
                
                <div className={`text-[14px] font-bold shrink-0 ${
                  isIncome ? 'text-[#08a873]' : 'text-[#e11d48]'
                }`}>
                  {isIncome ? '+' : '-'}{formatIDR(txn.amount)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
