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

// Type for third-party emote
export type ThirdPartyEmote = {
  type: "emote"
  code: string
  url: string
}

// Type for channel emotes
export type ChannelEmote = {
  url: string
}
