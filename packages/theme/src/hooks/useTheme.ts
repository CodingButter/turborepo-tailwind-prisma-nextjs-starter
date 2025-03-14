'use client'
import { createContext, useContext } from "react"
export { themes } from "../context/ThemeProvider"
export type ThemeMode = "light" | "dark" | "purple" | "blue" | "green" | "midnight"
export type BaseTheme = "light" | "dark"
/**
 * Theme configuration structure
 */
export interface ThemeConfig {
  name: ThemeMode
  label: string
  baseTheme: BaseTheme
  variables: Record<string, string>
}


/**
 * Color variables available in themes
 */
export interface ThemeColors {
  // Primary colors
  primary: string
  "primary-light": string
  "primary-dark": string

  // Secondary colors
  secondary: string
  "secondary-light": string
  "secondary-dark": string

  // Accent colors
  accent: string
  "accent-light": string
  "accent-dark": string

  // Background colors
  background: string
  "background-secondary": string
  "background-tertiary": string

  // Surface colors
  surface: string
  "surface-hover": string

  // Border colors
  border: string
  "border-light": string

  // Text colors
  text: string
  "text-secondary": string
  "text-tertiary": string

  // Status colors
  success: string
  error: string
  warning: string
  info: string

  // Component-specific colors
  "chat-self": string
  "chat-mention": string
  "chat-system": string
}



/**
 * Theme context value structure
 */
export interface ThemeContextValue {
  theme: ThemeMode | undefined
  setTheme: ((theme: ThemeMode) => void) | undefined
}

// Create context with default values
export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
