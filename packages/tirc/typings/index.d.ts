export interface IEmote {
    id: string;
    code: string;
    url_1x?: string;
    url_2x?: string;
    url_3x?: string;
    positions?: Array<{
      start: number;
      end: number;
    }>;
  }
  
  export interface IUseEmotesOptions {
    fetchGlobal?: boolean;
    fetchChannel?: boolean;
    fetchShared?: boolean;
    fetchTwitch?: boolean;
    provider?: string;
    providerId?: string;
  }
  
  export interface IEmoteContext {
    globalEmotes: IEmote[];
    channelEmotes: IEmote[];
    sharedEmotes: IEmote[];
    twitchEmotes: IEmote[];
    isLoading: boolean;
    fetchEmotes: (options: IUseEmotesOptions) => Promise<void>;
  }