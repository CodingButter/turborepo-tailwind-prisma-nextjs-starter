import { useState, useEffect } from "react"

/**
 * Custom hook to manage sidebar collapsed state with localStorage persistence
 */
export const useSidebarState = (initialState = false): [boolean, (value: boolean) => void] => {
  // Initialize state from localStorage or default value
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("sidebar-collapsed")
      return stored !== null ? JSON.parse(stored) : initialState
    } catch (error) {
      console.error("Error reading sidebar state from localStorage:", error)
      return initialState
    }
  })

  // Update localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(isCollapsed))
    } catch (error) {
      console.error("Error saving sidebar state to localStorage:", error)
    }
  }, [isCollapsed])

  return [isCollapsed, setIsCollapsed]
}
