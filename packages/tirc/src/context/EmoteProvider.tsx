'use client'

import React, { useState, useEffect, useContext, useCallback } from "react";
import { 
  fetchBTTVGlobalEmotes, 
  fetchFFZGlobalEmotes, 
  fetchTwitchEmotes, 
  IEmote,
  fetchBTTVChannelEmotes,
  fetchFFZChannelEmotes
} from "../";
import { EmoteContext } from "../hooks/useEmotes";
import { TIRCContext } from "../hooks/useTIRC";

export const EmoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [emotes, setEmotes] = useState<IEmote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const tircContext = useContext(TIRCContext);
  const [lastChannelId, setLastChannelId] = useState<string | null>(null);

  // Get clientId from TIRCContext
  const clientId = tircContext?.clientId || "";
  const oauthToken = tircContext?.client?.getOAuthToken?.() || "";

  /**
   * Fetches global and channel-specific emotes.
   */
  const fetchEmotes = useCallback(async (channelId?: string) => {
    setIsLoading(true);
    const allEmotes: IEmote[] = [];
    
    try {
      console.log("Fetching emotes...");
      // Always fetch global emotes
      const bttvGlobal = await fetchBTTVGlobalEmotes();
      console.log(`Fetched ${bttvGlobal.length} BTTV global emotes`);
      allEmotes.push(...bttvGlobal);
      
      const ffzGlobal = await fetchFFZGlobalEmotes();
      console.log(`Fetched ${ffzGlobal.length} FFZ global emotes`);
      allEmotes.push(...ffzGlobal);
      
      // If we have a channel ID, fetch channel-specific emotes
      if (channelId) {
        try {
          const bttvChannel = await fetchBTTVChannelEmotes("twitch", channelId);
          console.log(`Fetched ${bttvChannel.length} BTTV channel emotes for channel ${channelId}`);
          allEmotes.push(...bttvChannel);
          
          const ffzChannel = await fetchFFZChannelEmotes(channelId);
          console.log(`Fetched ${ffzChannel.length} FFZ channel emotes for channel ${channelId}`);
          allEmotes.push(...ffzChannel);
          
          setLastChannelId(channelId);
        } catch (error) {
          console.warn("Failed to fetch channel-specific emotes:", error);
        }
      }
      
      // Only attempt to fetch Twitch emotes if we have both clientId and oauthToken
      if (clientId && oauthToken) {
        try {
          const twitchEmotes = await fetchTwitchEmotes(clientId, oauthToken);
          console.log(`Fetched ${twitchEmotes.length} Twitch emotes`);
          allEmotes.push(...twitchEmotes);
        } catch (error) {
          console.warn("Failed to fetch Twitch emotes:", error);
        }
      } else {
        console.warn("Missing Twitch credentials, skipping Twitch emotes");
      }
      
      console.log(`Total emotes fetched: ${allEmotes.length}`);
      setEmotes(allEmotes);
    } catch (error) {
      console.error("Error fetching emotes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [clientId, oauthToken]);

  // Fetch emotes on initial load
  useEffect(() => {
    fetchEmotes();
  }, [fetchEmotes]);

  // Re-fetch when the client connects
  useEffect(() => {
    if (tircContext?.client) {
      const handleConnect = () => {
        console.log("Client connected, fetching emotes");
        fetchEmotes();
      };
      
      tircContext.client.on("connected", handleConnect);
      return () => {
        tircContext.client.off("connected", handleConnect);
      };
    }
  }, [tircContext?.client, fetchEmotes]);

  // A function to get emote by name
  const getEmote = useCallback((name: string): IEmote | undefined => {
    return emotes.find(emote => 
      emote.name.toLowerCase() === name.toLowerCase()
    );
  }, [emotes]);

  return (
    <EmoteContext.Provider value={{ 
      emotes, 
      isLoading, 
      fetchEmotes,
      getEmote 
    }}>
      {children}
    </EmoteContext.Provider>
  );
};