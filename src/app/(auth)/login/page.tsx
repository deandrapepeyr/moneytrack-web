"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Wallet, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("auth/pin", {
        email,
        pin
      });

      if (response.success) {
        localStorage.setItem("auth_token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await api.post("auth/register", {
        email,
        pin,
        display_name: email.split("@")[0]
      });

      if (response.success) {
        // Auto login after register
        await handleLogin(e);
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Email might already exist.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 relative">
      {/* Background decorations - Apple inspired blur orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl shadow-indigo-500/10 border border-zinc-200/50 dark:border-zinc-800/50 mb-2 transition-transform hover:scale-105 duration-300">
            <Wallet className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">MoneyTrack</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Master your personal finances intuitively</p>
        </div>

        <Card className="glass-card border-zinc-200/50 dark:border-zinc-800/50 shadow-xl overflow-hidden">
          <div className="w-full">
            <CardHeader className="pb-3 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800/50">
              <div className="grid w-full grid-cols-2 bg-zinc-200/50 dark:bg-zinc-800/50 p-1 rounded-lg">
                <button 
                  type="button"
                  onClick={() => setActiveTab("login")} 
                  className={`py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "login" ? "bg-white dark:bg-zinc-950 shadow-sm text-zinc-900 dark:text-zinc-50" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
                >
                  Sign In
                </button>
                <button 
                  type="button"
                  onClick={() => setActiveTab("register")} 
                  className={`py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "register" ? "bg-white dark:bg-zinc-950 shadow-sm text-zinc-900 dark:text-zinc-50" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
                >
                  Register
                </button>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50/80 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-900/50 animate-in fade-in">
                  {error}
                </div>
              )}
              
              {activeTab === "login" && (
                <div className="mt-0 space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative group z-50">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-9 bg-white/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500 relative z-50"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pin">Secure PIN</Label>
                      <span className="text-[10px] text-zinc-400">6 DIGITS</span>
                    </div>
                    <div className="relative group z-50">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                      <Input
                        id="pin"
                        type="password"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="••••••"
                        className="pl-9 tracking-[0.3em] font-mono bg-white/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500 relative z-50"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 group transition-all" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <>
                        Sign in <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
                </div>
              )}
              
              {activeTab === "register" && (
                <div className="mt-0 space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email address</Label>
                    <div className="relative group z-50">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-9 bg-white/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500 relative z-50"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="reg-pin">Create PIN</Label>
                      <span className="text-[10px] text-zinc-400">6 DIGITS ONLY</span>
                    </div>
                    <div className="relative group z-50">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                      <Input
                        id="reg-pin"
                        type="password"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="••••••"
                        className="pl-9 tracking-[0.3em] font-mono bg-white/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500 relative z-50"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-white shadow-md group transition-all" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <>
                        Create Account <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 pt-2 pb-6 px-6">
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-zinc-50/0 px-2 text-zinc-400 backdrop-blur-sm rounded-full">Or continue with</span>
                </div>
              </div>
              <Button variant="outline" className="w-full bg-white/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900" type="button" onClick={() => alert("Google Login OAuth requires Apps Script UI redirect, which is complex for a headless API. Please use PIN login for now.")}>
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>
            </CardFooter>
          </div>
        </Card>
      </div>
    </div>
  );
}
