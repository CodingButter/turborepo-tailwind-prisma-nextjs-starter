'use client'

import { useContext, createContext } from "react";
import { TIRCClient } from "../lib/TIRCClient";
import { IEmote } from "../utils/emoteUtils";
/**
 * Defines the structure of a chat message.
 */
export interface IMessage {
  id: string;
  user: string;
  channel: string;
  rawMessage: string;
  formattedMessage: string;
  emotes: IEmote[];
}

export interface TIRCContextType {
  client: TIRCClient | null;
  sendMessage: (channel: `#${string}`, message: string) => void;
  messages: IMessage[];
  clientId: string;
}

export const TIRCContext = createContext<TIRCContextType | null>(null);
export const useTIRC = () => {
  const context = useContext(TIRCContext);

  if (!context) {
    throw new Error("useTIRC must be used within a TIRCProvider");
  }

  return context; // Exposes { messages, sendMessage, clientId, client }
};