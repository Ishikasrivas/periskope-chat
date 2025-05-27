'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function ChatsPage() {
  const [user, setUser] = useState<any>(null)
  const [chats, setChats] = useState<any[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Load user and chats
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const sessionUser = data.session?.user
      if (!sessionUser) {
        router.push('/')
      } else {
        setUser(sessionUser)
        await loadChats(sessionUser.id)
        setLoading(false)
      }
    })
  }, [])

  const loadChats = async (userId: string) => {
    const { data, error } = await supabase
      .from('chat_members')
      .select('chat_id, chats(id, is_group, created_at)')
      .eq('user_id', userId)

    if (error) console.error(error)
    else setChats(data.map((d: any) => d.chats))
  }

  // Fetch messages for selected chat
  const fetchMessages = async (chatId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    if (!error) setMessages(data)
  }

  // Real-time message updates
  useEffect(() => {
    if (!selectedChatId) return

    const channel = supabase
      .channel('realtime:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${selectedChatId}`,
        },
        (payload) => {
          console.log("🔔 New message received in real-time:", payload.new)
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedChatId])


  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChatId || !user) return

    const { error } = await supabase.from('messages').insert([
      {
        chat_id: selectedChatId,
        sender_id: user.id,
        content: newMessage.trim(),
      },
    ])

    if (error) {
      console.error('Error sending message:', error)
    } else {
      setNewMessage('')
      fetchMessages(selectedChatId) // 👈 force re-fetch so message appears
    }
  }


  if (loading) return <div className="p-4">Loading chats...</div>

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 border-r border-gray-300 bg-white p-4">
        <h2 className="text-xl font-bold mb-4">Chats</h2>
        <ul className="space-y-4">
          {chats.map((chat) => (
            <li
              key={chat.id}
              className={`cursor-pointer hover:bg-gray-100 p-2 rounded ${selectedChatId === chat.id ? 'bg-blue-100' : ''}`}
              onClick={() => {
                setSelectedChatId(chat.id)
                fetchMessages(chat.id)
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold">
                  {user.email?.[0].toUpperCase()}
                </div>
                <span className="truncate">Chat {chat.id.substring(0, 8)}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Area */}
      <div className="flex flex-col flex-1 bg-gray-50">
        {/* Header */}
        <div className="border-b border-gray-300 px-4 py-3 bg-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              Chat {selectedChatId?.substring(0, 6)}
            </h3>
            <p className="text-sm text-gray-500">Active now</p>
          </div>
          <div className="flex gap-4 text-gray-500 text-xl">
            {/* Add react-icons or use emoji/icons here */}
            <span className="cursor-pointer">🔍</span>
            <span className="cursor-pointer">⋮</span>
          </div>
        </div>


        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-chat-pattern">




          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 rounded-md max-w-[70%] break-words ${msg.sender_id === user.id
                ? 'bg-blue-500 text-white ml-auto'
                : 'bg-gray-200 text-black mr-auto'
                }`}
            >
              <div>{msg.content}</div>
              <div className="text-xs text-right mt-1 opacity-60">
                {new Date(msg.created_at).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>


        {/* Input */}
        {selectedChatId && (
          <div className="border-t border-gray-300 px-4 py-3 bg-white flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
            >
              Send
            </button>
          </div>

        )}
      </div>
    </div>
  )
}
