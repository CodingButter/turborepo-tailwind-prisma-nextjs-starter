const BTTV_API_BASE = "https://api.betterttv.net/3/cached";
const FFZ_API_BASE = "https://api.frankerfacez.com/v1";
const TWITCH_API = "https://api.twitch.tv/helix";

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

/**
 * Fetches global BTTV emotes.
 */
export interface IBTTVEmote extends IEmote {
  code: string;
}

export interface IFFZEmote {
  id: number;
  name: string
  urls: {
    "1": string;
    "2": string;
    "3": string;
    "4": string;
  };
}

export interface ITwitchEmote {
  id: string;
  name: string;
  images: {
    url_1x: string;
    url_2x: string;
    url_3x: string;
    url_4x: string;
  };
}


export const fetchBTTVGlobalEmotes = async (): Promise<IEmote[]> => {
  try {
    const response = await fetch(`${BTTV_API_BASE}/emotes/global`);
    const data = await response.json();
    return data.map((emote: IBTTVEmote) => ({
      id: emote.id,
      name: emote.code,
      urls: {
        "1x": `https://cdn.betterttv.net/emote/${emote.id}/1x`,
        "2x": `https://cdn.betterttv.net/emote/${emote.id}/2x`,
        "3x": `https://cdn.betterttv.net/emote/${emote.id}/3x`,
        "4x": `https://cdn.betterttv.net/emote/${emote.id}/4x`,
      },
    }));
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
    const response = await fetch(`${BTTV_API_BASE}/users/${provider}/${providerId}`);
    const data = await response.json();
    return [...(data.channelEmotes || []), ...(data.sharedEmotes || [])].map((emote: IBTTVEmote) => ({
      id: emote.id,
      name: emote.code,
      urls: {
        "1x": `https://cdn.betterttv.net/emote/${emote.id}/1x`,
        "2x": `https://cdn.betterttv.net/emote/${emote.id}/2x`,
        "3x": `https://cdn.betterttv.net/emote/${emote.id}/3x`,
        "4x": `https://cdn.betterttv.net/emote/${emote.id}/4x`,
      },
    }));
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
    const response = await fetch(`${FFZ_API_BASE}/set/global`);
    const data = await response.json();
    return Object.values(data.sets)
      .flatMap((set) => (set as { emoticons: IFFZEmote[] }).emoticons)
      .map((emote: IFFZEmote) => ({
        id: emote.id.toString(),
        name: emote.name,
        urls: {
          "1x": emote.urls["1"] || "",
          "2x": emote.urls["2"] || emote.urls["1"] || "",
          "3x": emote.urls["3"] || emote.urls["2"] || emote.urls["1"] || "",
          "4x": emote.urls["4"] || emote.urls["3"] || emote.urls["2"] || emote.urls["1"] || "",
        },
      }));
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
    const response = await fetch(`${FFZ_API_BASE}/room/id/${channelId}`);
    const data = await response.json();
    return Object.values(data.sets)
      .flatMap((set) => (set as { emoticons: IFFZEmote[] }).emoticons)
      .map((emote: IFFZEmote) => ({
        id: emote.id.toString(),
        name: emote.name,
        urls: {
          "1x": emote.urls["1"] || "",
          "2x": emote.urls["2"] || emote.urls["1"] || "",
          "3x": emote.urls["3"] || emote.urls["2"] || emote.urls["1"] || "",
          "4x": emote.urls["4"] || emote.urls["3"] || emote.urls["2"] || emote.urls["1"] || "",
        },
      }));
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
    const userResponse = await fetch(`${TWITCH_API}/users`, {
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${oauthToken}`,
      },
    });
    if (!userResponse.ok) throw new Error("Failed to fetch Twitch user");

    const userData = await userResponse.json();
    const userId = userData.data[0]?.id;
    if (!userId) throw new Error("User ID not found");

    const emotesResponse = await fetch(`${TWITCH_API}/chat/emotes?broadcaster_id=${userId}`, {
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${oauthToken}`,
      },
    });

    if (!emotesResponse.ok) throw new Error("Failed to fetch Twitch emotes");

    const emotesData = await emotesResponse.json();
    return emotesData.data.map((emote: ITwitchEmote) => ({
      id: emote.id,
      name: emote.name,
      urls: {
        "1x": emote.images.url_1x || "",
        "2x": emote.images?.url_2x || emote.images?.url_1x || "",
        "3x": emote.images?.url_3x || emote.images?.url_2x || emote.images?.url_1x || "",
        "4x": emote.images?.url_4x || emote.images?.url_3x || emote.images?.url_2x || emote.images?.url_1x || "",
      },
    }));
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
  let formattedMessage = message;

  emotes.forEach((emote) => {
    const regex = new RegExp(`\\b${emote.name}\\b`, "g");
    formattedMessage = formattedMessage.replace(
      regex,
      `<img src="${emote.urls["1x"]}" class="message-emote" data-name="${emote.name}" />`
    );
  });

  return formattedMessage;
};

/**
 * Extracts the emotes that were used in a message.
 * @param message - The raw message text.
 * @param emotes - The list of available emotes.
 */
export const extractEmotesFromMessage = (message: string, emotes: IEmote[]): IEmote[] => {
  return emotes.filter((emote) => message.includes(emote.name));
};
