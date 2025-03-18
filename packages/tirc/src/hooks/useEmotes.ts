'use client'

import { useContext, createContext } from "react";
import { IEmote } from "../";

export interface EmoteContextType {
  emotes: IEmote[];
  isLoading: boolean;
  fetchEmotes: (channelId?: string) => void;
  getEmote: (name: string) => IEmote | undefined;
}

export const EmoteContext = createContext<EmoteContextType>({
  emotes: [],
  isLoading: false,
  fetchEmotes: () => {},
  getEmote: () => undefined
});

/**
 * Hook to access emote data.
 */
export const useEmotes = () => {
  const context = useContext(EmoteContext);
  return context;
};