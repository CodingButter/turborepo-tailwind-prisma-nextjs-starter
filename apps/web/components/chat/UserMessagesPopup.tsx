import React, { useState, useEffect, useRef } from "react"
import { X, Minimize, Maximize, ChevronUp, ChevronDown } from "lucide-react"
import { parseEmotes, getTwitchEmoteUrl, splitMessageWithEmotes } from "../../utils/emoteUtils"

interface Message {
  id: string
  nickname: string
  content: string
  timestamp: Date
  isAction?: boolean
  tags?: any // Add tags to support emote parsing
}

interface UserMessagesPopupProps {
  username: string
  messages: Message[]
  onClose: () => void
}

const UserMessagesPopup: React.FC<UserMessagesPopupProps> = ({ username, messages, onClose }) => {
  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isMinimized, setIsMinimized] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [userData, setUserData] = useState<{
    profileImage?: string
    displayName?: string
    userId?: string
  }>({})

  const messagesPerPage = 20
  const popupRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  // Render message content with emotes
  const renderMessageContent = (message: Message) => {
    // Handle action messages
    if (message.isAction) {
      return (
        <span>
          * <span className="text-primary-light">{message.nickname}</span> {message.content}
        </span>
      )
    }

    // Parse Twitch emotes
    const twEmotes = parseEmotes(message.tags?.emotes, message.content)

    // If no emotes, just return plain text
    if (!twEmotes || twEmotes.length === 0) {
      return <span>{message.content}</span>
    }

    // Split message into parts with emotes
    const messageParts = splitMessageWithEmotes(message.content, twEmotes)

    return (
      <p className="break-words flex flex-wrap items-center">
        {messageParts.map((part: string | (typeof twEmotes)[0], index: number) => {
          if (typeof part === "string") {
            return <span key={index}>{part}</span>
          } else {
            // It's a Twitch emote
            return (
              <img
                key={`${part.id}-${index}`}
                src={getTwitchEmoteUrl(part.id, "1.0")}
                alt={part.code}
                title={part.code}
                className="inline-block mx-1 align-middle"
                width="28"
                height="28"
                loading="lazy"
              />
            )
          }
        })}
      </p>
    )
  }

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const clientId = import.meta.env.VITE_CLIENT_ID
        const oauth = import.meta.env.VITE_OAUTH_TOKEN

        if (!clientId || !oauth) {
          console.error("Missing Client ID or OAuth token")
          return
        }

        const response = await fetch(`https://api.twitch.tv/helix/users?login=${username}`, {
          headers: {
            "Client-ID": clientId,
            Authorization: `Bearer ${oauth}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Error fetching user data: ${response.status}`)
        }

        const data = await response.json()

        if (data.data && data.data.length > 0) {
          const user = data.data[0]
          setUserData({
            profileImage: user.profile_image_url,
            displayName: user.display_name,
            userId: user.id,
          })
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error)
      }
    }

    fetchUserProfile()
  }, [username])

  // Dragging logic remains the same as previous implementation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isFullscreen) {
        const newX = e.clientX - dragOffset.x
        const newY = e.clientY - dragOffset.y
        setPosition({ x: newX, y: newY })
      }
    }

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
      }
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset, isFullscreen])

  // Mouse down handler for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (headerRef.current && headerRef.current.contains(e.target as Node) && !isFullscreen) {
      setIsDragging(true)
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    }
  }

  // Pagination methods
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  // Calculate total pages and current page messages
  const totalPages = Math.ceil(messages.length / messagesPerPage)
  const currentMessages = messages.slice(
    (currentPage - 1) * messagesPerPage,
    currentPage * messagesPerPage
  )

  // Popup style calculation
  const getPopupStyle = () => {
    if (isFullscreen) {
      return {
        position: "fixed" as const,
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        transform: "none",
        maxWidth: "100%",
        zIndex: 50,
      }
    }

    if (isMinimized) {
      return {
        position: "fixed" as const,
        bottom: 10,
        right: 10,
        width: "250px",
        height: "40px",
        transform: "none",
        zIndex: 50,
      }
    }

    return {
      position: "fixed" as const,
      top: `${position.y}px`,
      left: `${position.x}px`,
      width: "500px",
      height: "600px",
      transform: "none",
      zIndex: 50,
    }
  }

  return (
    <div
      ref={popupRef}
      style={getPopupStyle()}
      className="bg-surface text-text rounded-md shadow-lg flex flex-col overflow-hidden border border-border"
    >
      {/* Header with user info */}
      <div
        ref={headerRef}
        onMouseDown={handleMouseDown}
        className="relative bg-background-secondary"
      >
        {/* Cover photo placeholder - could be fetched from Twitch profile */}
        {userData.userId && (
          <div
            className="w-full h-24 bg-gradient-to-r from-primary to-secondary opacity-70"
            style={{
              backgroundImage: `url(https://static-cdn.jtvnw.net/jtv_user_pictures/${userData.userId}-channel_offline_background-1920x1080.png)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}

        {/* Profile picture and username */}
        <div className="absolute bottom-0 left-4 transform translate-y-1/2 flex items-center">
          {userData.profileImage && (
            <img
              src={userData.profileImage}
              alt={`${username}'s profile`}
              className="w-20 h-20 rounded-full border-4 border-surface object-cover"
            />
          )}
          <div className="ml-4">
            <h2 className="text-xl font-bold text-text">{userData.displayName || username}</h2>
            <p className="text-text-secondary">@{username}</p>
          </div>
        </div>

        {/* Popup controls */}
        <div className="absolute top-2 right-2 flex space-x-1">
          {isMinimized ? (
            <button
              onClick={() => setIsMinimized(false)}
              className="text-text-secondary hover:text-text p-1"
              aria-label="Restore"
            >
              <ChevronUp size={16} />
            </button>
          ) : (
            <button
              onClick={() => setIsMinimized(true)}
              className="text-text-secondary hover:text-text p-1"
              aria-label="Minimize"
            >
              <Minimize size={16} />
            </button>
          )}
          {!isMinimized &&
            (isFullscreen ? (
              <button
                onClick={() => setIsFullscreen(false)}
                className="text-text-secondary hover:text-text p-1"
                aria-label="Exit fullscreen"
              >
                <Minimize size={16} />
              </button>
            ) : (
              <button
                onClick={() => setIsFullscreen(true)}
                className="text-text-secondary hover:text-text p-1"
                aria-label="Fullscreen"
              >
                <Maximize size={16} />
              </button>
            ))}
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text p-1"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages content - only show when not minimized */}
      {!isMinimized && (
        <>
          {/* Messages list */}
          <div className="flex-grow overflow-y-auto p-4 pt-16 space-y-2">
            {currentMessages.length > 0 ? (
              currentMessages.map((msg) => (
                <div key={msg.id} className="py-1 border-b border-border">
                  <div className="text-xs text-text-secondary">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div>{renderMessageContent(msg)}</div>
                </div>
              ))
            ) : (
              <div className="text-center text-text-secondary py-4">
                No messages from this user in this channel.
              </div>
            )}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="p-2 bg-background-secondary flex items-center justify-between text-sm">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="px-2 py-1 rounded bg-background-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronUp size={16} />
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-2 py-1 rounded bg-background-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronDown size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default UserMessagesPopup
