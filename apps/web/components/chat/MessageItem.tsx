'use client';

import React from "react";
import Image from "next/image";
import { parseEmotes, getTwitchEmoteUrl, splitMessageWithEmotes } from "@repo/tirc";
import { Message } from "../../types/Message";
import { ThirdPartyEmote, ChannelEmote } from "../../types/Message";

interface MessageItemProps {
  message: Message;
  onUsernameClick: (username: string) => void;
  showTimestamp?: boolean;
  highlightMentions?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onUsernameClick,
  showTimestamp = true,
  highlightMentions = false,
}) => {
  // Manually implement third-party emote finding
  const findThirdPartyEmotes = (message: string): Array<string | ThirdPartyEmote> => {
    // Default empty emote map to satisfy TypeScript
    const channelEmotes: Record<string, ChannelEmote> = {};
    const words = message.split(" ");
    const parts: Array<string | ThirdPartyEmote> = [];

    for (const word of words) {
      if (channelEmotes[word]) {
        parts.push({
          type: "emote",
          code: word,
          url: channelEmotes[word].url,
        });
      } else {
        // If the last part is a string, append to it
        const lastPart = parts[parts.length - 1];
        if (typeof lastPart === "string") {
          parts[parts.length - 1] = `${lastPart} ${word}`;
        } else {
          parts.push(word);
        }
      }
    }

    return parts;
  };

  // If it's a system message, render differently
  if (message.username === "system") {
    return (
      <div className="text-text-tertiary text-sm">
        {showTimestamp && (
          <span className="mr-2 text-xs">
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
        {message.content}
      </div>
    );
  }

  // Parse Twitch emotes from the tags
  const twEmotes = parseEmotes(message.tags.emotes, message.content);

  // Create a memoization cache for this render cycle
  const emoteCache = new Map<string, React.ReactNode>();

  // Render message content with emotes
  const renderMessageContent = () => {
    // If there are Twitch emotes, process them
    if (twEmotes.length) {
      // Split the message into parts (text and emotes)
      const messageParts = splitMessageWithEmotes(message.content, twEmotes);

      return (
        <p className="break-words flex flex-wrap items-center">
          {messageParts.map((part: string | any, index: number) => {
            if (typeof part === "string") {
              // Process this text part for third-party emotes
              const channelId = message.tags["room-id"] || "";

              if (channelId) {
                const thirdPartyParts = findThirdPartyEmotes(part);

                return (
                  <React.Fragment key={index}>
                    {thirdPartyParts.map((tpPart: string | ThirdPartyEmote, tpIndex: number) => {
                      if (typeof tpPart === "string") {
                        return <span key={`${index}-${tpIndex}`}>{tpPart}</span>;
                      } else {
                        // It's a third-party emote
                        const cacheKey = `tp-${tpPart.code}-${tpPart.url}`;

                        if (!emoteCache.has(cacheKey)) {
                          emoteCache.set(
                            cacheKey,
                            <span className="inline-block mx-1 align-middle relative w-7 h-7">
                              <Image
                                src={tpPart.url}
                                alt={tpPart.code}
                                title={tpPart.code}
                                width={28}
                                height={28}
                                loading="lazy"
                              />
                            </span>
                          );
                        }

                        return <span key={`${index}-${tpIndex}`}>{emoteCache.get(cacheKey)}</span>;
                      }
                    })}
                  </React.Fragment>
                );
              }

              return <span key={index}>{part}</span>;
            } else {
              // It's a Twitch emote
              const cacheKey = `tw-${part.id}-${part.code}`;

              if (!emoteCache.has(cacheKey)) {
                emoteCache.set(
                  cacheKey,
                  <span className="inline-block mx-1 align-middle relative w-7 h-7">
                    <Image
                      src={getTwitchEmoteUrl(part.id, "1.0")}
                      alt={part.code}
                      title={part.code}
                      width={28}
                      height={28}
                      loading="lazy"
                    />
                  </span>
                );
              }

              return <span key={index}>{emoteCache.get(cacheKey)}</span>;
            }
          })}
        </p>
      );
    } else {
      // No Twitch emotes, check for third-party emotes
      const channelId = message.tags["room-id"] || "";

      if (channelId) {
        const thirdPartyParts = findThirdPartyEmotes(message.content);

        return (
          <p className="break-words flex flex-wrap items-center">
            {thirdPartyParts.map((part: string | ThirdPartyEmote, index: number) => {
              if (typeof part === "string") {
                return <span key={index}>{part}</span>;
              } else {
                const cacheKey = `tp-${part.code}-${part.url}`;

                if (!emoteCache.has(cacheKey)) {
                  emoteCache.set(
                    cacheKey,
                    <span className="inline-block mx-1 align-middle relative w-7 h-7">
                      <Image
                        src={part.url}
                        alt={part.code}
                        title={part.code}
                        width={28}
                        height={28}
                        loading="lazy"
                      />
                    </span>
                  );
                }

                return <span key={index}>{emoteCache.get(cacheKey)}</span>;
              }
            })}
          </p>
        );
      }

      // No emotes at all, just render the text
      return <p className="break-words">{message.content}</p>;
    }
  };

  return (
    <div
      className={`flex items-start space-x-2 p-4 rounded-md ${
        message.isCurrentUser ? "bg-chat-self/10" : "bg-background-secondary"
      } ${highlightMentions && message.content.includes('@') ? "border-l-4 border-l-chat-mention" : ""}`}
    >
      {/* Profile Picture with Click Handler */}
      {message.profileImage ? (
        <div className="w-8 h-8 relative rounded-full overflow-hidden">
          <Image
            src={message.profileImage}
            alt={`${message.username || 'User'}'s profile`}
            fill
            sizes="32px"
            className="object-cover cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onUsernameClick(message.username)}
          />
        </div>
      ) : (
        <div
          className="w-8 h-8 rounded-full bg-background-tertiary flex items-center justify-center text-text-secondary cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onUsernameClick(message.username)}
        >
          {message.username?.[0]?.toUpperCase() || '?'}
        </div>
      )}

      {/* Message Content */}
      <div className="flex-1">
        {/* Username */}
        <div className="flex items-center space-x-2">
          <span
            className="font-semibold cursor-pointer hover:text-primary"
            onClick={() => onUsernameClick(message.username)}
            style={{ color: message.color || "inherit" }}
          >
            {message.displayName || message.username || 'Unknown User'}
          </span>
          {/* Timestamp */}
          {showTimestamp && (
            <span className="text-xs text-text-secondary">
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        {/* Message Text */}
        {renderMessageContent()}
      </div>
    </div>
  );
};

export default MessageItem;