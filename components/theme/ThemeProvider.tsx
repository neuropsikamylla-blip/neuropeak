"use client";

import React, { createContext, useContext } from "react";
import type { Theme } from "@/types";

interface ThemeContextValue {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: "CLINICAL" });

export function useTheme() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  theme: Theme;
  children: React.ReactNode;
}

export function PatientThemeProvider({ theme, children }: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={{ theme }}>
      <div className={getThemeClass(theme)}>{children}</div>
    </ThemeContext.Provider>
  );
}

function getThemeClass(theme: Theme): string {
  switch (theme) {
    case "COLORFUL":
      return "theme-colorful";
    case "GAMIFIED":
      return "theme-gamified";
    default:
      return "theme-clinical";
  }
}

export function getThemeStyles(theme: Theme): Record<string, string> {
  switch (theme) {
    case "COLORFUL":
      return {
        background: "bg-gradient-to-br from-purple-50 to-pink-50",
        card: "bg-white border-2 border-purple-200 rounded-2xl shadow-lg",
        button: "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-lg font-bold",
        title: "text-purple-700 font-bold text-2xl",
        text: "text-purple-900",
        accent: "text-pink-500",
      };
    case "GAMIFIED":
      return {
        background: "bg-gray-950",
        card: "bg-gray-800 border border-cyan-500/30 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.1)]",
        button: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-bold tracking-wide",
        title: "text-cyan-400 font-bold text-2xl tracking-wide",
        text: "text-gray-100",
        accent: "text-cyan-400",
      };
    default:
      return {
        background: "bg-gray-50",
        card: "bg-white border border-gray-200 rounded-lg shadow-sm",
        button: "bg-blue-600 text-white rounded-md font-medium",
        title: "text-gray-900 font-semibold text-xl",
        text: "text-gray-700",
        accent: "text-blue-600",
      };
  }
}
