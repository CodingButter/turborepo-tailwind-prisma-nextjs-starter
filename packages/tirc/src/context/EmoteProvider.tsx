'use client'

import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
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
  const lastChannelIdRef = useRef<string | null>(null);
  const fetchCountRef = useRef(0);
  const isMountedRef = useRef(true);

  // Get clientId from TIRCContext
  const clientId = tircContext?.clientId || "";
  const oauthToken = tircContext?.client?.getOAuthToken?.() || "";

  /**
   * Fetches global and channel-specific emotes.
   */
  const fetchEmotes = useCallback(async (channelId?: string) => {
    // Prevent fetching if already loading or same channel
    if (isLoading) return;
    if (channelId && channelId === lastChannelIdRef.current) return;
    
    // Track fetch count to detect loops
    fetchCountRef.current += 1;
    if (fetchCountRef.current > 10) {
      console.warn("Too many emote fetch attempts, aborting to prevent infinite loop");
      return;
    }
    
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
          
          lastChannelIdRef.current = channelId;
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
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setEmotes(allEmotes);
      }
    } catch (error) {
      console.error("Error fetching emotes:", error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [clientId, oauthToken, isLoading]); // Remove isLoading from dependencies to prevent loops

  // Fetch emotes on initial load - ONCE
  useEffect(() => {
    fetchEmotes();
    
    // Reset fetch count after initial load
    setTimeout(() => {
      fetchCountRef.current = 0;
    }, 5000);
    
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchEmotes]); // Empty dependency array to run ONCE

  // Re-fetch when the client connects - with safeguards
  useEffect(() => {
    const client = tircContext?.client;
    if (!client) return;
    
    const handleConnect = () => {
      console.log("Client connected, fetching emotes");
      // Reset fetch count on connection event
      fetchCountRef.current = 0;
      fetchEmotes();
    };
    
    client.on("connected", handleConnect);
    return () => {
      client.off("connected", handleConnect);
    };
  }, [tircContext?.client,fetchEmotes]); // Only depend on client reference

  // A function to get emote by name
  const getEmote = useCallback((name: string): IEmote | undefined => {
    return emotes.find(emote => 
      emote.name.toLowerCase() === name.toLowerCase()
    );
  }, [emotes]);

  // Provide a manual refresh function that resets the count
  const manualRefresh = useCallback((channelId?: string) => {
    fetchCountRef.current = 0;
    fetchEmotes(channelId);
  }, [fetchEmotes]);

  return (
    <EmoteContext.Provider value={{ 
      emotes, 
      isLoading, 
      fetchEmotes: manualRefresh, // Use the safe version
      getEmote 
    }}>
      {children}
    </EmoteContext.Provider>
  );
};