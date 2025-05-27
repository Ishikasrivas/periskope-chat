'use client'

import React from 'react'

interface ChatBubbleProps {
  isSender: boolean
  content: string
  timestamp: string
}

export default function ChatBubble({ isSender, content, timestamp }: ChatBubbleProps) {
  return (
    <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`relative px-4 py-2 rounded-lg text-sm shadow-sm max-w-[75%] ${
          isSender
            ? 'bg-[#d9fdd3] text-black rounded-br-none'
            : 'bg-white text-black rounded-bl-none'
        }`}
      >
        <div>{content}</div>
        <div className="text-[10px] text-gray-500 text-right mt-1">{timestamp}</div>
      </div>
    </div>
  )
}
