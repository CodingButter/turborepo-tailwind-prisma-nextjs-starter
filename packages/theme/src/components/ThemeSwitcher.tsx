'use client'
import React, { useState, useEffect } from "react"
import { useTheme, themes } from "../hooks/useTheme"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
    if (pageIndex >= 0 && pageIndex < totalPages) {
      setCurrentPage(pageIndex)
    }
  }

  // Next and previous page functions
  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Reset page when theme changes
  useEffect(() => {
    setCurrentPage(0)
  }, [theme])

  return currentThemeObject && theme && setTheme ? (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-start">
        {/* Current theme button */}
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

          {/* Pagination with navigation and high-contrast dots */}
          {totalPages > 1 && (
            <div className="mt-2 flex justify-center items-center space-x-2">
              {/* Previous button */}
              <button
                onClick={prevPage}
                disabled={currentPage === 0}
                className="text-primary disabled:opacity-30 hover:text-primary-light p-1"
                title="Previous page"
              >
                <ChevronLeft size={14} />
              </button>
              
              {/* Pagination dots with border for contrast */}
              <div className="flex space-x-2">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToPage(index)}
                    className={`w-3 h-3 rounded-full transition-all border ${
                      currentPage === index
                        ? "bg-primary border-primary-light"
                        : "bg-background-tertiary border-primary hover:bg-surface-hover"
                    }`}
                    aria-label={`Go to page ${index + 1}`}
                    title={`Page ${index + 1} of ${totalPages}`}
                  />
                ))}
              </div>
              
              {/* Next button */}
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages - 1}
                className="text-primary disabled:opacity-30 hover:text-primary-light p-1"
                title="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null
}