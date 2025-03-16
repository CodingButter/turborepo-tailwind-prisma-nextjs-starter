'use client'

import React, { useState, useEffect } from "react";
import { fetchBTTVGlobalEmotes, fetchFFZGlobalEmotes, fetchTwitchEmotes, IEmote } from "../utils/emoteUtils";
import { EmoteContext } from "../hooks/useEmotes"

export const EmoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [emotes, setEmotes] = useState<IEmote[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchEmotes();
  }, []);

  /**
   * Fetches global and channel-specific emotes.
   */
  const fetchEmotes = async () => {
    setIsLoading(true);
    try {
      const [bttvGlobal, ffzGlobal, twitchEmotes] = await Promise.all([
        fetchBTTVGlobalEmotes(),
        fetchFFZGlobalEmotes(),
        fetchTwitchEmotes("your-client-id", "your-oauth-token"),
      ]);
      setEmotes([...bttvGlobal, ...ffzGlobal, ...twitchEmotes]);
    } catch (error) {
      console.error("Error fetching emotes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <EmoteContext.Provider value={{ emotes, isLoading, fetchEmotes }}>
      {children}
    </EmoteContext.Provider>
  );
};