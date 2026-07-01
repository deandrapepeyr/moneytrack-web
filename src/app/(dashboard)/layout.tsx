"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ArrowRightLeft, PiggyBank, BarChart3, Settings, LogOut, Wallet, ChevronRight, Sparkles, CalendarDays, Palette, Cat, Heart } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
  // Fitur lain sementara di-disable sesuai permintaan
  // { name: "Budgets", href: "/budgets", icon: Wallet },
  // { name: "Savings", href: "/savings", icon: PiggyBank },
  // { name: "Analytics", href: "/analytics", icon: BarChart3 },
  // { name: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Profile Edit State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
    setIsLoading(false);
    
    // Listen for custom event if needed
    const handleUserUpdate = () => {
      const updatedData = localStorage.getItem("user");
      if (updatedData) setUser(JSON.parse(updatedData));
    };
    window.addEventListener("user_updated", handleUserUpdate);
    return () => window.removeEventListener("user_updated", handleUserUpdate);
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    
    setIsSavingProfile(true);
    try {
      // Import api locally since it's not at the top, or we can just import it at top
      const { default: api } = await import("@/lib/api");
      const res = await api.post("auth/update_profile", { display_name: editName });
      
      if (res.success) {
        // Update local storage
        const updatedUser = { ...user, display_name: editName };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setShowProfileModal(false);
        // Dispatch event for other components like dashboard
        window.dispatchEvent(new Event("user_updated"));
      }
    } catch (err) {
      alert("Gagal mengupdate profile: " + (err as Error).message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
          <div className="h-12 w-12 rounded-full border-4 border-transparent border-b-purple-400 animate-spin absolute top-0 left-0" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
      </div>
    );
  }

  const dateStr = currentTime.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const userName = user?.display_name || "User";
  
  const currentHour = currentTime.getHours();
  
  let timeGreeting = "Selamat malam";
  let friendlyQuestion = "Udah cek ringkasan pengeluaran hari ini?";
  
  if (currentHour >= 4 && currentHour < 11) {
    timeGreeting = "Selamat pagi";
    friendlyQuestion = "Gimana rencana keuangan kamu hari ini?";
  } else if (currentHour >= 11 && currentHour < 15) {
    timeGreeting = "Selamat siang";
    friendlyQuestion = "Gimana dengan kondisi cashflow kamu hari ini?";
  } else if (currentHour >= 15 && currentHour < 18) {
    timeGreeting = "Selamat sore";
    friendlyQuestion = "Ada pengeluaran tambahan sore ini?";
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col md:flex-row bg-[#f8fafc]">
      {/* Sidebar — Desktop Only, Fixed */}
      <aside className={`w-[272px] hidden md:flex flex-col shrink-0 h-screen relative transition-colors duration-500 border-r overflow-hidden ${
        theme === "feminine" ? "bg-fuchsia-900 border-fuchsia-800" : "bg-[#0f172a] border-slate-800"
      }`}>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5 z-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        
        {/* Scattered Cute Cats (Feminine Mode Only) */}
        <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${
          theme === "feminine" ? "opacity-100" : "opacity-0"
        }`}>
          {/* Sidebar Cats */}
          <div className="absolute top-12 right-6 opacity-30 animate-pulse" style={{ animationDuration: '4s' }}>
            <Cat className="w-5 h-5 text-pink-300" />
            <Sparkles className="w-2 h-2 text-yellow-200 absolute -top-1 -right-1" />
          </div>
          <div className="absolute top-[20%] left-8 opacity-20 animate-bounce" style={{ animationDuration: '7s' }}>
            <Cat className="w-4 h-4 text-fuchsia-300" />
          </div>
          <div className="absolute top-[30%] left-4 opacity-20 animate-bounce" style={{ animationDuration: '6s' }}>
            <Cat className="w-4 h-4 text-rose-300" />
          </div>
          <div className="absolute top-[40%] right-5 opacity-15 animate-pulse" style={{ animationDuration: '5s' }}>
            <Cat className="w-7 h-7 text-pink-400" />
          </div>
          <div className="absolute top-[55%] right-8 opacity-25 animate-pulse" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>
            <Cat className="w-6 h-6 text-fuchsia-300" />
            <Heart className="w-2 h-2 text-pink-400 absolute -top-1 -left-1" />
          </div>
          <div className="absolute top-[70%] left-5 opacity-20 animate-bounce" style={{ animationDuration: '8s' }}>
            <Cat className="w-5 h-5 text-rose-200" />
          </div>
          <div className="absolute bottom-[20%] left-6 opacity-30 animate-bounce" style={{ animationDuration: '5s', animationDelay: '2s' }}>
            <Cat className="w-5 h-5 text-pink-200" />
          </div>
        </div>

        <div className="relative z-10 flex flex-col h-full p-5">
          {/* Logo */}
          <div className="flex items-center gap-3 px-3 py-5 mb-6">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
              theme === "feminine" ? "bg-pink-500" : "bg-blue-600"
            }`}>
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">MoneyTrack</span>
              <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Finance App</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              const Icon = link.icon;
              
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative ${
                    isActive 
                      ? "text-white bg-white/10 font-semibold" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full ${
                      theme === "feminine" ? "bg-pink-400" : "bg-blue-500"
                    }`} />
                  )}
                  <Icon className={`w-5 h-5 relative z-10 transition-transform duration-300 ${
                    isActive ? (theme === "feminine" ? "text-pink-300" : "text-blue-400") : "group-hover:scale-110"
                  }`} />
                  <span className="relative z-10 text-sm">{link.name}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto relative z-10 text-slate-400" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="mt-auto space-y-3 relative z-30">
            <div 
              onClick={() => {
                setEditName(user?.display_name || "");
                setShowProfileModal(true);
              }}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm relative z-30 cursor-pointer hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 border ${
                  theme === "feminine" ? "bg-fuchsia-800 text-pink-100 border-fuchsia-700" : "bg-slate-800 text-slate-200 border-slate-700"
                }`}>
                  {user?.display_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user?.display_name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-300 text-sm font-medium group"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Right Side = Header + Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header Bar — FIXED, never scrolls */}
        <header className={`shrink-0 border-b pt-4 pb-3 px-4 md:px-8 z-40 transition-colors duration-500 relative overflow-hidden ${
          theme === "feminine" ? "bg-fuchsia-900 border-fuchsia-800" : "bg-[#0f172a] border-slate-800"
        }`}>
          {/* Header Cats Background */}
          <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${
            theme === "feminine" ? "opacity-100" : "opacity-0"
          }`}>
            <div className="absolute top-4 left-[30%] opacity-20 animate-pulse" style={{ animationDuration: '4s' }}>
              <Cat className="w-8 h-8 text-pink-300" />
            </div>
            <div className="absolute -bottom-2 left-[50%] opacity-15 animate-bounce" style={{ animationDuration: '5s' }}>
              <Cat className="w-12 h-12 text-fuchsia-300" />
            </div>
            <div className="absolute top-2 right-[35%] opacity-25 animate-pulse" style={{ animationDuration: '6s' }}>
              <Cat className="w-6 h-6 text-rose-300" />
              <Heart className="w-3 h-3 text-pink-400 absolute -top-1 -right-2" />
            </div>
          </div>

          <div className="flex items-center justify-between relative z-10">
              <div className="flex flex-col min-w-0 pr-2">
                <div className="flex items-center gap-1.5 text-[12px] md:text-[13px] text-slate-400 font-medium mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                  <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500 shrink-0" />
                  <span className="truncate">{timeGreeting} 👋<span className="hidden md:inline">, {friendlyQuestion}</span></span>
                </div>
                <h1 className="text-[18px] md:text-[22px] font-bold text-white tracking-tight truncate">{userName}</h1>
              </div>
            <div className="flex items-center gap-3 md:gap-4">
              <button 
                onClick={toggleTheme}
                className={`p-2 md:p-2.5 rounded-full border transition-all ${
                  theme === "feminine" ? "bg-fuchsia-800 border-fuchsia-700 text-pink-200 hover:bg-fuchsia-700" : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                }`}
                title="Change Theme"
              >
                <Palette className="w-4 h-4 md:w-4.5 md:h-4.5" />
              </button>
              
              <div className={`hidden md:flex items-center gap-2 border rounded-xl md:rounded-full px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-[12px] ${
                theme === "feminine" ? "bg-fuchsia-800 border-fuchsia-700 text-pink-100" : "bg-slate-800 border-slate-700 text-slate-200"
              }`}>
                <CalendarDays className={`w-3.5 h-3.5 hidden md:block ${theme === "feminine" ? "text-pink-300" : "text-slate-400"}`} />
                <div className="flex flex-col md:flex-row md:items-center md:gap-1.5 text-right md:text-left">
                  <span className="font-semibold">{dateStr}</span>
                  <span className={`hidden md:inline ${theme === "feminine" ? "text-fuchsia-500" : "text-slate-600"}`}>•</span>
                  <span className={`font-mono tracking-wider ${theme === "feminine" ? "text-pink-200" : "text-slate-400"}`}>{timeStr}</span>
                </div>
              </div>
              
              <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full text-white flex items-center justify-center font-bold text-[13px] md:text-[14px] shadow-sm shrink-0 border ${
                theme === "feminine" ? "bg-pink-500 border-pink-400" : "bg-blue-600 border-blue-500"
              }`}>
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area — ONLY this part scrolls */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#f8fafc] pb-[80px] md:pb-0 overscroll-none">
          {children}
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[66px] bg-white border-t border-[#e9e9f2] z-30 pb-safe">
          <div className="flex items-center justify-around h-full pb-2">
            {sidebarLinks.slice(0, 5).map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              const Icon = link.icon;
              
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`flex flex-col items-center justify-center gap-[3px] min-w-[60px] ${
                    isActive 
                      ? "text-[#5b4fe0] font-bold" 
                      : "text-[#9a9cae] font-normal"
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[9.5px]">{link.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowProfileModal(false)} />
          <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Edit Profil</h2>
            <p className="text-sm text-slate-500 mb-6">Ubah nama sapaan yang akan ditampilkan di aplikasi.</p>
            
            <form onSubmit={handleUpdateProfile}>
              <div className="space-y-2 mb-6">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Nama Sapaan
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Masukkan nama..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all shadow-lg ${
                    theme === "feminine" ? "bg-fuchsia-600 shadow-fuchsia-500/25 hover:bg-fuchsia-700" : "bg-indigo-600 shadow-indigo-500/25 hover:bg-indigo-700"
                  } disabled:opacity-50`}
                >
                  {isSavingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
