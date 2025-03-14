// src/components/ChatInterface.tsx
import React, { useState, useEffect, useRef, useCallback } from "react"
import { useTIRC, useEmotes} from "@repo/tirc"
import { Message } from "../../types/Message"
import { useLocation } from "react-router-dom"
import { useSidebarState } from "../hooks/useSidebarState"

// Components
import ChannelList from "./chat/ChannelList"
import MessageList from "./chat/MessageList"
import Header from "./chat/Header"
import ChatInputWithCommandPopup from "./chat/ChatInputWithCommandPopup"
import UserMessagesPopup from "./chat/UserMessagesPopup"

// Define Channel type
type Channel = `#${string}`

const ChatInterface: React.FC = () => {
  const { client, sendMessage: tircSendMessage, messages: tircMessages } = useTIRC()
  const {  isLoading: emoteLoading } = useEmotes()
  const [sidebarCollapsed, setSidebarCollapsed] = useSidebarState(false)

  const [messages, setMessages] = useState<Message[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [newChannelInput, setNewChannelInput] = useState("")
  const [connectionStatus, setConnectionStatus] = useState("Connecting...")
  const [initialChannelsJoined, setInitialChannelsJoined] = useState(false)
  const [joinAttemptInProgress, setJoinAttemptInProgress] = useState(false)

  // User popup state
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [showUserPopup, setShowUserPopup] = useState(false)
  const initialJoinTimeoutRef = useRef<number | null>(null)

  // Helper function to parse query params
  const useQueryParams = () => {
    const { search } = useLocation()
    return React.useMemo(() => new URLSearchParams(search), [search])
  }
  const queryParams = useQueryParams()

  // Generate a unique ID for messages
  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Save channels to localStorage
  const saveChannelsToLocalStorage = useCallback((channelList: Channel[]) => {
    try {
      localStorage.setItem("twitchJoinedChannels", JSON.stringify(channelList))
    } catch (error) {
      console.error("Failed to save channels to localStorage:", error)
    }
  }, [])

  // Join a channel safely
  const joinChannelSafely = useCallback(
    async (channelToJoin: Channel) => {
      if (!client || !isConnected) {
        console.log("Cannot join channel - client not available or not connected")
        return false
      }

      try {
        console.log(`Safely joining channel: ${channelToJoin}`)
        await client.join(channelToJoin)
        console.log(`Successfully joined: ${channelToJoin}`)
        return true
      } catch (error) {
        console.error(`Error joining channel ${channelToJoin}:`, error)
        return false
      }
    },
    [client, isConnected]
  )

  // Process TIRC messages into our app format
  useEffect(() => {
    if (!tircMessages || tircMessages.length === 0) return
    
    // Get the most recent message
    const tircMessage = tircMessages[tircMessages.length - 1]
    
    // Convert to our app's message format
    const newMessage: Message = {
      id: tircMessage.id || generateUniqueId(),
      channel: tircMessage.channel,
      username: tircMessage.user.toLowerCase(),
      displayName: tircMessage.user,
      content: tircMessage.rawMessage,
      color: "#FFFFFF", // Default color
      timestamp: new Date(),
      isCurrentUser: false, // Determine based on client.getNick() if available
      badges: "",
      profileImage: null,
      tags: tircMessage.tags || {},
    }
    
    setMessages(prev => [...prev, newMessage])
  }, [tircMessages])

  // Handle initial joining of channels from URL parameters
  useEffect(() => {
    if (!client || !isConnected || initialChannelsJoined || joinAttemptInProgress) return

    const joinChannelsFromUrl = async () => {
      setJoinAttemptInProgress(true)

      // Get channels from URL
      const channelsParam = queryParams.get("channels")
      let channelsToJoin: Channel[] = []

      if (channelsParam) {
        console.log("Found channels in URL:", channelsParam)
        // Split by comma and format as channels
        channelsToJoin = channelsParam
          .split(",")
          .map((channel) => channel.trim())
          .filter((channel) => channel.length > 0)
          .map((channel) =>
            channel.startsWith("#") ? (channel as Channel) : (`#${channel}` as Channel)
          )

        console.log("Parsed channels to join:", channelsToJoin)
      }

      // If no channels in URL, try to get from localStorage
      if (channelsToJoin.length === 0) {
        try {
          const savedChannels = localStorage.getItem("twitchJoinedChannels")
          if (savedChannels) {
            channelsToJoin = JSON.parse(savedChannels)
            console.log("Using channels from localStorage:", channelsToJoin)
          }
        } catch (error) {
          console.error("Failed to load channels from localStorage:", error)
        }
      }

      // Join each channel with a delay
      if (channelsToJoin.length > 0) {
        console.log("Will join these channels:", channelsToJoin)
        setInitialChannelsJoined(true) // Mark as joined immediately to prevent duplicate attempts

        for (let i = 0; i < channelsToJoin.length; i++) {
          // IIFE to capture the current index
          ;((index) => {
            setTimeout(async () => {
              await joinChannelSafely(channelsToJoin[index])

              // If this is the last channel, clear the flag
              if (index === channelsToJoin.length - 1) {
                setJoinAttemptInProgress(false)
              }
            }, index * 2000) // 2 second delay between each join
          })(i)
        }
      } else {
        setJoinAttemptInProgress(false)
      }
    }

    // Wait a bit after connection before joining channels to ensure WebSocket is fully ready
    initialJoinTimeoutRef.current = window.setTimeout(() => {
      joinChannelsFromUrl()
    }, 3000) // Allow 3 seconds for connection to fully establish

    return () => {
      if (initialJoinTimeoutRef.current) {
        clearTimeout(initialJoinTimeoutRef.current)
        initialJoinTimeoutRef.current = null
      }
    }
  }, [
    client,
    isConnected,
    initialChannelsJoined,
    queryParams,
    joinChannelSafely,
    joinAttemptInProgress,
  ])

  // Set up connection status when client changes
  useEffect(() => {
    if (!client) {
      console.log("No IRC client available")
      return
    }

    console.log("IRC client is available, setting up event handlers")

    // Set initial connection state
    setConnectionStatus("Connected")
    setIsConnected(true)

    const handleConnect = () => {
      setIsConnected(true)
      setConnectionStatus("Connected")
    }

    const handleDisconnect = () => {
      setIsConnected(false)
      setConnectionStatus("Disconnected")
      setInitialChannelsJoined(false)
      setJoinAttemptInProgress(false)
    }

    const handleError = (error: { message: string }) => {
      setConnectionStatus(`Error: ${error.message}`)
    }

    // Register event handlers
    client.on("connected", handleConnect)
    client.on("disconnected", handleDisconnect)
    client.on("error", handleError)

    // Setup handler for channel events
    client.on("userJoined", ({ channel, user }) => {
      // Add system message for user join
      const joinMessage: Message = {
        id: generateUniqueId(),
        channel,
        username: "system",
        displayName: "System",
        content: `${user} joined the channel`,
        color: "var(--color-success)",
        timestamp: new Date(),
        isCurrentUser: false,
        tags: {},
      }
      setMessages(prev => [...prev, joinMessage])
    })

    client.on("userLeft", ({ channel, user }) => {
      // Add system message for user leave
      const leftMessage: Message = {
        id: generateUniqueId(),
        channel,
        username: "system",
        displayName: "System",
        content: `${user} left the channel`,
        color: "var(--color-error)",
        timestamp: new Date(),
        isCurrentUser: false,
        tags: {},
      }
      setMessages(prev => [...prev, leftMessage])
    })

    return () => {
      client.off("connected", handleConnect)
      client.off("disconnected", handleDisconnect)
      client.off("error", handleError)
      client.off("userJoined")
      client.off("userLeft")
    }
  }, [client])

  // Handle channel list updates
  useEffect(() => {
    if (!client) return

    const handleJoined = (channel: string) => {
      console.log(`Chat interface noticed channel joined: ${channel}`)
      setChannels((prev) => {
        if (!prev.includes(channel as Channel)) {
          const newChannels = [...prev, channel as Channel]
          // If this is the first channel, set it as current
          if (newChannels.length === 1 || !currentChannel) {
            console.log(`Setting current channel to: ${channel}`)
            setCurrentChannel(channel as Channel)
          }

          // Save to localStorage
          saveChannelsToLocalStorage(newChannels)
          return newChannels
        }
        return prev
      })

      // Add system message about joining
      const joinMessage: Message = {
        id: generateUniqueId(),
        channel,
        username: "system",
        displayName: "System",
        content: `Joined channel ${channel}`,
        color: "var(--color-success)",
        timestamp: new Date(),
        isCurrentUser: false,
        tags: {},
      }
      setMessages((prev) => [...prev, joinMessage])
    }

    const handleLeft = (channel: string) => {
      setChannels((prev) => {
        const updatedChannels = prev.filter((ch) => ch !== channel)
        // Save to localStorage
        saveChannelsToLocalStorage(updatedChannels)
        return updatedChannels
      })

      // If we left the current channel, switch to another one
      setCurrentChannel((current) => {
        if (current === channel) {
          const remainingChannels = channels.filter((ch) => ch !== channel)
          return remainingChannels.length > 0 ? remainingChannels[0] : null
        }
        return current
      })

      // Add system message about leaving
      const leaveMessage: Message = {
        id: generateUniqueId(),
        channel,
        username: "system",
        displayName: "System",
        content: `Left channel ${channel}`,
        color: "var(--color-error)",
        timestamp: new Date(),
        isCurrentUser: false,
        tags: {},
      }
      setMessages((prev) => [...prev, leaveMessage])
    }

    // Add event listeners
    client.on("joined", handleJoined)
    client.on("left", handleLeft)

    return () => {
      client.off("joined", handleJoined)
      client.off("left", handleLeft)
    }
  }, [client, channels, currentChannel, saveChannelsToLocalStorage])

  // Send message using TIRC
  const sendMessage = (content: string = messageInput) => {
    if (!content.trim() || !currentChannel || !client) return

    console.log(`Attempting to send message to ${currentChannel}: ${content}`)

    try {
      // Use TIRC's sendMessage
      tircSendMessage(currentChannel, content)

      // Add self message to the UI
      const selfMessage: Message = {
        id: generateUniqueId(),
        channel: currentChannel,
        username: client.getNick?.() || "butterbot",
        displayName: client.getNick?.() || "Butterbot",
        content: content,
        color: "var(--color-chat-self)",
        timestamp: new Date(),
        isCurrentUser: true,
        tags: {
          // Add any necessary tags for emote parsing
        },
      }
      setMessages(prev => [...prev, selfMessage])

      // Clear input field
      setMessageInput("")
    } catch (error) {
      console.error("Error sending message:", error)

      // Add error message to chat
      const errorMessage: Message = {
        id: generateUniqueId(),
        channel: currentChannel,
        username: "system",
        displayName: "System",
        content: `Failed to send message: ${
          error instanceof Error ? error.message : String(error)
        }`,
        color: "var(--color-error)",
        timestamp: new Date(),
        isCurrentUser: false,
        tags: {},
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  }

  // Join a new channel
  const joinChannel = () => {
    if (!newChannelInput.trim() || !isConnected || !client) return

    const channel = newChannelInput.startsWith("#")
      ? (newChannelInput as Channel)
      : (`#${newChannelInput}` as Channel)

    try {
      joinChannelSafely(channel)
      setNewChannelInput("")
    } catch (error) {
      console.error("Failed to join channel:", error)

      // Add error message
      const errorMessage: Message = {
        id: generateUniqueId(),
        channel: currentChannel || "#system",
        username: "system",
        displayName: "System",
        content: `Failed to join channel: ${
          error instanceof Error ? error.message : String(error)
        }`,
        color: "var(--color-error)",
        timestamp: new Date(),
        isCurrentUser: false,
        tags: {},
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  }

  // Leave a specific channel
  const leaveChannel = (channelToLeave: Channel) => {
    if (!isConnected || !client) return

    try {
      client.leave(channelToLeave)
    } catch (error) {
      console.error("Failed to leave channel:", error)
    }
  }

  // Move a channel up in the list
  const moveChannelUp = (channelToMove: Channel) => {
    setChannels((prevChannels) => {
      const index = prevChannels.indexOf(channelToMove)
      if (index <= 0) return prevChannels // Already at the top or not found

      const newChannels = [...prevChannels]
      // Swap the channel with the one above it
      ;[newChannels[index - 1], newChannels[index]] = [newChannels[index], newChannels[index - 1]]

      // Save the updated order to localStorage
      saveChannelsToLocalStorage(newChannels)

      return newChannels
    })
  }

  // Move a channel down in the list
  const moveChannelDown = (channelToMove: Channel) => {
    setChannels((prevChannels) => {
      const index = prevChannels.indexOf(channelToMove)
      if (index === -1 || index === prevChannels.length - 1) {
        return prevChannels // Not found or already at the bottom
      }

      const newChannels = [...prevChannels]
      // Swap the channel with the one below it
      ;[newChannels[index], newChannels[index + 1]] = [newChannels[index + 1], newChannels[index]]

      // Save the updated order to localStorage
      saveChannelsToLocalStorage(newChannels)

      return newChannels
    })
  }

  // Handle username click to show user popup
  const handleUsernameClick = (username: string) => {
    setSelectedUser(username)
    setShowUserPopup(true)
  }
  
  // Close user popup
  const handleCloseUserPopup = () => {
    setShowUserPopup(false)
    setSelectedUser(null)
  }

  // Convert messages to the format expected by UserMessagesPopup
  const formatMessagesForUserPopup = (username: string) => {
    if (!username) return []

    return messages
      .filter((msg) => msg.username === username && msg.username !== "system")
      .map((msg) => ({
        id: msg.id,
        nickname: msg.username,
        content: msg.content,
        timestamp: msg.timestamp,
        isAction: msg.content.startsWith("\u0001ACTION"), // Check for /me messages
        tags: msg.tags, // Include tags for emote parsing
      }))
  }

  // Show loading state if client is not yet available
  if (!client) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-text">
        <div className="text-center p-8 bg-surface rounded-lg">
          <div className="animate-spin h-12 w-12 border-4 border-t-transparent border-primary rounded-full mx-auto mb-4"></div>
          <p className="text-xl">Connecting to IRC server...</p>
          <p className="text-sm text-text-secondary mt-2">This may take a moment</p>
        </div>
      </div>
    )
  }

  // Show status message if joining channels is in progress
  const statusMessage = joinAttemptInProgress
    ? "Joining channels... This may take a moment"
    : emoteLoading
    ? "Loading emotes..."
    : connectionStatus

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className="flex flex-col h-screen bg-background text-text">
      {/* App header with connection status */}
      <Header
        isConnected={isConnected}
        connectionStatus={statusMessage}
        currentChannel={currentChannel}
        onToggleSidebar={toggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with channels */}
        <ChannelList
          channels={channels}
          currentChannel={currentChannel}
          setCurrentChannel={setCurrentChannel}
          newChannelInput={newChannelInput}
          setNewChannelInput={setNewChannelInput}
          joinChannel={joinChannel}
          leaveChannel={leaveChannel}
          moveChannelUp={moveChannelUp}
          moveChannelDown={moveChannelDown}
          isConnected={isConnected}
          collapsed={sidebarCollapsed}
        />

        {/* Main chat area */}
        <main className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
          {/* Messages area */}
          <MessageList
            messages={messages}
            currentChannel={currentChannel}
            onUsernameClick={handleUsernameClick}
          />

          {/* Message input with command popup */}
          <ChatInputWithCommandPopup channelName={currentChannel} onSendMessage={sendMessage} />
        </main>
      </div>

      {/* User messages popup */}
      {showUserPopup && selectedUser && (
        <UserMessagesPopup
          username={selectedUser}
          messages={formatMessagesForUserPopup(selectedUser)}
          onClose={handleCloseUserPopup}
        />
      )}
    </div>
  )
}

export default ChatInterface