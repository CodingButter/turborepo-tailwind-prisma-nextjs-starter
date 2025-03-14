// packages/theme/src/context/ThemeProvider.tsx with fixes

'use client'
import React, { useEffect, ReactNode , useState} from "react"
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
  // Use a regular useState hook to prevent hydration issues
  const [theme, setThemeState] = useStorage<ThemeMode>(defaultTheme)
   const [initialized, setInitialized] = useState(false)

  // Apply the theme CSS classes
  useEffect(() => {
    if (!initialized) {
      setInitialized(true)
    }
    else {
      // Remove previous theme classes
      document.documentElement.classList.remove(...classList.split(" "))
      // Add current theme class
      document.documentElement.classList.add(`theme-${theme}`)
    }
  }, [theme,initialized])

  // Wrap the setTheme function
  const setTheme = (newTheme: ThemeMode) => {
    if (themes.some((t) => t.value === newTheme)) {
      setThemeState(newTheme)
    }
  }

  // Provide the context value
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}