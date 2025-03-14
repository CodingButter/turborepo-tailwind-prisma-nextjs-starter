'use client'
import React, { useEffect, ReactNode } from "react"
import { ThemeContext,ThemeMode,ThemeContextValue } from "../hooks/useTheme"
import "@/global.css"
import { Sun, Moon, Palette } from "lucide-react"
import { useStorage } from "@repo/storage"



export const themes: { value: ThemeMode; label: string; icon?: React.ReactNode }[] = [
  { value: "light", label: "Light", icon: <Sun size={16} /> },
  { value: "dark", label: "Dark", icon: <Moon size={16} /> },
  {
    value: "purple",
    label: "Purple",
    icon: <Palette className="text-[var(--icon-purple)]" size={16} />,
  },
  {
    value: "blue",
    label: "Blue",
    icon: <Palette className="text-[var(--icon-blue)]" size={16} />,
  },
  {
    value: "green",
    label: "Green",
    icon: <Palette className="text-[var(--icon-green)]" size={16} />,
  },
  {
    value: "midnight",
    label: "Midnight",
    icon: <Palette className="text-[var(--icon-midnight)]" size={16} />,
  },
]


const classList = themes.map((t) => `theme-${t.value}`).join(" ")
interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: ThemeMode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "dark",
}) => {
  // Get saved theme from localStorage or use default
  const [theme, setTheme] = useStorage<ThemeMode>("theme", defaultTheme)
  // Apply the theme CSS variables
  useEffect(() => {
    // Remove previous theme classes
    document.documentElement.classList.remove(...classList.split(" "))

    // Add current theme class
    document.documentElement.classList.add(`theme-${theme}`)
  }, [theme])


  return <ThemeContext.Provider value={{ theme, setTheme}}>{children}</ThemeContext.Provider>
}
