'use client'

import { useState } from 'react'
import { Smile, Paperclip, Send } from 'lucide-react'

export default function MessageInput({ onSend }: { onSend: (msg: string) => void }) {
  const [text, setText] = useState('')

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim())
      setText('')
    }
  }

  return (
    <div className="flex items-center px-4 py-3 border-t bg-white gap-2">
      {/* Emoji icon */}
      <button className="text-gray-500 hover:text-gray-700">
        <Smile size={20} />
      </button>

      {/* Attachment icon */}
      <button className="text-gray-500 hover:text-gray-700">
        <Paperclip size={20} />
      </button>

      {/* Text input */}
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
      />

      {/* Send button */}
      <button
        onClick={handleSend}
        className="text-blue-600 hover:text-blue-800 p-1.5 rounded-full transition-colors"
      >
        <Send size={20} />
      </button>
    </div>
  )
}
