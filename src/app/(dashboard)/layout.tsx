import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ArrowRightLeft, Wallet, Sparkles, LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const userCookie = cookieStore.get("user_data")?.value;
  
  if (!userCookie) {
    redirect("/login");
  }

  let user = null;
  try {
    user = JSON.parse(decodeURIComponent(userCookie));
  } catch (e) {
    redirect("/login");
  }

  const userName = user?.display_name || "User";
  
  // Create a basic server-side layout without JS dependencies
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col md:flex-row bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-[272px] hidden md:flex flex-col shrink-0 h-screen relative border-r overflow-hidden bg-[#0f172a] border-slate-800">
        <div className="relative z-10 flex flex-col h-full p-5">
          <div className="flex items-center gap-3 px-3 py-5 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-blue-600">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">MoneyTrack</span>
              <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Finance App</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/5"
                >
                  <Icon className="w-5 h-5 relative z-10" />
                  <span className="relative z-10 text-sm">{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Right Side */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="shrink-0 border-b pt-4 pb-3 px-4 md:px-8 z-40 relative overflow-hidden bg-[#0f172a] border-slate-800">
          <div className="flex items-center justify-between relative z-10">
              <div className="flex flex-col min-w-0 pr-2">
                <div className="flex items-center gap-1.5 text-[12px] md:text-[13px] text-slate-400 font-medium mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500 shrink-0" />
                  <span className="truncate">Halo! 👋</span>
                </div>
                <h1 className="text-[18px] md:text-[22px] font-bold text-white tracking-tight truncate">{userName}</h1>
              </div>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full text-white flex items-center justify-center font-bold text-[13px] md:text-[14px] shadow-sm bg-indigo-600 border border-indigo-500">
                  {userName.charAt(0).toUpperCase()}
                </div>
                
                <form action={logoutAction}>
                  <button 
                    type="submit"
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-sm shrink-0 border bg-slate-800 border-slate-700 text-slate-300 hover:bg-rose-600 hover:border-rose-600 hover:text-white"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#f8fafc] pb-[80px] md:pb-0 overscroll-none">
          {children}
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[66px] bg-white border-t border-[#e9e9f2] z-30 pb-safe">
          <div className="flex items-center justify-around h-full pb-2">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="flex flex-col items-center justify-center gap-[3px] min-w-[60px] text-[#9a9cae] font-normal"
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                  <span className="text-[9.5px]">{link.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
