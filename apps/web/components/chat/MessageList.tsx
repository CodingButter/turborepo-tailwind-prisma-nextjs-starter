'use client';

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Message } from "../../types/Message";
import { ArrowRight, Hash, Search } from "lucide-react";
import ChatSearchBar, { ChatFilters } from "./ChatSearchBar";
import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: Message[];
  currentChannel: `#${string}` | null;
  onUsernameClick?: (username: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  currentChannel, 
  onUsernameClick 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ChatFilters>({
    showJoinLeave: true,
    showTimestamps: true,
    highlightMentions: true,
    onlyFromUser: null,
  });
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);

  // Filter messages for the current channel
  useEffect(() => {
    if (!currentChannel) {
      setFilteredMessages([]);
      return;
    }

    // Start with channel-specific messages
    let result = messages.filter((msg) => msg.channel === currentChannel);

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (msg) =>
          msg.content.toLowerCase().includes(query) ||
          msg.username.toLowerCase().includes(query) ||
          msg.displayName.toLowerCase().includes(query)
      );
    }

    // Filter system messages (join/leave)
    if (!filters.showJoinLeave) {
      result = result.filter((msg) => msg.username !== "system");
    }

    // Filter by specific user
    if (filters.onlyFromUser) {
      result = result.filter(
        (msg) => msg.username.toLowerCase() === filters.onlyFromUser?.toLowerCase()
      );
    }

    setFilteredMessages(result);
  }, [messages, currentChannel, searchQuery, filters]);

  // Handle scroll to detect if user has scrolled up
  useEffect(() => {
    const handleScroll = () => {
      if (!messageListRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;
      const scrolledToBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;

      setIsAutoScrollEnabled(scrolledToBottom);
      setLastScrollPosition(scrollTop);
    };

    const messageList = messageListRef.current;
    if (messageList) {
      messageList.addEventListener("scroll", handleScroll);
      return () => messageList.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Scroll to bottom when messages change, but only if autoscroll is enabled
  useEffect(() => {
    if (isAutoScrollEnabled && !searchQuery && !filters.onlyFromUser) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else if (messageListRef.current) {
      // If autoscroll is disabled, maintain scroll position
      messageListRef.current.scrollTop = lastScrollPosition;
    }
  }, [filteredMessages, isAutoScrollEnabled, searchQuery, filters.onlyFromUser, lastScrollPosition]);

  // Handle search query changes
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: ChatFilters) => {
    setFilters(newFilters);
  }, []);

  // Handle username click to filter by user
  const handleUsernameClick = (username: string) => {
    if (onUsernameClick) {
      onUsernameClick(username);
    } else {
      // Toggle user filter
      if (filters.onlyFromUser === username) {
        setFilters((prev: ChatFilters) => ({ ...prev, onlyFromUser: null }));
      } else {
        setFilters((prev: ChatFilters) => ({ ...prev, onlyFromUser: username }));
      }
    }
  };

  if (!currentChannel) {
    // No channel selected view
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 bg-surface/50 rounded-lg border border-border max-w-md">
          <Hash className="h-16 w-16 mx-auto mb-6 text-primary" />
          <p className="text-text text-xl font-medium mb-2">No channel selected</p>
          <p className="text-text-secondary mb-6">
            Join a channel from the sidebar to start chatting
          </p>
          <div className="flex justify-center">
            <ArrowRight className="h-6 w-6 text-primary animate-bounce" />
          </div>
        </div>
      </div>
    );
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
              <Search className="h-12 w-12 mx-auto mb-4 text-primary" />
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
  );
};

export default MessageList;