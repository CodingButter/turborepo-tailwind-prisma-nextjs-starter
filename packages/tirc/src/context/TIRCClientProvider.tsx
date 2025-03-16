'use client'

import React, { useEffect, useRef, useState } from "react";
import { TIRCClient, ITIRCClientConfig } from "../lib/TIRCClient";
import { IMessage, TIRCContext, Channel } from "../hooks/useTIRC";
import { IEmote } from "../utils/emoteUtils";

// Helper functions to replace missing imports
const formatMessageWithEmotes = (message: string, emotes: IEmote[]): string => {
  if (!message || !emotes.length) return message;
  
  return emotes.reduce((formattedMessage, emote) => {
    const regex = new RegExp(`\\b${emote.name}\\b`, 'g');
    return formattedMessage.replace(
      regex,
      `<img src="${emote.urls["1x"] || ""}" class="message-emote" data-name="${emote.name}" />`
    );
  }, message);
};

const extractEmotesFromMessage = (message: string, emotes: IEmote[]): IEmote[] => {
  if (!message || !emotes.length) return [];
  return emotes.filter((emote) => message.includes(emote.name));
};

// Helper to ensure a string is a valid Channel
export function ensureChannel(value: string): Channel {
  if (!value.startsWith('#')) {
    return `#${value}` as Channel;
  }
  return value as Channel;
}

export const TIRCClientProvider: React.FC<{ config: ITIRCClientConfig; children: React.ReactNode }> = ({
  config,
  children,
}) => {
  const [client, setClient] = useState<TIRCClient | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const clientRef = useRef<TIRCClient | null>(null);

  useEffect(() => {
    if (!config.oauthToken || !config.nick || !config.clientId) {
      console.warn("TIRCProvider: Missing required config parameters.");
      return;
    }

    const ircClient = new TIRCClient(config);
    clientRef.current = ircClient;
    setClient(ircClient);

    ircClient.connect().catch((err) => console.error("Error connecting to Twitch IRC:", err));

    // Listen for incoming chat messages
    ircClient.on("messageReceived", ({ user, message, channel, tags }) => {
      const formattedMessage = formatMessageWithEmotes(message, []); // Placeholder for emotes
      const newMessage: IMessage = {
        id: `${Date.now()}-${Math.random()}`, // Unique ID
        user,
        channel,
        rawMessage: message,
        formattedMessage,
        emotes: extractEmotesFromMessage(message, []), // Placeholder for emote processing
        tags,
      };
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      ircClient.disconnect();
    };
  }, [config]);

  /**
   * Sends a chat message.
   * Ensures channel is properly typed as Channel before sending
   */
  const sendMessage = (channel: Channel, message: string) => {
    if (!clientRef.current) return;
    
    // We know channel is already properly typed as Channel here
    clientRef.current.sendMessage(channel, message);
  };

  return (
    <TIRCContext.Provider value={{ 
      client, 
      sendMessage, 
      messages, 
      clientId: config.clientId,
      oauthToken: config.oauthToken
    }}>
      {children}
    </TIRCContext.Provider>
  );
};