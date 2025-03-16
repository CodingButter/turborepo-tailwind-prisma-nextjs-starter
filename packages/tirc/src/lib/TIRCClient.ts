import { EventEmitter } from "./EventEmitter";

/**
 * Defines the structure of the IRC Client configuration.
 */
export interface ITIRCClientConfig {
  server: string;
  oauthToken: string;
  clientId: string;
  nick: string;
  channels: `#${string}`[];
  reconnect?: boolean; // Optional auto-reconnect
}

/**
 * Defines the events that the IRC client will emit.
 */
export type TIRCEvents = {
  messageReceived: { user: string; message: string; channel: string; tags?: Record<string, string> };
  userJoined: { user: string; channel: string };
  userLeft: { user: string; channel: string };
  error: { message: string };
  disconnected: { reason?: string };
  connected: {};
};

/**
 * IRC Client for connecting to Twitch chat.
 */
export class TIRCClient extends EventEmitter<TIRCEvents> {
  private socket: WebSocket | null = null;
  private config: ITIRCClientConfig;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(config: ITIRCClientConfig) {
    super();
    this.config = config;
  }

  /**
   * Connects to the Twitch IRC server.
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        return resolve();
      }

      this.socket = new WebSocket(`wss://${this.config.server}:443`);

      this.socket.onopen = () => {
        if (!this.socket) return;
        console.log("Connected to Twitch IRC");

        this.socket.send(`PASS oauth:${this.config.oauthToken}`);
        this.socket.send(`NICK ${this.config.nick}`);

        // Join specified channels
        this.config.channels.forEach((channel) => {
          this.socket?.send(`JOIN ${channel}`);
        });

        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit("connected", {});
        resolve();
      };

      this.socket.onerror = (event) => {
        this.emit("error", { message: "WebSocket error occurred" });
        reject(new Error("WebSocket connection error"));
      };

      this.socket.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.socket.onclose = (event) => {
        console.log("Disconnected from Twitch IRC");
        this.isConnected = false;
        this.emit("disconnected", { reason: event.reason });

        if (this.config.reconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
        }
      };
    });
  }

  /**
   * Gets the Twitch OAuth token.
   * @returns The Twitch OAuth token without 'oauth:' prefix.
   */
  getOAuthToken(): string {
    return this.config.oauthToken || "";
  }

  /**
   * Gets the Client ID.
   * @returns The Twitch client ID.
   */
  getClientId(): string {
    return this.config.clientId || "";
  }

  /**
   * Gets the nickname used for the connection.
   * @returns The user's nickname.
   */
  getNick(): string {
    return this.config.nick;
  }

  /**
   * Sends a message to the chat.
   * @param channel - The channel to send the message to.
   * @param message - The message content.
   */
  sendMessage(channel: `#${string}`, message: string): void {
    if (this.socket && this.isConnected) {
      this.socket.send(`PRIVMSG ${channel} :${message}`);
    } else {
      console.warn("TIRCClient: Attempted to send message while disconnected.");
    }
  }

  /**
   * Leaves all channels and disconnects.
   */
  disconnect(): void {
    if (this.socket) {
      this.config.channels.forEach((channel) => {
        this.socket?.send(`PART ${channel}`);
      });

      this.socket.close();
      this.isConnected = false;
    }
  }

  /**
   * Parses messages received from the Twitch IRC server.
   * @param data - Raw IRC message data.
   */
  private handleMessage(data: string): void {
    const lines = data.split("\r\n");

    for (const line of lines) {
      if (!line) continue;

      console.log("IRC Message:", line);

      if (line.startsWith("PING")) {
        this.socket?.send("PONG :tmi.twitch.tv");
        continue;
      }

      // Parse tags if present
      const tags: Record<string, string> = {};
      let messageWithoutTags = line;
      
      if (line.startsWith('@')) {
        const tagsEnd = line.indexOf(' ');
        const tagsString = line.substring(1, tagsEnd);
        messageWithoutTags = line.substring(tagsEnd + 1);
        
        // Parse tags into an object
        tagsString.split(';').forEach(tag => {
          const [key, value] = tag.split('=');
          if (key && value !== undefined) {
            tags[key] = value;
          }
        });
      }

      const messageMatch = messageWithoutTags.match(/:(\w+)!\w+@\w+\.tmi\.twitch\.tv PRIVMSG (#\w+) :(.*)/);
      if (messageMatch) {
        const [, user, channel, message] = messageMatch;
        this.emit("messageReceived", { user, message, channel, tags });
        continue;
      }

      if (line.includes("JOIN")) {
        const userMatch = line.match(/:(\w+)!/);
        const channelMatch = line.match(/#(\w+)/);
        if (userMatch && channelMatch) {
          this.emit("userJoined", { user: userMatch[1], channel: `#${channelMatch[1]}` });
        }
      }

      if (line.includes("PART")) {
        const userMatch = line.match(/:(\w+)!/);
        const channelMatch = line.match(/#(\w+)/);
        if (userMatch && channelMatch) {
          this.emit("userLeft", { user: userMatch[1], channel: `#${channelMatch[1]}` });
        }
      }
    }
  }
}