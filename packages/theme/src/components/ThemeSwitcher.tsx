'use client'
import React, { useState, useEffect } from "react"
import { useTheme,themes } from "../hooks/useTheme"
interface ThemeSwitcherProps {
  className?: string
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className = "" }) => {
  const { theme, setTheme } = useTheme()
  const [currentPage, setCurrentPage] = useState(0)

  // Calculate how many themes per page
  const themesPerPage = 3

  // Find the current theme object
  const currentThemeObject = themes.find((t) => t.value === theme) || themes[0]

  // Filter out the current theme from options
  const filteredThemes = themes.filter((t) => t.value !== theme)
  const totalPages = Math.ceil(filteredThemes.length / themesPerPage)

  // Get current visible themes
  const visibleThemes = filteredThemes.slice(
    currentPage * themesPerPage,
    (currentPage + 1) * themesPerPage
  )

  // Create placeholder empty items to maintain consistent width
  const emptySlots = themesPerPage - visibleThemes.length
  const placeholders = Array(emptySlots).fill(null)

  // Go to a specific page when clicking on a dot
  const goToPage = (pageIndex: number) => {
    if (pageIndex !== currentPage) {
      setCurrentPage(pageIndex)
    }
  }

  // Reset page when theme changes
  useEffect(() => {
    setCurrentPage(0)
  }, [theme])

  return currentThemeObject && theme && setTheme && (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-start">
        {/* Current theme button - now using items-start instead of items-center */}
        <div className="bg-primary rounded-md p-1 mr-3">
          <div className="flex items-center p-1 text-text">{currentThemeObject.icon}</div>
        </div>

        {/* Divider aligned to the top */}
        <div className="h-8 w-px bg-border mx-1 mt-0.5"></div>

        {/* Theme options container - with its own column layout for centering dots */}
        <div className="flex flex-col items-center ml-3">
          {/* Theme options - fixed width container */}
          <div
            className="flex bg-background-tertiary rounded-md p-1"
            style={{ width: `${themesPerPage * 36}px` }}
          >
            {visibleThemes.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className="flex items-center justify-center p-1.5 rounded hover:bg-background-secondary text-text-secondary transition-colors duration-200 w-8 h-8"
                title={t.label}
              >
                {t.icon}
              </button>
            ))}
            {/* Add placeholders to maintain consistent width */}
            {placeholders.map((_, index) => (
              <div key={`placeholder-${index}`} className="w-8 h-8 p-1.5" />
            ))}
          </div>

          {/* Pagination dots centered under the theme options */}
          {totalPages > 1 && (
            <div className="mt-2 flex justify-center space-x-2">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToPage(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    currentPage === index
                      ? "bg-primary-light scale-110 cursor-default"
                      : "bg-text-tertiary hover:bg-text-secondary cursor-pointer"
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                  title={currentPage === index ? "Current page" : `Go to page ${index + 1}`}
                  disabled={currentPage === index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

