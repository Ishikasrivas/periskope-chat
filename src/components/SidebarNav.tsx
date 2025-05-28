'use client'
import {
  MdMessage,
  MdGroups,
  MdPhone,
  MdNotificationsNone,
  MdSettings,
} from 'react-icons/md'

export default function SidebarNav() {
  return (
    <div className="w-14 bg-[#f0f2f5] border-r flex flex-col items-center gap-6 py-6 text-xl text-gray-600">
      <MdMessage className="cursor-pointer hover:text-green-600" />
      <MdGroups className="cursor-pointer hover:text-green-600" />
      <MdPhone className="cursor-pointer hover:text-green-600" />
      <MdNotificationsNone className="cursor-pointer hover:text-green-600" />
      <MdSettings className="mt-auto cursor-pointer hover:text-green-600" />
    </div>
  )
}
