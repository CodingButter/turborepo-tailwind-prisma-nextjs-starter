"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTIRC, useEmotes } from "@repo/tirc";
import { Channel, Message as TIRCMessage } from "@repo/tirc/typings"; // Import types from TIRC
import { useSearchParams } from "next/navigation";
import { useSidebarState } from "../hooks/useSidebarState";

// Import components correctly (not using default imports if they don't exist)
import * as MessageListModule from "./chat/MessageList";
import ChannelList from "./chat/ChannelList";
import Header from "./chat/Header";
import ChatInputWithCommandPopup from "./chat/ChatInputWithCommandPopup";
import UserMessagesPopup from "./chat/UserMessagesPopup";
import { Message } from "../types/Message";

// Extract the component from the module if it's not a default export
const MessageList = MessageListModule.default || MessageListModule.MessageList;

// Type for the events in TIRC client
interface TIRCEvent {
  channel: string;
  user: string;
  message?: string;
  timestamp?: number;
  reason?: string;
}

// Simplified TIRC client interface - only include what we need
interface SimpleTircClient {
  sendMessage: (channel: Channel, message: string) => void;
  on: (event: string, callback: (data: TIRCEvent) => void) => void;
  off: (event: string, callback: (data: TIRCEvent) => void) => void;
  getNick?: () => string;
}

// Type guard for checking if a string is a valid channel
function isChannel(value: string | null | undefined): value is Channel {
  return typeof value === 'string' && value.startsWith('#');
}

// Force a string to be a valid channel
function asChannel(value: string): Channel {
  if (!value.startsWith('#')) {
    return `#${value}` as Channel;
  }
  return value as Channel;
}

const ChatInterface: React.FC = () => {
  const { client, sendMessage: tircSendMessage, messages: tircMessages } = useTIRC();
  const { isLoading: emoteLoading } = useEmotes();
  const [sidebarCollapsed, setSidebarCollapsed] = useSidebarState(false);
  const searchParams = useSearchParams();

  const [messages, setMessages] = useState<Message[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [newChannelInput, setNewChannelInput] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [initialChannelsJoined, setInitialChannelsJoined] = useState(false);
  const [joinAttemptInProgress, setJoinAttemptInProgress] = useState(false);

  // User popup state
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const initialJoinTimeoutRef = useRef<number | null>(null);

  // Cast client to our simplified interface
  const tircClient = client as SimpleTircClient | null;

  // Generate a unique ID for messages
  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Save channels to localStorage
  const saveChannelsToLocalStorage = useCallback((channelList: Channel[]) => {
    try {
      localStorage.setItem("twitchJoinedChannels", JSON.stringify(channelList));
    } catch (error) {
      console.error("Failed to save channels to localStorage:", error);
    }
  }, []);

  // Join a channel safely - use sendMessage method instead of join
  const joinChannelSafely = useCallback(
    async (channelToJoin: Channel) => {
      if (!tircClient || !isConnected) {
        console.log("Cannot join channel - client not available or not connected");
        return false;
      }

      try {
        console.log(`Safely joining channel: ${channelToJoin}`);
        tircClient.sendMessage(channelToJoin, `/join ${channelToJoin}`);
        console.log(`Successfully joined: ${channelToJoin}`);
        return true;
      } catch (error) {
        console.error(`Error joining channel ${channelToJoin}:`, error);
        return false;
      }
    },
    [tircClient, isConnected]
  );

  // Process TIRC messages into our app format
  useEffect(() => {
    if (!tircMessages || tircMessages.length === 0) return;
    
    // Get the most recent message with proper null checking
    const latestMessage = tircMessages[tircMessages.length - 1];
    if (!latestMessage) return;
    
    // Convert to our app's message format
    const newMessage: Message = {
      id: latestMessage.id || generateUniqueId(),
      channel: latestMessage.channel,
      username: latestMessage.user.toLowerCase(),
      displayName: latestMessage.user,
      content: latestMessage.rawMessage,
      color: "#FFFFFF", // Default color
      timestamp: new Date(),
      isCurrentUser: false,
      badges: "",
      profileImage: null,
      tags: (latestMessage as TIRCMessage).tags || {}, // Use TIRCMessage type
    };
    
    setMessages(prev => [...prev, newMessage]);
  }, [tircMessages]);

  // Handle initial joining of channels from URL parameters
  useEffect(() => {
    if (!tircClient || !isConnected || initialChannelsJoined || joinAttemptInProgress) return;

    const joinChannelsFromUrl = async () => {
      setJoinAttemptInProgress(true);

      // Get channels from URL
      const channelsParam = searchParams.get("channels");
      let channelsToJoin: Channel[] = [];

      if (channelsParam) {
        console.log("Found channels in URL:", channelsParam);
        // Split by comma and format as channels
        channelsToJoin = channelsParam
          .split(",")
          .map((channel) => channel.trim())
          .filter((channel) => channel.length > 0)
          .map(asChannel);

        console.log("Parsed channels to join:", channelsToJoin);
      }

      // If no channels in URL, try to get from localStorage
      if (channelsToJoin.length === 0) {
        try {
          const savedChannels = localStorage.getItem("twitchJoinedChannels");
          if (savedChannels) {
            const parsed = JSON.parse(savedChannels);
            if (Array.isArray(parsed)) {
              channelsToJoin = parsed
                .filter((ch): ch is string => typeof ch === 'string')
                .map(asChannel);
            }
            console.log("Using channels from localStorage:", channelsToJoin);
          }
        } catch (error) {
          console.error("Failed to load channels from localStorage:", error);
        }
      }

      // Join each channel with a delay
      if (channelsToJoin.length > 0) {
        console.log("Will join these channels:", channelsToJoin);
        setInitialChannelsJoined(true); // Mark as joined immediately to prevent duplicate attempts

        for (let i = 0; i < channelsToJoin.length; i++) {
          // IIFE to capture the current index
          ;((index) => {
            setTimeout(async () => {
              // Safe to access - we've checked array.length > 0
              const channel = channelsToJoin[index];
              await joinChannelSafely(channel);

              // If this is the last channel, clear the flag
              if (index === channelsToJoin.length - 1) {
                setJoinAttemptInProgress(false);
              }
            }, index * 2000); // 2 second delay between each join
          })(i);
        }
      } else {
        setJoinAttemptInProgress(false);
      }
    };

    // Wait a bit after connection before joining channels to ensure WebSocket is fully ready
    initialJoinTimeoutRef.current = window.setTimeout(() => {
      joinChannelsFromUrl();
    }, 3000); // Allow 3 seconds for connection to fully establish

    return () => {
      if (initialJoinTimeoutRef.current) {
        clearTimeout(initialJoinTimeoutRef.current);
        initialJoinTimeoutRef.current = null;
      }
    };
  }, [
    tircClient,
    isConnected,
    initialChannelsJoined,
    searchParams,
    joinChannelSafely,
    joinAttemptInProgress,
  ]);

  // Set up connection status when client changes
  useEffect(() => {
    if (!tircClient) {
      console.log("No IRC client available");
      return;
    }

    console.log("IRC client is available, setting up event handlers");

    // Set initial connection state
    setConnectionStatus("Connected");
    setIsConnected(true);

    const handleConnect = () => {
      setIsConnected(true);
      setConnectionStatus("Connected");
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setConnectionStatus("Disconnected");
      setInitialChannelsJoined(false);
      setJoinAttemptInProgress(false);
    };

    const handleError = (error: { message: string }) => {
      setConnectionStatus(`Error: ${error.message}`);
    };

    const handleUserJoined = (data: TIRCEvent) => {
      // Add system message for user join
      const joinMessage: Message = {
        id: generateUniqueId(),
        channel: data.channel,
        username: "system",
        displayName: "System",
        content: `${data.user} joined the channel`,
        color: "var(--color-success)",
        timestamp: new Date(),
        isCurrentUser: false,
        tags: {},
      };
      setMessages(prev => [...prev, joinMessage]);
    };

    const handleUserLeft = (data: TIRCEvent) => {
      // Add system message for user leave
      const leftMessage: Message = {
        id: generateUniqueId(),
        channel: data.channel,
        username: "system",
        displayName: "System",
        content: `${data.user} left the channel`,
        color: "var(--color-error)",
        timestamp: new Date(),
        isCurrentUser: false,
        tags: {},
      };
      setMessages(prev => [...prev, leftMessage]);
    };

    // Helper function for safe event registration
    const safeOn = (event: string, handler: (data: TIRCEvent) => void) => {
      tircClient.on(event, handler);
    };

    // Helper function for safe event deregistration
    const safeOff = (event: string, handler: (data: TIRCEvent) => void) => {
      tircClient.off(event, handler);
    };

    // Fix: Register event handlers with proper parameters
    safeOn("connected", handleConnect);
    safeOn("disconnected", handleDisconnect);
    safeOn("error", handleError);
    safeOn("userJoined", handleUserJoined);
    safeOn("userLeft", handleUserLeft);

    return () => {
      safeOff("connected", handleConnect);
      safeOff("disconnected", handleDisconnect);
      safeOff("error", handleError);
      safeOff("userJoined", handleUserJoined);
      safeOff("userLeft", handleUserLeft);
    };
  }, [tircClient]);

  // Handle channel list updates
  useEffect(() => {
    if (!tircClient) return;

    const handleJoined = (channelName: string) => {
      // Convert to proper channel type
      const channel = asChannel(channelName);
      
      console.log(`Chat interface noticed channel joined: ${channel}`);
      
      setChannels((prev) => {
        if (!prev.includes(channel)) {
          const newChannels = [...prev, channel];
          // If this is the first channel, set it as current
          if (newChannels.length === 1 || !currentChannel) {
            console.log(`Setting current channel to: ${channel}`);
            setCurrentChannel(channel);
          }

          // Save to localStorage
          saveChannelsToLocalStorage(newChannels);
          return newChannels;
        }
        return prev;
      });

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
      };
      setMessages((prev) => [...prev, joinMessage]);
    };

    const handleLeft = (channelName: string) => {
      // Convert to proper channel type
      const channel = asChannel(channelName);
      
      setChannels((prev) => {
        const updatedChannels = prev.filter((ch) => ch !== channel);
        // Save to localStorage
        saveChannelsToLocalStorage(updatedChannels);
        return updatedChannels;
      });

      // Fixed: Make sure we never return undefined
      setCurrentChannel((current) => {
        if (current === channel) {
          // Get remaining channels
          const remainingChannels = channels.filter((ch) => ch !== channel);
          // Return first channel if available, null otherwise
          return remainingChannels.length > 0 ? remainingChannels[0] : null;
        }
        // No change needed
        return current;
      });

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
      };
      setMessages((prev) => [...prev, leaveMessage]);
    };

    // Helper functions for safe event registration
    const safeOn = (event: string, handler: (data: string) => void) => {
      tircClient.on(event, handler as any);
    };

    const safeOff = (event: string, handler: (data: string) => void) => {
      tircClient.off(event, handler as any);
    };

    // Add event listeners using our safe wrapper
    safeOn("joined", handleJoined);
    safeOn("left", handleLeft);

    return () => {
      // Remove event listeners using our safe wrapper
      safeOff("joined", handleJoined);
      safeOff("left", handleLeft);
    };
  }, [tircClient, channels, currentChannel, saveChannelsToLocalStorage]);

  // Send message function
  const sendMessage = (content: string = messageInput) => {
    if (!content.trim() || !currentChannel || !tircClient) return;

    console.log(`Attempting to send message to ${currentChannel}: ${content}`);

    try {
      // Use TIRC's sendMessage
      tircSendMessage(currentChannel, content);

      // Add self message to the UI
      const username = tircClient.getNick?.() || "butterbot";
      
      const selfMessage: Message = {
        id: generateUniqueId(),
        channel: currentChannel,
        username: username,
        displayName: username,
        content: content,
        color: "var(--color-chat-self)",
        timestamp: new Date(),
        isCurrentUser: true,
        tags: {},
      };
      setMessages(prev => [...prev, selfMessage]);

      // Clear input field
      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);

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
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  // Join a new channel
  const joinChannel = () => {
    if (!newChannelInput.trim() || !isConnected || !tircClient) return;

    // Ensure the channel has the correct format
    const channel = asChannel(newChannelInput);

    try {
      joinChannelSafely(channel);
      setNewChannelInput("");
    } catch (error) {
      console.error("Failed to join channel:", error);

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
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  // Leave a specific channel
  const leaveChannel = (channelToLeave: Channel) => {
    if (!isConnected || !tircClient) return;

    try {
      // Use sendMessage to send a PART command
      tircClient.sendMessage(channelToLeave, `/part ${channelToLeave}`);
    } catch (error) {
      console.error("Failed to leave channel:", error);
    }
  };

  // Move a channel up in the list
  const moveChannelUp = (channelToMove: Channel) => {
    setChannels((prevChannels) => {
      const index = prevChannels.indexOf(channelToMove);
      if (index <= 0) return prevChannels; // Already at the top or not found

      const newChannels = [...prevChannels];
      // Swap the channel with the one above it
      [newChannels[index - 1], newChannels[index]] = [newChannels[index], newChannels[index - 1]];

      // Save the updated order to localStorage
      saveChannelsToLocalStorage(newChannels);

      return newChannels;
    });
  };

  // Move a channel down in the list
  const moveChannelDown = (channelToMove: Channel) => {
    setChannels((prevChannels) => {
      const index = prevChannels.indexOf(channelToMove);
      if (index === -1 || index === prevChannels.length - 1) {
        return prevChannels; // Not found or already at the bottom
      }

      const newChannels = [...prevChannels];
      // Swap the channel with the one below it
      [newChannels[index], newChannels[index + 1]] = [newChannels[index + 1], newChannels[index]];

      // Save the updated order to localStorage
      saveChannelsToLocalStorage(newChannels);

      return newChannels;
    });
  };

  // Handle username click to show user popup
  const handleUsernameClick = (username: string) => {
    setSelectedUser(username);
    setShowUserPopup(true);
  };
  
  // Close user popup
  const handleCloseUserPopup = () => {
    setShowUserPopup(false);
    setSelectedUser(null);
  };

  // Format messages for UserMessagesPopup
  const formatMessagesForUserPopup = (username: string) => {
    if (!username) return [];

    return messages
      .filter((msg) => msg.username === username && msg.username !== "system")
      .map((msg) => ({
        id: msg.id,
        nickname: msg.username,
        content: msg.content,
        timestamp: msg.timestamp,
        isAction: msg.content.startsWith("\u0001ACTION"), // Check for /me messages
        tags: msg.tags, // Include tags for emote parsing
      }));
  };

  // Show loading state if client is not yet available
  if (!tircClient) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-text">
        <div className="text-center p-8 bg-surface rounded-lg">
          <div className="animate-spin h-12 w-12 border-4 border-t-transparent border-primary rounded-full mx-auto mb-4"></div>
          <p className="text-xl">Connecting to IRC server...</p>
          <p className="text-sm text-text-secondary mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  // Show status message if joining channels is in progress
  const statusMessage = joinAttemptInProgress
    ? "Joining channels... This may take a moment"
    : emoteLoading
    ? "Loading emotes..."
    : connectionStatus;

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

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
          <ChatInputWithCommandPopup 
            channelName={currentChannel} 
            onSendMessage={sendMessage} 
          />
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
  );
};

export default ChatInterface;