'use client'

import React, { useEffect, useRef, useState } from "react";
import { TIRCClient, ITIRCClientConfig } from "../lib/TIRCClient";
import { formatMessageWithEmotes, extractEmotesFromMessage } from "../utils/emoteUtils";
import { IMessage, TIRCContext } from "../hooks/useTIRC";


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
    ircClient.on("messageReceived", ({ user, message, channel }) => {
      const formattedMessage = formatMessageWithEmotes(message, []); // Placeholder for emotes
      const newMessage: IMessage = {
        id: `${Date.now()}-${Math.random()}`, // Unique ID
        user,
        channel,
        rawMessage: message,
        formattedMessage,
        emotes: extractEmotesFromMessage(message, []), // Placeholder for emote processing
      };
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      ircClient.disconnect();
    };
  }, [config]);

  /**
   * Sends a chat message.
   */
  const sendMessage = (channel: `#${string}`, message: string) => {
    clientRef.current?.sendMessage(channel, message);
  };

  return (
    <TIRCContext.Provider value={{ client, sendMessage, messages, clientId: config.clientId }}>
      {children}
    </TIRCContext.Provider>
  );
};