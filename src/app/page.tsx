'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import SidebarNav from '../components/SidebarNav'
import Sidebar from '../components/Sidebar'
import ChatHeader from '../components/ChatHeader'
import ChatBubble from '../components/ChatBubble'
import MessageInput from '../components/MessageInput'

export default function ChatsPage() {
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  const router = useRouter()

  // 🔐 Load user session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user
      if (!sessionUser) {
        router.push('/')
      } else {
        setUser(sessionUser)
        setLoadingUser(false)
      }
    })
  }, [])

  // 📩 Load messages + chat metadata + realtime
  useEffect(() => {
    if (!selectedChatId) return

    const fetchChatData = async () => {
      // 1. Fetch messages
      const { data: messagesData, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', selectedChatId)
        .order('created_at', { ascending: true })

      if (msgError) console.error("Error fetching messages:", msgError)
      setMessages(messagesData || [])

      // 2. Fetch chat metadata
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('id, title, tags, avatar_url, is_group')
        .eq('id', selectedChatId)
        .single()

      if (chatError) console.error("Error fetching chat info:", chatError)
      setSelectedChat(chatData || null)
    }

    fetchChatData()

    // 3. Realtime message listener
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
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedChatId])

  // ✉️ Handle message sending
  const handleSend = async (text: string) => {
    if (!user || !selectedChatId) return

    await supabase.from('messages').insert([
      {
        chat_id: selectedChatId,
        sender_id: user.id,
        content: text,
      },
    ])
  }

  // 🕒 Until user is resolved
  if (loadingUser) return <div className="p-6">Loading...</div>

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
        <div className="flex h-screen">
    <SidebarNav />
  </div>
      <Sidebar
      
        onSelectChat={setSelectedChatId}
        selectedChatId={selectedChatId}
      />

      {/* Main Chat Window */}
      <div className="flex flex-col flex-1 bg-[#f0f2f5]">
        {selectedChatId ? (
          <>
            {/* Chat Header */}
            <ChatHeader chat={selectedChat} />

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  isSender={msg.sender_id === user.id}
                  content={msg.content}
                  timestamp={new Date(msg.created_at).toLocaleTimeString()}
                />
              ))}
            </div>

            {/* Message Input */}
            <MessageInput onSend={handleSend} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  )
}
