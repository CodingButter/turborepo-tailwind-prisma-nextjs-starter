import React from "react"
import { X } from "lucide-react"
import { Channel } from "@repo/tirc"

interface JoinFormProps {
  newChannelInput: string
  setNewChannelInput: (value: string) => void
  joinChannel: () => void
  leaveCurrentChannel: () => void
  currentChannel: Channel
  isConnected: boolean
  onClose?: () => void // New prop for handling close in collapsed mode
}

const JoinForm: React.FC<JoinFormProps> = ({
  newChannelInput,
  setNewChannelInput,
  joinChannel,
  leaveCurrentChannel,
  currentChannel,
  isConnected,
  onClose,
}) => {
  return (
    <div className="p-4 border-t border-border bg-surface/50">
      {/* Close button if onClose is provided */}
      {onClose && (
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text p-1 rounded-full hover:bg-background-tertiary"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="mb-3">
        <div className="flex space-x-2 overflow-hidden">
          <input
            type="text"
            value={newChannelInput}
            onChange={(e) => setNewChannelInput(e.target.value)}
            placeholder="Channel name"
            className="flex-1 min-w-0 px-3 py-2 bg-background-tertiary rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            onKeyDown={(e) => {
              if (e.key === "Enter") joinChannel()
            }}
          />
          <button
            onClick={joinChannel}
            disabled={!isConnected}
            className="px-3 py-2 bg-success hover:bg-success/80 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            Join
          </button>
        </div>
      </div>

      {currentChannel && (
        <button
          onClick={leaveCurrentChannel}
          disabled={!isConnected}
          className="w-full py-2 px-4 bg-error hover:bg-error/80 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Leave {currentChannel}
        </button>
      )}
    </div>
  )
}

export default JoinForm
