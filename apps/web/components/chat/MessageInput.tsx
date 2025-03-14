import React, { useRef, useEffect } from "react"

interface MessageInputProps {
  messageInput: string
  setMessageInput: (value: string) => void
  sendMessage: () => void
  isConnected: boolean
  currentChannel: `#${string}` | null
}

const MessageInput: React.FC<MessageInputProps> = ({
  messageInput,
  setMessageInput,
  sendMessage,
  isConnected,
  currentChannel,
}) => {
  const messageInputRef = useRef<HTMLInputElement>(null)

  // Focus input when channel changes
  useEffect(() => {
    if (currentChannel) {
      messageInputRef.current?.focus()
    }
  }, [currentChannel])

  if (!currentChannel) {
    return null
  }

  return (
    <div className="p-4 bg-surface border-t border-border">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          sendMessage()
        }}
        className="flex space-x-2"
      >
        <input
          ref={messageInputRef}
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder={`Message ${currentChannel}`}
          className="flex-1 px-4 py-3 bg-background-tertiary rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          disabled={!isConnected}
        />
        <button
          type="submit"
          disabled={!isConnected || !messageInput.trim()}
          className="px-6 py-3 bg-primary hover:bg-primary-dark rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default MessageInput
