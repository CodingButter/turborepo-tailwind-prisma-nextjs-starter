'use client'

import { useContext, createContext } from "react"
import { IEmote } from "../utils/emoteUtils";

export interface EmoteContextType {
  emotes: IEmote[];
  isLoading: boolean;
  fetchEmotes: () => void;
}

export const EmoteContext = createContext<EmoteContextType | null>(null);


/**
 * Hook to access emote data.
 */
export const useEmotes = () => {
  const context = useContext(EmoteContext);

  if (!context) {
    throw new Error("useEmotes must be used within an EmoteProvider");
  }

  const { emotes, isLoading, fetchEmotes } = context;

  /**
   * Retrieves an emote by name.
   * @param name - The emote name.
   */
  const getEmote = (name: string): IEmote | undefined => {
    return emotes.find((emote) => emote.name.toLowerCase() === name.toLowerCase());
  };

  return { emotes, isLoading, fetchEmotes, getEmote };
};