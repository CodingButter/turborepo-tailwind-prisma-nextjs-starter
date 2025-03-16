'use client'

import React, { useState, useEffect, useContext } from "react";
import { fetchBTTVGlobalEmotes, fetchFFZGlobalEmotes, fetchTwitchEmotes, IEmote } from "../utils/emoteUtils";
import { EmoteContext } from "../hooks/useEmotes";
import { TIRCContext } from "../hooks/useTIRC";

export const EmoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [emotes, setEmotes] = useState<IEmote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const tircContext = useContext(TIRCContext);

  // Get clientId from TIRCContext
  const clientId = tircContext?.clientId || "";
  const oauthToken = tircContext?.client?.getOAuthToken?.() || "";

  useEffect(() => {
    if (clientId && oauthToken) {
      fetchEmotes();
    }
  }, [clientId, oauthToken]);

  /**
   * Fetches global and channel-specific emotes.
   */
  const fetchEmotes = async () => {
    setIsLoading(true);
    try {
      const bttvGlobal = await fetchBTTVGlobalEmotes();
      const ffzGlobal = await fetchFFZGlobalEmotes();
      
      // Only attempt to fetch Twitch emotes if we have both clientId and oauthToken
      let twitchEmotes: IEmote[] = [];
      if (clientId && oauthToken) {
        try {
          twitchEmotes = await fetchTwitchEmotes(clientId, oauthToken);
        } catch (error) {
          console.warn("Failed to fetch Twitch emotes:", error);
          // Continue with other emotes even if Twitch emotes fail
        }
      } else {
        console.warn("Missing Twitch credentials, skipping Twitch emotes");
      }
      
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