"use client";

import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ChartsWrapper({ chartData }: { chartData: any[] }) {
  const theme = "masculine"; // Hardcode theme for now to avoid ThemeContext dependency

  return (
    <div className="bg-white border border-[#e9e9f2] rounded-[24px] p-5 lg:p-6 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-[16px] font-bold text-[#181825]">Cashflow</h2>
          <p className="text-[12px] text-[#9a9cae] mt-1">Income vs expense</p>
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#6b6d80]">
            <span className="w-2 h-2 rounded-full bg-[#0ecf8f]" />
            Income
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#6b6d80]">
            <span className="w-2 h-2 rounded-full bg-[#ff4d6d]" />
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
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
              itemStyle={{ fontSize: 13, fontWeight: 600 }}
              labelStyle={{ color: '#9a9cae', fontSize: 11, marginBottom: 4 }}
              formatter={(value: any) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value)}
            />
            <Area 
              type="monotone" 
              dataKey="income" 
              stroke="#0ecf8f" 
              strokeWidth={3}
              fill="url(#colorIncomeMasc)" 
              fillOpacity={1}
            />
            <Area 
              type="monotone" 
              dataKey="outcome" 
              stroke="#ff4d6d" 
              strokeWidth={3}
              fill="url(#colorOutcomeMasc)" 
              fillOpacity={1}
            />
            <defs>
              <linearGradient id="colorIncomeMasc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ecf8f" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#0ecf8f" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorOutcomeMasc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff4d6d" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#ff4d6d" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
