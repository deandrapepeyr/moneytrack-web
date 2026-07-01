import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ArrowRightLeft, Wallet, Sparkles, LogOut, Palette } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { setThemeAction } from "@/app/actions/theme";

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user_data")?.value;
  const theme = cookieStore.get("moneytrack_theme")?.value || "masculine";
  
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

  const userName = user?.display_name || "User";
  const toggleTheme = theme === "masculine" ? "feminine" : "masculine";
  
  return (
    <div className={`min-h-screen w-full flex flex-col md:flex-row transition-colors duration-500 ${
      theme === "feminine" ? "bg-fuchsia-50/50" : "bg-[#f8fafc]"
    }`}>
      {/* Sidebar */}
      <aside className={`w-[272px] hidden md:flex flex-col shrink-0 h-screen sticky top-0 border-r overflow-hidden transition-colors duration-500 ${
        theme === "feminine" ? "bg-pink-950 border-pink-900/50" : "bg-[#0f172a] border-slate-800"
      }`}>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-pink-500 rounded-full blur-[80px]" />
          <div className="absolute bottom-12 -right-12 w-48 h-48 bg-fuchsia-500 rounded-full blur-[60px]" />
        </div>

        <div className="relative z-10 flex flex-col h-full p-5">
          <div className="flex items-center gap-3 px-3 py-5 mb-6">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
              theme === "feminine" ? "bg-pink-500 shadow-pink-500/20" : "bg-blue-600 shadow-blue-600/20"
            }`}>
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">MoneyTrack</span>
              <p className={`text-[10px] font-medium tracking-widest uppercase ${
                theme === "feminine" ? "text-pink-300" : "text-slate-400"
              }`}>Finance App</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    theme === "feminine" 
                      ? "text-pink-200 hover:text-white hover:bg-white/10" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-5 h-5 relative z-10" />
                  <span className="relative z-10 text-sm">{link.name}</span>
                </Link>
              );
            })}
          </nav>
          
          {theme === "feminine" && (
            <div className="mt-auto px-4 py-6 text-center animate-bounce duration-[3000ms]">
              <span className="text-4xl filter drop-shadow-md">🐱✨</span>
            </div>
          )}
        </div>
      </aside>

      {/* Right Side */}
      <div className="flex-1 flex flex-col min-h-screen w-full">
        <header className={`shrink-0 border-b pt-4 pb-3 px-4 md:px-8 z-40 sticky top-0 transition-colors duration-500 ${
          theme === "feminine" ? "bg-pink-950/95 border-pink-900/50 backdrop-blur-md" : "bg-[#0f172a] border-slate-800"
        }`}>
          <div className="flex items-center justify-between relative z-10">
              <div className="flex flex-col min-w-0 pr-2">
                <div className={`flex items-center gap-1.5 text-[12px] md:text-[13px] font-medium mb-0.5 ${
                  theme === "feminine" ? "text-pink-200" : "text-slate-400"
                }`}>
                  <Sparkles className={`w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 ${
                    theme === "feminine" ? "text-pink-400 animate-pulse" : "text-amber-500"
                  }`} />
                  <span className="truncate">Halo! 👋</span>
                </div>
                <h1 className="text-[18px] md:text-[22px] font-bold text-white tracking-tight truncate">{userName}</h1>
              </div>
            <div className="flex items-center gap-3 md:gap-4">
              
              <form action={setThemeAction}>
                <input type="hidden" name="theme" value={toggleTheme} />
                <button 
                  type="submit"
                  className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-sm shrink-0 border transition-all ${
                    theme === "feminine" 
                      ? "bg-pink-900 border-pink-700/50 text-pink-200 hover:bg-pink-500 hover:text-white hover:border-pink-500" 
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  <Palette className="w-4 h-4" />
                </button>
              </form>

              <div className="flex items-center gap-2">
                <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full text-white flex items-center justify-center font-bold text-[13px] md:text-[14px] shadow-sm border ${
                  theme === "feminine" ? "bg-pink-500 border-pink-400" : "bg-indigo-600 border-indigo-500"
                }`}>
                  {userName.charAt(0).toUpperCase()}
                </div>
                
                <form action={async () => {
                  "use server";
                  await logoutAction();
                }}>
                  <button 
                    type="submit"
                    className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-sm shrink-0 border transition-all ${
                      theme === "feminine"
                        ? "bg-pink-900 border-pink-700/50 text-pink-200 hover:bg-rose-500 hover:text-white hover:border-rose-500"
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-rose-600 hover:border-rose-600 hover:text-white"
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </header>

        <div className={`flex-1 pb-[80px] md:pb-0 transition-colors duration-500 ${
          theme === "feminine" ? "bg-fuchsia-50/50" : "bg-[#f8fafc]"
        }`}>
          {children}
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className={`md:hidden fixed bottom-0 left-0 right-0 h-[66px] border-t z-30 pb-safe transition-colors duration-500 ${
          theme === "feminine" ? "bg-white border-pink-100" : "bg-white border-[#e9e9f2]"
        }`}>
          <div className="flex items-center justify-around h-full pb-2">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`flex flex-col items-center justify-center gap-[3px] min-w-[60px] font-normal ${
                    theme === "feminine" ? "text-pink-300" : "text-[#9a9cae]"
                  }`}
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
