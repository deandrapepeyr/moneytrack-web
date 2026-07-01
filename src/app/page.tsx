"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-8 w-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
        <p className="text-sm text-zinc-500">Loading MoneyTrack...</p>
      </div>
    </div>
  );
}
