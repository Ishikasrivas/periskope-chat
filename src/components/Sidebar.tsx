'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface SidebarProps {
  onSelectChat: (chatId: string) => void
  selectedChatId: string | null
}

export default function Sidebar({ onSelectChat, selectedChatId }: SidebarProps) {
  const [chats, setChats] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  useEffect(() => {
    const getUserAndFetchChats = async () => {
      const { data } = await supabase.auth.getUser()
      const userId = data.user?.id
      if (!userId) return
      setUserId(userId)

      const fetchChats = async () => {
        const { data: chatData } = await supabase
          .from('chat_members')
          .select('chat_id, chats (id, created_at, title, avatar_url, is_group, tags)')
          .eq('user_id', userId)

        const baseChats = chatData?.map((item: any) => item.chats) ?? []

        const enrichedChats = await Promise.all(
          baseChats.map(async (chat: any) => {
            const { data: messageData } = await supabase
              .from('messages')
              .select('content, created_at')
              .eq('chat_id', chat.id)
              .order('created_at', { ascending: false })
              .limit(1)

            return {
              ...chat,
              lastMessage: messageData?.[0]?.content || '',
              lastMessageTime: messageData?.[0]?.created_at || ''
            }
          })
        )

        // Sort by latest message
        enrichedChats.sort((a, b) => {
          const aTime = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0
          const bTime = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0
          return bTime - aTime
        })

        setChats(enrichedChats)
      }

      await fetchChats()

      // 👇 Subscribe to new message inserts
      const messageSub = supabase
        .channel('messages-updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            // New message inserted — refetch chats
            fetchChats()
          }
        )
        .subscribe()

      // Clean up subscription on unmount
      return () => {
        supabase.removeChannel(messageSub)
      }
    }

    getUserAndFetchChats()
  }, [])


  // // Get current user
  // useEffect(() => {
  //   supabase.auth.getUser().then(({ data }) => {
  //     setUserId(data.user?.id ?? null)
  //   })
  // }, [])

  // // Fetch user's chats and their latest messages
  // useEffect(() => {
  //   if (!userId) return

  //   const fetchChats = async () => {
  //     const { data } = await supabase
  //       .from('chat_members')
  //       .select('chat_id, chats (id, created_at, title, avatar_url, is_group, tags)')
  //       .eq('user_id', userId)

  //     const baseChats = data?.map((item: any) => item.chats) ?? []

  //     const enrichedChats = await Promise.all(
  //       baseChats.map(async (chat: any) => {
  //         const { data: messageData } = await supabase
  //           .from('messages')
  //           .select('content, created_at')
  //           .eq('chat_id', chat.id)
  //           .order('created_at', { ascending: false })
  //           .limit(1)

  //         return {
  //           ...chat,
  //           lastMessage: messageData?.[0]?.content || '',
  //           lastMessageTime: messageData?.[0]?.created_at || ''
  //         }
  //       })
  //     )

  //     console.log("Before sort:", enrichedChats.map(c => ({
  //       title: c.title,
  //       lastMessageTime: c.lastMessageTime
  //     })))

  //     enrichedChats.sort((a, b) => {
  //       const aTime = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0
  //       const bTime = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0
  //       return bTime - aTime
  //     })

  //     setChats([...enrichedChats])
  //   }


  //   fetchChats()
  // }, [userId])

  return (
    <div className="w-[360px] h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
          W
        </div>
        <button className="text-sm text-blue-500">Save</button>
      </div>

      {/* Filter */}
      <div className="px-4 py-2 border-b">
        <div className="text-sm font-semibold text-green-600">Custom filter</div>
        
        <div className="flex items-center gap-2 mt-2">
          <input
            type="text"
            placeholder="Search"
            className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
          />
          <span className="text-xs text-green-600">Filtered</span>
        </div>
      </div>

      {/* Chat List */}
      <div
        className="overflow-y-auto flex-1 bg-[url('/images/bg.png')] bg-repeat bg-cover"
      >
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`flex items-center gap-3 px-4 py-3 border-b cursor-pointer ${selectedChatId === chat.id ? 'bg-blue-50' : 'hover:bg-gray-100'
              }`}
          >
            {/* Avatar */}
            {chat.avatar_url ? (
              <img
                src={chat.avatar_url}
                alt={chat.title}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold text-white">
                {chat.title?.[0] || 'C'}
              </div>
            )}

            {/* Chat Info */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <div className="font-semibold truncate text-sm">
                  {chat.title}
                </div>
                <div className="text-xs text-gray-500 whitespace-nowrap ml-2">
                  {chat.lastMessageTime
                    ? new Date(chat.lastMessageTime).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short'
                    })
                    : ''}
                </div>
              </div>
              <div className="text-xs text-gray-600 truncate">
                {chat.lastMessage || 'No messages yet'}
              </div>
              <div className="mt-1 flex gap-1 flex-wrap">
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {chat.is_group ? 'Group' : 'Person'}
                </span>
                {chat.tags?.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
