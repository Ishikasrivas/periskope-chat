'use client'

import { useState } from 'react'
import { FaRegSmile, FaMicrophone } from 'react-icons/fa'
import { FiSend, FiPaperclip } from 'react-icons/fi'

export default function MessageInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('')

  const handleSend = () => {
    if (!text.trim()) return
    onSend(text)
    setText('')
  }

  return (
    <div className="bg-white px-4 py-3 border-t flex items-center gap-3">
      <FaRegSmile className="text-gray-500 text-xl cursor-pointer" />
      <FiPaperclip className="text-gray-500 text-xl cursor-pointer" />

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Type a message"
        className="flex-1 text-sm px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200"
      />

      {text ? (
        <FiSend
          className="text-blue-600 text-xl cursor-pointer"
          onClick={handleSend}
        />
      ) : (
        <FaMicrophone className="text-gray-500 text-xl cursor-pointer" />
      )}
    </div>
  )
}
