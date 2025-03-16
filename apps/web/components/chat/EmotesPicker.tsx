import React, { useState, useEffect, useRef } from "react"
import { X, Search, AlertCircle, RefreshCw } from "lucide-react"
import { useEmotes } from "@repo/tirc"
import { useStorage } from "@repo/storage"

interface EmotesPickerProps {
  onClose: () => void
  onSelectEmote: (emoteCode: string) => void
  channelName: string | null
}

const EmotesPicker: React.FC<EmotesPickerProps> = ({ onClose, onSelectEmote, channelName }) => {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"twitch" | "bttv" | "ffz" | "recent">("twitch")
  const pickerRef = useRef<HTMLDivElement>(null)
  
  // Use useStorage for recent emotes instead of useState + localStorage
  const [recentEmotes, setRecentEmotes] = useStorage<string[]>([], "recent-emotes")
  
  // Use the useEmotes hook to get emotes data
  const { emotes, isLoading, fetchEmotes, getEmote } = useEmotes()
  
  // Separate emotes by type (based on source or naming pattern)
  const twitchEmotes = emotes.filter(emote => 
    emote.name.startsWith("twitch_") || 
    (emote.id && emote.id.includes("twitch"))
  )
  
  const bttvEmotes = emotes.filter(emote => 
    emote.name.startsWith("bttv_") || 
    (emote.id && emote.id.includes("bttv"))
  )
  
  const ffzEmotes = emotes.filter(emote => 
    emote.name.startsWith("ffz_") || 
    (emote.id && emote.id.includes("ffz"))
  )

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  // Handle emote selection
  const handleEmoteSelect = (e: React.MouseEvent, emoteName: string) => {
    e.preventDefault()
    e.stopPropagation()

    // Call the onSelectEmote prop with the emote code
    onSelectEmote(emoteName)

    // Update recent emotes using useStorage
    if (emoteName.trim()) {
      setRecentEmotes((prev) => {
        // Remove duplicates and add at the beginning, limit to 20 entries
        return [emoteName, ...prev.filter((e) => e !== emoteName)].slice(0, 20)
      })
    }
  }

  // Filter emotes based on search query
  const filteredTwitchEmotes = twitchEmotes.filter((emote) =>
    emote.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredBttvEmotes = bttvEmotes.filter((emote) =>
    emote.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredFfzEmotes = ffzEmotes.filter((emote) =>
    emote.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredRecentEmotes = recentEmotes.filter((emoteName) =>
    emoteName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Refresh emotes
  const refreshEmotes = () => {
    fetchEmotes()
  }

  // Render emote grid
  const renderEmoteGrid = (emoteList: any[], source: string) => {
    if (isLoading) {
      return (
        <div className="py-8 text-center text-text-secondary">
          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          Loading emotes...
        </div>
      )
    }

    if (emoteList.length === 0) {
      return (
        <div className="py-8 text-center text-text-secondary">
          {searchQuery ? "No matching emotes found" : "No emotes available"}
        </div>
      )
    }

    // Limit number of emotes rendered at once for performance
    const maxEmotesToRender = 100
    const emotesToShow = emoteList.slice(0, maxEmotesToRender)

    return (
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-8 gap-2 p-2">
        {emotesToShow.map((emote, index) => (
          <button
            key={`${source}-${emote.id}-${index}`}
            className="flex flex-col items-center justify-center p-1 hover:bg-background-tertiary rounded transition-colors"
            onClick={(e) => handleEmoteSelect(e, emote.name)}
            title={emote.name}
            type="button"
          >
            <img
              src={emote.urls["1x"] || ""}
              alt={emote.name}
              className="w-8 h-8 object-contain"
              loading="lazy"
            />
            <span className="text-xs mt-1 truncate w-full text-center">{emote.name}</span>
          </button>
        ))}
        {emoteList.length > maxEmotesToRender && (
          <div className="col-span-full text-center py-2 text-text-secondary text-sm">
            Showing {maxEmotesToRender} of {emoteList.length} emotes. Refine your search to see more.
          </div>
        )}
      </div>
    )
  }

  // Render recent emotes
  const renderRecentEmotes = () => {
    if (filteredRecentEmotes.length === 0) {
      return (
        <div className="py-8 text-center text-text-secondary">
          {searchQuery ? "No matching recent emotes found" : "No recent emotes"}
        </div>
      )
    }

    return (
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-8 gap-2 p-2">
        {filteredRecentEmotes.map((emoteName, index) => {
          const emote = getEmote(emoteName)
          return (
            <button
              key={`recent-${index}`}
              className="flex flex-col items-center justify-center p-1 hover:bg-background-tertiary rounded transition-colors"
              onClick={(e) => handleEmoteSelect(e, emoteName)}
              title={emoteName}
              type="button"
            >
              {emote ? (
                <img
                  src={emote.urls["1x"] || ""}
                  alt={emoteName}
                  className="w-8 h-8 object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="w-8 h-8 flex items-center justify-center font-mono text-xs">
                  {emoteName}
                </div>
              )}
              <span className="text-xs mt-1 truncate w-full text-center">{emoteName}</span>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-full right-0 mb-2 w-80 md:w-96 bg-surface border border-border rounded-lg shadow-lg z-10 overflow-hidden"
    >
      {/* Header with refresh button */}
      <div className="flex items-center justify-between p-2 bg-background-secondary border-b border-border">
        <h3 className="font-medium">Emotes</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshEmotes}
            className="p-1 hover:bg-background-tertiary rounded-full transition-colors"
            title="Refresh emotes"
            type="button"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-background-tertiary rounded-full transition-colors"
            aria-label="Close emote picker"
            type="button"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-border">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search emotes..."
            className="w-full pl-8 pr-4 py-1.5 bg-background-tertiary rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search size={16} className="absolute left-2.5 top-2 text-text-secondary" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeTab === "twitch"
              ? "bg-background-tertiary text-primary border-b-2 border-primary"
              : "text-text-secondary hover:bg-background-tertiary"
          }`}
          onClick={() => setActiveTab("twitch")}
          type="button"
        >
          Twitch
        </button>
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeTab === "bttv"
              ? "bg-background-tertiary text-primary border-b-2 border-primary"
              : "text-text-secondary hover:bg-background-tertiary"
          }`}
          onClick={() => setActiveTab("bttv")}
          type="button"
        >
          BTTV
        </button>
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeTab === "ffz"
              ? "bg-background-tertiary text-primary border-b-2 border-primary"
              : "text-text-secondary hover:bg-background-tertiary"
          }`}
          onClick={() => setActiveTab("ffz")}
          type="button"
        >
          FFZ
        </button>
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeTab === "recent"
              ? "bg-background-tertiary text-primary border-b-2 border-primary"
              : "text-text-secondary hover:bg-background-tertiary"
          }`}
          onClick={() => setActiveTab("recent")}
          type="button"
        >
          Recent
        </button>
      </div>

      {/* Content */}
      <div className="max-h-64 overflow-y-auto">
        {activeTab === "twitch" && renderEmoteGrid(filteredTwitchEmotes, "twitch")}
        {activeTab === "bttv" && renderEmoteGrid(filteredBttvEmotes, "bttv")}
        {activeTab === "ffz" && renderEmoteGrid(filteredFfzEmotes, "ffz")}
        {activeTab === "recent" && renderRecentEmotes()}
      </div>

      {/* Footer */}
      <div className="p-2 bg-background-secondary border-t border-border text-xs text-text-tertiary flex justify-between items-center">
        <div>
          {channelName ? `Channel: ${channelName}` : "No channel selected"}
        </div>
        <div>
          {isLoading ? "Loading emotes..." : `${emotes.length} emotes available`}
        </div>
      </div>
    </div>
  )
}

export default EmotesPicker