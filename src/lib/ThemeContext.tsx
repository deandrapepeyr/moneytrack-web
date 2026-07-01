"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeType = "masculine" | "feminine";

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>("masculine");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const savedTheme = localStorage.getItem("moneytrack_theme") as ThemeType;
      if (savedTheme === "masculine" || savedTheme === "feminine") {
        setThemeState(savedTheme);
      }
    } catch (e) {
      console.warn("localStorage is blocked");
    }
  }, []);

  const setTheme = (theme: ThemeType) => {
    setThemeState(theme);
    try {
      localStorage.setItem("moneytrack_theme", theme);
    } catch (e) {
      console.warn("localStorage is blocked");
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "masculine" ? "feminine" : "masculine";
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <div 
        className={theme === "feminine" ? "theme-feminine" : "theme-masculine"} 
        style={{ minHeight: "100vh" }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
