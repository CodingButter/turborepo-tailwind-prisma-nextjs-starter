// types/Message.ts
export type Channel = `#${string}`

export type Message = {
  id: string
  channel: string
  username: string
  displayName: string
  content: string
  color: string
  timestamp: Date
  isCurrentUser: boolean
  badges?: string
  profileImage?: string | null
  tags: {
    "badge-info"?: string
    badges?: string
    color?: string
    "display-name"?: string
    emotes?: string
    id?: string
    mod?: string
    subscriber?: string
    turbo?: string
    "user-id"?: string
    "user-type"?: string
    [key: string]: string | undefined
  }
}



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