import React, { useState, useEffect, useRef } from "react"
import { X, Search, AlertCircle, RefreshCw } from "lucide-react"
import { useEmotes } from "../../hooks/useEmotes"
import { useTwitchEmotes } from "../../hooks/useTwitchEmotes"

interface EmotesPickerProps {
  onClose: () => void
  onSelectEmote: (emoteCode: string) => void
  channelName: string | null
}

const EmotesPicker: React.FC<EmotesPickerProps> = ({ onClose, onSelectEmote, channelName }) => {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [bttvEmotes, setBttvEmotes] = useState<Array<{ id: string; code: string; url: string }>>([])
  const [ffzEmotes, setFfzEmotes] = useState<Array<{ id: string; code: string; url: string }>>([])
  const [activeTab, setActiveTab] = useState<
    "twitch" | "bttv" | "ffz" | "recent" | "debug" | "custom"
  >("twitch")
  const [recentEmotes, setRecentEmotes] = useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [customEmotes, setCustomEmotes] = useState<
    Array<{ id: string; code: string; url: string }>
  >([])

  const pickerRef = useRef<HTMLDivElement>(null)
  const { loadedChannels } = useEmotes()
  const { emotes: twitchEmotes, isLoading: twitchEmotesLoading, debugInfo } = useTwitchEmotes()

  // Log debug info when it changes
  useEffect(() => {
    console.log("EmotesPicker: Twitch emotes count:", twitchEmotes.length)
    console.log("EmotesPicker: Debug info:", debugInfo)
  }, [twitchEmotes, debugInfo])

  // Load recent emotes from localStorage
  useEffect(() => {
    const storedEmotes = localStorage.getItem("recentEmotes")
    if (storedEmotes) {
      try {
        setRecentEmotes(JSON.parse(storedEmotes))
      } catch (e) {
        console.error("Failed to parse recent emotes:", e)
      }
    }
  }, [])

  // Manually fetch user emotes from Twitch API
  const fetchUserEmotesManually = async () => {
    setIsRefreshing(true)
    try {
      const clientId = import.meta.env.VITE_CLIENT_ID
      const oauthToken = import.meta.env.VITE_OAUTH_TOKEN

      if (!clientId || !oauthToken) {
        console.error("Missing Client ID or OAuth token")
        setIsRefreshing(false)
        return
      }

      // First, get user ID
      const userResponse = await fetch("https://api.twitch.tv/helix/users", {
        headers: {
          "Client-ID": clientId,
          Authorization: `Bearer ${oauthToken}`,
        },
      })

      if (!userResponse.ok) {
        console.error("Failed to fetch user information")
        setIsRefreshing(false)
        return
      }

      const userData = await userResponse.json()

      // Get user's channel emotes
      const emotesResponse = await fetch(
        `https://api.twitch.tv/helix/chat/emotes?broadcaster_id=${userData.data[0].id}`,
        {
          headers: {
            "Client-ID": clientId,
            Authorization: `Bearer ${oauthToken}`,
          },
        }
      )

      if (emotesResponse.ok) {
        const emotesData = await emotesResponse.json()
        const fetchedEmotes = emotesData.data.map((emote: any) => ({
          id: emote.id,
          code: emote.name,
          url: emote.images.url_1x,
        }))

        setCustomEmotes(fetchedEmotes)
        console.log("Fetched custom emotes:", fetchedEmotes)
      }
    } catch (error) {
      console.error("Error fetching emotes:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Try to fetch emotes when component mounts
  useEffect(() => {
    fetchUserEmotesManually()
  }, [])

  // Mock loading BTTV and FFZ emotes
  useEffect(() => {
    // Mock BTTV emotes
    setBttvEmotes([
      {
        id: "54fa90c901e468494b85b54f",
        code: "FeelsBadMan",
        url: "https://cdn.betterttv.net/emote/54fa90c901e468494b85b54f/1x",
      },
      {
        id: "54fa909501e468494b85b53f",
        code: "FeelsGoodMan",
        url: "https://cdn.betterttv.net/emote/54fa909501e468494b85b53f/1x",
      },
      {
        id: "5590b223b344e2c42a9e28e3",
        code: "RIP",
        url: "https://cdn.betterttv.net/emote/5590b223b344e2c42a9e28e3/1x",
      },
      {
        id: "55028cd2135896936880fdd7",
        code: "OhMyGod",
        url: "https://cdn.betterttv.net/emote/55028cd2135896936880fdd7/1x",
      },
      {
        id: "5cdae4baa08c430e35632b91",
        code: "PepeHands",
        url: "https://cdn.betterttv.net/emote/5cdae4baa08c430e35632b91/1x",
      },
    ])

    // Mock FFZ emotes
    setFfzEmotes([
      { id: "3218", code: "OMEGALUL", url: "https://cdn.frankerfacez.com/emote/128054/1" },
      { id: "4057", code: "KEKW", url: "https://cdn.frankerfacez.com/emote/381875/1" },
      { id: "5724", code: "monkaS", url: "https://cdn.frankerfacez.com/emote/130762/1" },
      { id: "1896", code: "PogU", url: "https://cdn.frankerfacez.com/emote/256055/1" },
    ])
  }, [channelName])

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

  // Handle emote selection with improved performance
  const handleEmoteSelect = (e: React.MouseEvent, emoteCode: string) => {
    // Prevent event propagation and default actions
    e.preventDefault()
    e.stopPropagation()

    // Directly call onSelectEmote with the emote code
    onSelectEmote(emoteCode)

    // Only add to recents if it's not an empty or duplicate
    if (emoteCode.trim()) {
      // Update recent emotes using functional update for atomicity
      setRecentEmotes((prev) => {
        // Remove duplicates and add at the beginning
        const updated = [emoteCode, ...prev.filter((e) => e !== emoteCode)].slice(0, 20)

        // Optimistically store to localStorage
        try {
          // Use requestIdleCallback if available, otherwise setTimeout
          if ("requestIdleCallback" in window) {
            window.requestIdleCallback(() => {
              localStorage.setItem("recentEmotes", JSON.stringify(updated))
            })
          } else {
            setTimeout(() => {
              localStorage.setItem("recentEmotes", JSON.stringify(updated))
            }, 50)
          }
        } catch (error) {
          console.error("Failed to save to localStorage:", error)
        }

        return updated
      })
    }
  }

  // Filter emotes based on search
  const filteredTwitchEmotes = twitchEmotes.filter((emote) =>
    emote.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredBttvEmotes = bttvEmotes.filter((emote) =>
    emote.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredFfzEmotes = ffzEmotes.filter((emote) =>
    emote.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredRecentEmotes = recentEmotes.filter((emoteCode) =>
    emoteCode.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredCustomEmotes = customEmotes.filter((emote) =>
    emote.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get URL for a Twitch emote
  const getTwitchEmoteUrl = (id: string, size: "1.0" | "2.0" | "3.0" = "1.0") => {
    return `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/${size}`
  }

  // Optimized renderTwitchEmotesGrid function with virtualization
  const renderTwitchEmotesGrid = () => {
    if (twitchEmotesLoading) {
      return (
        <div className="py-8 text-center text-text-secondary">
          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          Loading emotes...
        </div>
      )
    }

    if (filteredTwitchEmotes.length === 0) {
      return (
        <div className="py-8 text-center text-text-secondary">
          {searchQuery ? "No matching emotes found" : "No emotes available"}
          <div className="mt-2 text-xs">Only showing default emotes</div>
        </div>
      )
    }

    // If we have many emotes, only render those visible in the viewport
    const maxEmotesToRender = 100 // Limit number of emotes rendered at once
    const emotesToShow = filteredTwitchEmotes.slice(0, maxEmotesToRender)

    return (
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-8 gap-2 p-2">
        {emotesToShow.map((emote, index) => (
          <button
            key={`twitch-${emote.id}-${index}`}
            className="flex flex-col items-center justify-center p-1 hover:bg-background-tertiary rounded transition-colors"
            onClick={(e) => handleEmoteSelect(e, emote.code)}
            title={emote.code}
            type="button"
          >
            <img
              src={getTwitchEmoteUrl(emote.id)}
              alt={emote.code}
              className="w-8 h-8 object-contain"
              loading="lazy"
            />
            <span className="text-xs mt-1 truncate w-full text-center">{emote.code}</span>
          </button>
        ))}
        {filteredTwitchEmotes.length > maxEmotesToRender && (
          <div className="col-span-full text-center py-2 text-text-secondary text-sm">
            Showing {maxEmotesToRender} of {filteredTwitchEmotes.length} emotes. Refine your search
            to see more.
          </div>
        )}
      </div>
    )
  }

  // Render custom emotes grid
  const renderCustomEmotesGrid = () => {
    if (isRefreshing) {
      return (
        <div className="py-8 text-center text-text-secondary">
          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          Loading your emotes...
        </div>
      )
    }

    if (filteredCustomEmotes.length === 0) {
      return (
        <div className="py-8 text-center text-text-secondary">
          {searchQuery ? "No matching emotes found" : "No custom emotes available"}
          <div className="mt-2 text-xs">Try refreshing using the button in the top right</div>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-8 gap-2 p-2">
        {filteredCustomEmotes.map((emote, index) => (
          <button
            key={`custom-${emote.id}-${index}`}
            className="flex flex-col items-center justify-center p-1 hover:bg-background-tertiary rounded transition-colors"
            onClick={(e) => handleEmoteSelect(e, emote.code)}
            title={emote.code}
            type="button"
          >
            <img
              src={emote.url}
              alt={emote.code}
              className="w-8 h-8 object-contain"
              loading="lazy"
            />
            <span className="text-xs mt-1 truncate w-full text-center">{emote.code}</span>
          </button>
        ))}
      </div>
    )
  }

  // Render emote grid for third-party providers
  const renderEmoteGrid = (
    emotes: Array<{ id?: string; code: string; url?: string }> | string[],
    provider: "bttv" | "ffz" | "recent"
  ) => {
    if (emotes.length === 0) {
      return (
        <div className="py-8 text-center text-text-secondary">
          {searchQuery ? "No matching emotes found" : "No emotes available"}
        </div>
      )
    }

    return (
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-8 gap-2 p-2">
        {emotes.map((emote, index) => {
          const emoteCode = typeof emote === "string" ? emote : emote.code
          const emoteUrl = typeof emote === "string" ? undefined : emote.url

          return (
            <button
              key={`${provider}-${index}`}
              className="flex flex-col items-center justify-center p-1 hover:bg-background-tertiary rounded transition-colors"
              onClick={(e) => handleEmoteSelect(e, emoteCode)}
              title={emoteCode}
              type="button"
            >
              {emoteUrl ? (
                <img
                  src={emoteUrl}
                  alt={emoteCode}
                  className="w-8 h-8 object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="w-8 h-8 flex items-center justify-center font-mono text-xs">
                  {emoteCode}
                </div>
              )}
              <span className="text-xs mt-1 truncate w-full text-center">{emoteCode}</span>
            </button>
          )
        })}
      </div>
    )
  }

  // Render debug information
  const renderDebugInfo = () => {
    return (
      <div className="p-4 text-sm">
        <h3 className="font-semibold mb-2">Emote Debugging Information</h3>

        <div className="space-y-2">
          <div>
            <div className="font-medium">GLOBALUSERSTATE received:</div>
            <div className={debugInfo.receivedGlobalUserState ? "text-success" : "text-error"}>
              {debugInfo.receivedGlobalUserState ? "Yes" : "No"}
            </div>
          </div>

          <div>
            <div className="font-medium">Emote sets string:</div>
            <div className="font-mono bg-background-tertiary p-1 rounded">
              {debugInfo.emoteSetString || "(empty)"}
            </div>
          </div>

          <div>
            <div className="font-medium">API called:</div>
            <div className={debugInfo.apiCalled ? "text-success" : "text-text-secondary"}>
              {debugInfo.apiCalled ? "Yes" : "No"}
            </div>
          </div>

          <div>
            <div className="font-medium">API error:</div>
            <div className={debugInfo.apiError ? "text-error" : "text-success"}>
              {debugInfo.apiError || "None"}
            </div>
          </div>

          <div>
            <div className="font-medium">Twitch emotes loaded:</div>
            <div>
              {twitchEmotes.length} emotes
              {twitchEmotes.length > 0 && (
                <span className="text-text-secondary ml-2">
                  (
                  {twitchEmotes
                    .slice(0, 3)
                    .map((e) => e.code)
                    .join(", ")}
                  ...)
                </span>
              )}
            </div>
          </div>

          <div>
            <div className="font-medium">Custom emotes loaded:</div>
            <div>
              {customEmotes.length} emotes
              {customEmotes.length > 0 && (
                <span className="text-text-secondary ml-2">
                  (
                  {customEmotes
                    .slice(0, 3)
                    .map((e) => e.code)
                    .join(", ")}
                  ...)
                </span>
              )}
            </div>
          </div>

          <div>
            <div className="font-medium">Loading state:</div>
            <div className={twitchEmotesLoading || isRefreshing ? "text-warning" : "text-success"}>
              {twitchEmotesLoading || isRefreshing ? "Loading..." : "Completed"}
            </div>
          </div>
        </div>

        {debugInfo.apiError && (
          <div className="mt-4 bg-error/20 p-2 rounded flex items-start">
            <AlertCircle size={16} className="text-error mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <strong>API Error:</strong> {debugInfo.apiError}
              <div className="mt-1">
                If you're seeing "Missing scope" errors, make sure your OAuth token has the required
                scopes:
                <ul className="list-disc ml-4 mt-1">
                  <li>user:read:emotes</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {!debugInfo.receivedGlobalUserState && (
          <div className="mt-4 bg-warning/20 p-2 rounded flex items-start">
            <AlertCircle size={16} className="text-warning mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <strong>No GLOBALUSERSTATE Received:</strong> The IRC client isn't emitting the
              GLOBALUSERSTATE event. Make sure the IRCClient.ts file has been updated to handle this
              event.
            </div>
          </div>
        )}
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
            onClick={fetchUserEmotesManually}
            className="p-1 hover:bg-background-tertiary rounded-full transition-colors"
            title="Refresh emotes"
            type="button"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
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
            activeTab === "custom"
              ? "bg-background-tertiary text-primary border-b-2 border-primary"
              : "text-text-secondary hover:bg-background-tertiary"
          }`}
          onClick={() => setActiveTab("custom")}
          type="button"
        >
          My Emotes
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
      </div>

      {/* Content */}
      <div className="max-h-64 overflow-y-auto">
        {activeTab === "twitch" && renderTwitchEmotesGrid()}
        {activeTab === "custom" && renderCustomEmotesGrid()}
        {activeTab === "bttv" && renderEmoteGrid(filteredBttvEmotes, "bttv")}
        {activeTab === "ffz" && renderEmoteGrid(filteredFfzEmotes, "ffz")}
        {activeTab === "recent" && renderEmoteGrid(filteredRecentEmotes, "recent")}
        {activeTab === "debug" && renderDebugInfo()}
      </div>

      {/* Footer */}
      <div className="p-2 bg-background-secondary border-t border-border text-xs text-text-tertiary flex justify-between items-center">
        <div>
          {channelName ? `Channel: ${channelName}` : "No channel selected"} •
          {loadedChannels.length > 0
            ? ` ${loadedChannels.length} channel(s) loaded`
            : " No channels loaded"}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("recent")}
            className={`${
              activeTab === "recent" ? "text-primary" : "text-text-secondary"
            } hover:underline`}
            type="button"
          >
            Recent
          </button>
          <span>•</span>
          <button
            onClick={() => setActiveTab(activeTab === "debug" ? "twitch" : "debug")}
            className="text-primary hover:underline"
            type="button"
          >
            {activeTab === "debug" ? "Hide Debug" : "Debug"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmotesPicker
