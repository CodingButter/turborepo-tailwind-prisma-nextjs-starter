'use client';

import React, { useState, useEffect } from "react";
import { Search, X, Filter } from "lucide-react";

export interface ChatFilters {
  showJoinLeave: boolean;
  showTimestamps: boolean;
  highlightMentions: boolean;
  onlyFromUser: string | null;
}

interface ChatSearchBarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: ChatFilters) => void;
}

const ChatSearchBar: React.FC<ChatSearchBarProps> = ({ onSearch, onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ChatFilters>({
    showJoinLeave: true,
    showTimestamps: true,
    highlightMentions: true,
    onlyFromUser: null,
  });

  // Update search when query changes
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery, onSearch]);

  // Update filters when they change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleClearSearch = () => {
    setSearchQuery("");
    onSearch("");
  };

  const updateFilter = (key: keyof ChatFilters, value: boolean | string | null) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="bg-surface border-b border-border p-2">
      <div className="flex items-center">
        <div className="relative flex-grow">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in chat..."
              className="w-full bg-background-tertiary text-text pl-9 pr-8 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="absolute right-2 flex">
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="text-text-secondary hover:text-text mr-1"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`text-text-secondary hover:text-text ${
                  showFilters ? "text-primary" : ""
                }`}
                aria-label="Show filters"
              >
                <Filter size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="mt-2 p-2 bg-background-tertiary rounded-md">
          <h4 className="text-sm font-semibold text-text-secondary mb-2">Filter Options</h4>
          <div className="space-y-2">
            <label className="flex items-center text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={filters.showJoinLeave}
                onChange={(e) => updateFilter("showJoinLeave", e.target.checked)}
                className="mr-2 rounded bg-background border-border text-primary focus:ring-primary"
              />
              Show join/leave messages
            </label>
            <label className="flex items-center text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={filters.showTimestamps}
                onChange={(e) => updateFilter("showTimestamps", e.target.checked)}
                className="mr-2 rounded bg-background border-border text-primary focus:ring-primary"
              />
              Show timestamps
            </label>
            <label className="flex items-center text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={filters.highlightMentions}
                onChange={(e) => updateFilter("highlightMentions", e.target.checked)}
                className="mr-2 rounded bg-background border-border text-primary focus:ring-primary"
              />
              Highlight mentions
            </label>

            {filters.onlyFromUser && (
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                <span className="text-sm text-text-secondary">
                  Showing messages from:{" "}
                  <span className="text-primary">{filters.onlyFromUser}</span>
                </span>
                <button
                  onClick={() => updateFilter("onlyFromUser", null)}
                  className="px-2 py-1 bg-background text-xs rounded hover:bg-surface-hover"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSearchBar;