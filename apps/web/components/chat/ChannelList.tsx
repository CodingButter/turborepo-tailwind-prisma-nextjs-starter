// src/components/chat/ChannelList.tsx
import React, { useState } from "react"
import JoinForm from "./JoinForm"
import ChannelMenu from "./ChannelMenu"
import { ChevronRight, Hash } from "lucide-react"

interface ChannelListProps {
  channels: `#${string}`[]
  currentChannel: `#${string}` | null
  setCurrentChannel: (channel: `#${string}`) => void
  newChannelInput: string
  setNewChannelInput: (value: string) => void
  joinChannel: () => void
  leaveChannel: (channel: `#${string}`) => void
  moveChannelUp: (channel: `#${string}`) => void
  moveChannelDown: (channel: `#${string}`) => void
  isConnected: boolean
  collapsed: boolean
}

const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  currentChannel,
  setCurrentChannel,
  newChannelInput,
  setNewChannelInput,
  joinChannel,
  leaveChannel,
  moveChannelUp,
  moveChannelDown,
  isConnected,
  collapsed,
}) => {
  const [showJoinForm, setShowJoinForm] = useState(false)

  return (
    <aside
      className={`bg-surface flex flex-col border-r border-primary/20 transition-all duration-300 ease-in-out relative group ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Hover indicator when collapsed */}
      {collapsed && (
        <div className="absolute inset-y-0 -right-1 w-1 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      )}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && <h2 className="text-xl font-bold text-text">Channels</h2>}
        {collapsed && (
          <div className="w-full flex justify-center">
            <Hash size={20} className="text-primary" />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 message-container">
        {channels.length > 0 ? (
          <div className="space-y-1">
            {channels.map((channel) => (
              <div
                key={channel}
                className={`flex items-center justify-between w-full rounded transition-all ${
                  currentChannel === channel
                    ? "bg-primary shadow-md shadow-primary/20"
                    : "bg-background-tertiary hover:bg-surface-hover"
                }`}
              >
                <button
                  onClick={() => setCurrentChannel(channel)}
                  className="flex-1 text-left px-3 py-2 truncate"
                  title={channel}
                >
                  {collapsed ? channel.substring(1, 2).toUpperCase() : channel}
                </button>
                {!collapsed && (
                  <div className="pr-2">
                    <ChannelMenu
                      channel={channel}
                      onLeave={leaveChannel}
                      onMoveUp={moveChannelUp}
                      onMoveDown={moveChannelDown}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-text-secondary text-sm ${collapsed ? "text-center" : ""}`}>
            {collapsed ? "+" : "No channels joined"}
          </p>
        )}
      </div>

      {/* Join channel form (shown when not collapsed or when explicitly toggled) */}
      {(!collapsed || showJoinForm) && (
        <div className={`${collapsed ? "absolute left-16 bottom-0 w-64 z-10" : ""}`}>
          <JoinForm
            newChannelInput={newChannelInput}
            setNewChannelInput={setNewChannelInput}
            joinChannel={joinChannel}
            leaveCurrentChannel={() => currentChannel && leaveChannel(currentChannel)}
            currentChannel={currentChannel}
            isConnected={isConnected}
            onClose={() => setShowJoinForm(false)}
          />
        </div>
      )}

      {/* Join button when collapsed */}
      {collapsed && !showJoinForm && (
        <button
          onClick={() => setShowJoinForm(true)}
          className="p-4 border-t border-border bg-surface/50 flex justify-center items-center text-primary hover:bg-surface-hover transition-colors"
          title="Join Channel"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </aside>
  )
}

export default ChannelList
