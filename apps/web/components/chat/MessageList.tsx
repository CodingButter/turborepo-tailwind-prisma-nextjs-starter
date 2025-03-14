import React, { useRef, useEffect, useState, useCallback } from "react"
import { Message } from "../../../types/Message"
import MessageItem from "./MessageItem"
import ChatSearchBar, { ChatFilters } from "./ChatSearchBar"

interface MessageListProps {
  messages: Message[]
  currentChannel: `#${string}` | null
  onUsernameClick?: (username: string) => void
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentChannel, onUsernameClick }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageListRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<ChatFilters>({
    showJoinLeave: true,
    showTimestamps: true,
    highlightMentions: true,
    onlyFromUser: null,
  })
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([])
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true)
  const [lastScrollPosition, setLastScrollPosition] = useState(0)

  // Filter messages for the current channel
  useEffect(() => {
    if (!currentChannel) {
      setFilteredMessages([])
      return
    }

    // Start with channel-specific messages
    let result = messages.filter((msg) => msg.channel === currentChannel)

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (msg) =>
          msg.content.toLowerCase().includes(query) ||
          msg.username.toLowerCase().includes(query) ||
          msg.displayName.toLowerCase().includes(query)
      )
    }

    // Filter system messages (join/leave)
    if (!filters.showJoinLeave) {
      result = result.filter((msg) => msg.username !== "system")
    }

    // Filter by specific user
    if (filters.onlyFromUser) {
      result = result.filter(
        (msg) => msg.username.toLowerCase() === filters.onlyFromUser?.toLowerCase()
      )
    }

    setFilteredMessages(result)
  }, [messages, currentChannel, searchQuery, filters])

  // Handle scroll to detect if user has scrolled up
  useEffect(() => {
    const handleScroll = () => {
      if (!messageListRef.current) return

      const { scrollTop, scrollHeight, clientHeight } = messageListRef.current
      const scrolledToBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50

      setIsAutoScrollEnabled(scrolledToBottom)
      setLastScrollPosition(scrollTop)
    }

    const messageList = messageListRef.current
    if (messageList) {
      messageList.addEventListener("scroll", handleScroll)
      return () => messageList.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Scroll to bottom when messages change, but only if autoscroll is enabled
  useEffect(() => {
    if (isAutoScrollEnabled && !searchQuery && !filters.onlyFromUser) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    } else if (messageListRef.current) {
      // If autoscroll is disabled, maintain scroll position
      messageListRef.current.scrollTop = lastScrollPosition
    }
  }, [filteredMessages, isAutoScrollEnabled, searchQuery, filters.onlyFromUser, lastScrollPosition])

  // Handle search query changes
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: ChatFilters) => {
    setFilters(newFilters)
  }, [])

  // Handle username click to filter by user
  const handleUsernameClick = (username: string) => {
    if (onUsernameClick) {
      onUsernameClick(username)
    } else {
      // Toggle user filter
      if (filters.onlyFromUser === username) {
        setFilters((prev: ChatFilters) => ({ ...prev, onlyFromUser: null }))
      } else {
        setFilters((prev: ChatFilters) => ({ ...prev, onlyFromUser: username }))
      }
    }
  }

  if (!currentChannel) {
    // No channel selected view
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 bg-surface/50 rounded-lg border border-border max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto mb-6 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
            />
          </svg>
          <p className="text-text text-xl font-medium mb-2">No channel selected</p>
          <p className="text-text-secondary mb-6">
            Join a channel from the sidebar to start chatting
          </p>
          <div className="flex justify-center">
            <div className="animate-bounce bg-primary p-2 w-10 h-10 ring-1 ring-primary-light shadow-lg rounded-full flex items-center justify-center">
              <svg
                className="h-6 w-6 text-text"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 11l5-5m0 0l5 5m-5-5v12"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Search bar */}
      <ChatSearchBar onSearch={handleSearch} onFilterChange={handleFilterChange} />

      {/* Messages area */}
      <div
        ref={messageListRef}
        className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-primary scrollbar-track-background-tertiary"
      >
        {/* Active filter indicator */}
        {(searchQuery || filters.onlyFromUser) && (
          <div className="mb-4 p-2 bg-surface rounded-lg border border-border text-text-secondary text-sm">
            {searchQuery && (
              <div className="mb-1">
                Searching for: <span className="font-semibold text-primary">{searchQuery}</span>
              </div>
            )}
            {filters.onlyFromUser && (
              <div>
                Showing messages from:
                <span className="font-semibold text-primary ml-1">{filters.onlyFromUser}</span>
                <button
                  onClick={() =>
                    setFilters((prev: ChatFilters) => ({ ...prev, onlyFromUser: null }))
                  }
                  className="ml-2 px-1 py-0.5 text-xs bg-background-tertiary hover:bg-surface-hover rounded"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}

        {filteredMessages.length > 0 ? (
          <div className="space-y-3">
            {filteredMessages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                onUsernameClick={handleUsernameClick}
                showTimestamp={filters.showTimestamps}
                highlightMentions={filters.highlightMentions}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6 bg-surface/50 rounded-lg border border-border">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto mb-4 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-text-secondary text-lg">
                {messages.filter((msg) => msg.channel === currentChannel).length > 0
                  ? "No messages match your search or filters"
                  : "No messages yet"}
              </p>
              <p className="text-text-tertiary mt-2">
                {messages.filter((msg) => msg.channel === currentChannel).length > 0
                  ? "Try adjusting your search criteria"
                  : "Chat messages will appear here"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageList
