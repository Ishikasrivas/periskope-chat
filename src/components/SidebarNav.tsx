'use client'
import { FiHome, FiMessageSquare, FiPhone, FiSettings } from 'react-icons/fi'

export default function SidebarNav() {
  return (
    <div className="w-14 bg-[#f0f2f5] flex flex-col items-center py-4 gap-6 border-r">
      <FiHome className="text-xl text-gray-600 cursor-pointer" title="Home" />
      <FiMessageSquare className="text-xl text-gray-600 cursor-pointer" title="Messages" />
      <FiPhone className="text-xl text-gray-600 cursor-pointer" title="Calls" />
      <FiSettings className="text-xl text-gray-600 cursor-pointer" title="Settings" />
    </div>
  )
}
