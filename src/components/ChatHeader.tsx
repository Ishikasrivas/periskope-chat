'use client'

import { FiSearch, FiMoreVertical, FiRefreshCcw } from 'react-icons/fi'
import { MdHelpOutline } from 'react-icons/md'
import React from 'react'

interface ChatHeaderProps {
  chat: {
    title: string
    tags?: string[]
    avatar_url?: string
  } | undefined
}

export default function ChatHeader({ chat }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-[#f7f7f7] px-4 py-2 border-b">
      {/* Left: Avatar + Title */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        {chat?.avatar_url ? (
          <img
            src={chat.avatar_url}
            alt={chat.title}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
            {chat?.title?.[0] || 'C'}
          </div>
        )}

        {/* Title + Subtitle */}
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-800">
            {chat?.title || 'Chat'}
          </span>
          {chat?.tags && (
            <span className="text-xs text-gray-500">
              {chat.tags.join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* Right: Icons */}
      <div className="flex items-center gap-4 text-gray-600 text-lg">
        <FiRefreshCcw className="cursor-pointer" title="Refresh" />
        <MdHelpOutline className="cursor-pointer" title="Help" />
        <FiSearch className="cursor-pointer" title="Search" />
        <FiMoreVertical className="cursor-pointer" title="More" />
      </div>
    </div>
  )
}
