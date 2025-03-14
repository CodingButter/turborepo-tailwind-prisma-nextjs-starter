'use client';

// API Base URLs
const BTTV_API_BASE = "https://api.betterttv.net/3/cached";
const FFZ_API_BASE = "https://api.frankerfacez.com/v1";
const TWITCH_API = "https://api.twitch.tv/helix";
const TWITCH_CDN = "https://static-cdn.jtvnw.net/emoticons/v2";

// URL Generators
const bttvUrl = (emoteId: string, size: string): string => 
  `https://cdn.betterttv.net/emote/${emoteId}/${size}`;

const twitchUrl = (emoteId: string, size: string = "1.0"): string => 
  `${TWITCH_CDN}/${emoteId}/default/dark/${size}`;

// Cache for regex patterns
const regexCache = new Map<string, RegExp>();
const getWordBoundaryRegex = (term: string): RegExp => {
  if (!regexCache.has(term)) {
    regexCache.set(term, new RegExp(`\\b${term}\\b`, 'g'));
  }
  return regexCache.get(term)!;
};

/**
 * Defines the structure of an emote.
 */
export interface IEmote {
  id: string;
  name: string;
  urls: {
    "1x"?: string;
    "2x"?: string;
    "3x"?: string;
    "4x"?: string;
  };
}

export interface IBTTVEmote {
  id: string;
  code: string;
}

export interface IFFZEmote {
  id: number;
  name: string
  urls: {
    "1": string;
    "2"?: string;
    "3"?: string;
    "4"?: string;
  };
}

export interface ITwitchEmote {
  id: string;
  name: string;
  images: {
    url_1x: string;
    url_2x?: string;
    url_3x?: string;
    url_4x?: string;
  };
}

export interface EmotePosition {
  start: number;
  end: number;
}

export interface EmoteInfo {
  id: string;
  code: string;
}

export type MessagePart = string | EmoteInfo;

// Helper functions for transforming API responses
const convertBTTVEmote = (emote: IBTTVEmote): IEmote => ({
  id: emote.id,
  name: emote.code,
  urls: {
    "1x": bttvUrl(emote.id, "1x"),
    "2x": bttvUrl(emote.id, "2x"),
    "3x": bttvUrl(emote.id, "3x"),
    "4x": bttvUrl(emote.id, "4x"),
  },
});

const convertFFZEmote = (emote: IFFZEmote): IEmote => {
  const id = emote.id.toString();
  return {
    id,
    name: emote.name,
    urls: {
      "1x": emote.urls["1"] || "",
      "2x": emote.urls["2"] || emote.urls["1"] || "",
      "3x": emote.urls["3"] || emote.urls["2"] || emote.urls["1"] || "",
      "4x": emote.urls["4"] || emote.urls["3"] || emote.urls["2"] || emote.urls["1"] || "",
    },
  };
};

const convertTwitchEmote = (emote: ITwitchEmote): IEmote => ({
  id: emote.id,
  name: emote.name,
  urls: {
    "1x": emote.images.url_1x || "",
    "2x": emote.images.url_2x || emote.images.url_1x || "",
    "3x": emote.images.url_3x || emote.images.url_2x || emote.images.url_1x || "",
    "4x": emote.images.url_4x || emote.images.url_3x || emote.images.url_2x || emote.images.url_1x || "",
  },
});

// Generic error handling for fetch operations
const safeApiFetch = async <T>(
  url: string, 
  options: RequestInit = {}, 
  errorMessage: string = "API request failed"
): Promise<T> => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`${errorMessage}: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(errorMessage, error);
    throw error;
  }
};

/**
 * Fetches global BTTV emotes.
 */
export const fetchBTTVGlobalEmotes = async (): Promise<IEmote[]> => {
  try {
    const data = await safeApiFetch<IBTTVEmote[]>(
      `${BTTV_API_BASE}/emotes/global`,
      {},
      "Error fetching BTTV global emotes"
    );
    return data.map(convertBTTVEmote);
  } catch (error) {
    console.error("Error fetching BTTV global emotes:", error);
    return [];
  }
};

/**
 * Fetches channel-specific BTTV emotes.
 * @param provider - Either `twitch` or `youtube`.
 * @param providerId - The corresponding channel ID.
 */
export const fetchBTTVChannelEmotes = async (
  provider: "twitch" | "youtube",
  providerId: string
): Promise<IEmote[]> => {
  try {
    const data = await safeApiFetch<{
      channelEmotes?: IBTTVEmote[],
      sharedEmotes?: IBTTVEmote[]
    }>(
      `${BTTV_API_BASE}/users/${provider}/${providerId}`,
      {},
      "Error fetching BTTV channel emotes"
    );
    
    return [...(data.channelEmotes || []), ...(data.sharedEmotes || [])]
      .map(convertBTTVEmote);
  } catch (error) {
    console.error("Error fetching BTTV channel emotes:", error);
    return [];
  }
};

/**
 * Fetches FFZ global emotes.
 */
export const fetchFFZGlobalEmotes = async (): Promise<IEmote[]> => {
  try {
    const data = await safeApiFetch<{
      sets: Record<string, { emoticons: IFFZEmote[] }>
    }>(
      `${FFZ_API_BASE}/set/global`,
      {},
      "Error fetching FFZ global emotes"
    );
    
    return Object.values(data.sets)
      .flatMap((set) => set.emoticons)
      .map(convertFFZEmote);
  } catch (error) {
    console.error("Error fetching FFZ global emotes:", error);
    return [];
  }
};

/**
 * Fetches FFZ channel emotes.
 * @param channelId - The Twitch channel ID.
 */
export const fetchFFZChannelEmotes = async (channelId: string): Promise<IEmote[]> => {
  try {
    const data = await safeApiFetch<{
      sets: Record<string, { emoticons: IFFZEmote[] }>
    }>(
      `${FFZ_API_BASE}/room/id/${channelId}`,
      {},
      "Error fetching FFZ channel emotes"
    );
    
    return Object.values(data.sets)
      .flatMap((set) => set.emoticons)
      .map(convertFFZEmote);
  } catch (error) {
    console.error("Error fetching FFZ channel emotes:", error);
    return [];
  }
};

/**
 * Fetches Twitch emotes for a specific broadcaster.
 * Requires `clientId` and `oauthToken`.
 */
export const fetchTwitchEmotes = async (
  clientId: string,
  oauthToken: string
): Promise<IEmote[]> => {
  try {
    const headers = {
      "Client-ID": clientId,
      Authorization: `Bearer ${oauthToken}`,
    };
    
    const userData = await safeApiFetch<{ data: Array<{ id: string }> }>(
      `${TWITCH_API}/users`,
      { headers },
      "Failed to fetch Twitch user"
    );
    
    const userId = userData.data[0]?.id;
    if (!userId) throw new Error("User ID not found");

    const emotesData = await safeApiFetch<{ data: ITwitchEmote[] }>(
      `${TWITCH_API}/chat/emotes?broadcaster_id=${userId}`,
      { headers },
      "Failed to fetch Twitch emotes"
    );

    return emotesData.data.map(convertTwitchEmote);
  } catch (error) {
    console.error("Error fetching Twitch emotes:", error);
    return [];
  }
};

/**
 * Formats a message by replacing emote codes with `<img>` tags.
 * @param message - The original message.
 * @param emotes - The list of available emotes.
 */
export const formatMessageWithEmotes = (message: string, emotes: IEmote[]): string => {
  if (!message || !emotes.length) return message;
  
  return emotes.reduce((formattedMessage, emote) => {
    const regex = getWordBoundaryRegex(emote.name);
    return formattedMessage.replace(
      regex,
      `<img src="${emote.urls["1x"] || ""}" class="message-emote" data-name="${emote.name}" />`
    );
  }, message);
};

/**
 * Extracts the emotes that were used in a message.
 * @param message - The raw message text.
 * @param emotes - The list of available emotes.
 */
export const extractEmotesFromMessage = (message: string, emotes: IEmote[]): IEmote[] => {
  if (!message || !emotes.length) return [];
  return emotes.filter((emote) => message.includes(emote.name));
};

/**
 * Parses the emotes string from Twitch IRC tags and extracts emote information.
 * @param emoteString - The emotes string from Twitch IRC tags (e.g. "25:0-4,12-16/1902:6-10")
 * @param message - The original message text
 * @returns Array of parsed emote objects with id, code, and positions
 */
export const parseEmotes = (
  emoteString: string | undefined, 
  message: string = ""
): Array<{id: string, code: string, positions: EmotePosition[]}> => {
  if (!emoteString || !message) return [];
  
  return emoteString.split('/')
    .filter(Boolean)
    .map(emotePart => {
      const parts = emotePart.split(':');
      if (parts.length !== 2) return null;
      
      const [emoteId, positionsStr] = parts;
      if (!emoteId || !positionsStr) return null;
      
      const positions: EmotePosition[] = positionsStr
        .split(',')
        .map(positionPart => {
          const [startStr, endStr] = positionPart.split('-');
          const start = parseInt(startStr, 10);
          const end = parseInt(endStr, 10);
          
          return !isNaN(start) && !isNaN(end) ? { start, end } : null;
        })
        .filter((pos): pos is EmotePosition => pos !== null);
      
      if (positions.length === 0) return null;
      
      const firstPosition = positions[0];
      if (!firstPosition) return null;
      
      const code = message.substring(firstPosition.start, firstPosition.end + 1);
      
      return {
        id: emoteId,
        code,
        positions
      };
    })
    .filter((emote): emote is {id: string, code: string, positions: EmotePosition[]} => 
      emote !== null
    );
};

/**
 * Constructs a URL for a Twitch emote based on its ID and desired size.
 * @param id - The Twitch emote ID
 * @param size - The desired size ("1.0", "2.0", or "3.0")
 * @returns The URL to the Twitch emote image
 */
export const getTwitchEmoteUrl = (id: string, size: "1.0" | "2.0" | "3.0" = "1.0"): string => {
  return twitchUrl(id, size);
};

/**
 * Splits a message into parts that are either text or emotes.
 * @param message - The original message text
 * @param emotes - Array of parsed emote objects
 * @returns Array of string or emote objects
 */
export const splitMessageWithEmotes = (
  message: string, 
  emotes: Array<{id: string, code: string, positions?: EmotePosition[]}>
): MessagePart[] => {
  if (!message || !emotes.length) return [message];
  
  // Collect all position ranges
  const ranges: Array<{start: number, end: number, emote: EmoteInfo}> = [];
  
  // Process all emotes to build ranges
  emotes.forEach(emote => {
    if (emote.positions && emote.positions.length > 0) {
      // Use provided positions
      emote.positions.forEach(pos => {
        ranges.push({
          start: pos.start,
          end: pos.end,
          emote: { id: emote.id, code: emote.code }
        });
      });
    } else {
      // Find positions by regex
      const regex = getWordBoundaryRegex(emote.code);
      let match;
      while ((match = regex.exec(message)) !== null) {
        ranges.push({
          start: match.index,
          end: match.index + emote.code.length - 1,
          emote: { id: emote.id, code: emote.code }
        });
      }
    }
  });
  
  // Sort ranges by start position
  ranges.sort((a, b) => a.start - b.start);
  
  // Merge overlapping ranges
  const mergedRanges = ranges.reduce<Array<{start: number, end: number, emote: EmoteInfo}>>((acc, range) => {
    if (acc.length === 0) {
      acc.push(range);
      return acc;
    }
    
    const prevRange = acc[acc.length - 1];
    
    if (range.start > prevRange.end) {
      // No overlap, add to result
      acc.push(range);
    }
    // Else, overlapping range is ignored
    
    return acc;
  }, []);
  
  // If no merged ranges, just return the original message
  if (mergedRanges.length === 0) {
    return [message];
  }
  
  // Split message into parts
  return mergedRanges.reduce<MessagePart[]>((parts, range, idx) => {
    const prevRange = idx > 0 ? mergedRanges[idx - 1] : null;
    const prevEnd = prevRange ? prevRange.end + 1 : 0;
    
    // Add text before this emote if there is any
    if (range.start > prevEnd) {
      parts.push(message.substring(prevEnd, range.start));
    }
    
    // Add the emote
    parts.push(range.emote);
    
    // Add any text after the last emote
    if (idx === mergedRanges.length - 1 && range.end < message.length - 1) {
      parts.push(message.substring(range.end + 1));
    }
    
    return parts;
  }, []);
};