// packages/theme/src/context/ThemeProvider.tsx

'use client'
import React, { useEffect, ReactNode, useState } from "react"
import { ThemeContext, ThemeMode } from "../hooks/useTheme"
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
  // State for client-side rendering
  const [mounted, setMounted] = useState(false)
  
  // Use storage hook but don't rely on it during SSR
  const [storedTheme, setStoredTheme] = useStorage<ThemeMode>(defaultTheme, "theme-preference")
  
  // State that will only be used after hydration
  const [theme, setThemeState] = useState<ThemeMode>(defaultTheme)
  
  // Effect to handle hydration and initialize from localStorage
  useEffect(() => {
    setMounted(true)
    setThemeState(storedTheme)
  }, [storedTheme])

  // Apply theme CSS classes only on client-side
  useEffect(() => {
    if (mounted) {
      // Remove previous theme classes
      document.documentElement.classList.remove(...classList.split(" "))
      // Add current theme class
      document.documentElement.classList.add(`theme-${theme}`)
    }
  }, [theme, mounted])

  // Wrap the setTheme function
  const setTheme = (newTheme: ThemeMode) => {
    if (themes.some((t) => t.value === newTheme)) {
      setThemeState(newTheme)
      setStoredTheme(newTheme)
    }
  }

  // During SSR or before hydration, render with default theme only
  // This prevents hydration errors by ensuring server and client render the same content initially
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ theme: defaultTheme, setTheme }}>
        {children}
      </ThemeContext.Provider>
    )
  }

  // After hydration, render with the actual theme state
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}