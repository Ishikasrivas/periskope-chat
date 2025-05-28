'use client'

import {
  MdRefresh,
  MdHelpOutline,
  MdSearch,
  MdVideoCall,
  MdCall,
} from 'react-icons/md'
import { useState, useRef, useEffect } from 'react'

export default function ChatHeader({ chat }: { chat: any }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !(dropdownRef.current as any).contains(event.target)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="border-b border-gray-300 px-4 py-3 bg-white flex items-center justify-between relative">
      {/* Left: Avatar + Chat Info */}
      <div className="flex items-center gap-3">
        {chat?.avatar_url ? (
          <img
            src={chat.avatar_url}
            alt={chat.title || 'Chat'}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-semibold text-sm">
            {chat?.title?.[0] || 'C'}
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-800">
            {chat?.title || 'Chat'}
          </span>

          {/* 👥 Group member names under team name */}
          {chat?.is_group && chat?.members?.length > 0 ? (
            <span className="text-xs text-gray-500">
              {chat.members.map((m: any) => m.name).join(', ')}
            </span>
          ) : (
            <span className="text-xs text-gray-500">Active now</span>
          )}
        </div>
      </div>

      {/* Right: Icons */}
      <div className="flex gap-4 text-gray-500 text-xl items-center">
        <MdRefresh className="cursor-pointer" title="Refresh" />
        

        {/* MdVideoCall as dropdown trigger */}
        <div className="relative" ref={dropdownRef}>
          <MdVideoCall
            className="cursor-pointer"
            title="Call Options"
            onClick={() => setShowDropdown(!showDropdown)}
          />
      
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-20 text-sm">
              <button
                className="w-full px-4 py-2 flex items-center gap-2 text-left hover:bg-gray-100"
                onClick={() => {
                  setShowDropdown(false)
                  alert('Voice Call clicked')
                }}
              >
                <MdCall /> Voice Call
              </button>
              <button
                className="w-full px-4 py-2 flex items-center gap-2 text-left hover:bg-gray-100"
                onClick={() => {
                  setShowDropdown(false)
                  alert('Video Call clicked')
                }}
              >
                <MdVideoCall /> Video Call
              </button>
              
            </div>
            
          )}
        </div>
        <MdHelpOutline className="cursor-pointer" title="Help" />
        <MdSearch className="cursor-pointer" title="Search" />
      </div>
    </div>
  )
}
