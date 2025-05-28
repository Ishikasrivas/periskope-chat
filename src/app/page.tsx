'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import SidebarNav from '../components/SidebarNav'
import Sidebar from '../components/Sidebar'
import ChatHeader from '../components/ChatHeader'
import ChatBubble from '../components/ChatBubble'
import MessageInput from '../components/MessageInput'
// Remove this line, since Database is not exported from your supabaseClient file
// import type { Database } from '@/lib/supabaseClient'

import type { Session, User } from '@supabase/supabase-js'

// Helper type to get your table row type, adjust if you have your own
// Replace this with the actual row types for your tables if you have generated types from Supabase.
// For now, this is a fallback so TypeScript doesn't complain.
type Tables<T extends 'messages' | 'chats'> =
  T extends 'messages'
    ? {
        id: string
        chat_id: string
        sender_id: string
        content: string
        created_at: string
        // Add other fields from your messages table as needed
      }
    : T extends 'chats'
    ? {
        id: string
        title: string
        tags: string[] | null
        avatar_url: string | null
        is_group: boolean
        // Add other fields from your chats table as needed
      }
    : never

export default function ChatsPage() {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Tables<'messages'>[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [selectedChat, setSelectedChat] = useState<Tables<'chats'> | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [loadingChat, setLoadingChat] = useState(false)

  // 🔐 Load user session
 useEffect(() => {
  supabase.auth.getSession().then(({ data, error }) => {
    console.log('Session result:', data, error)

    const sessionUser = data?.session?.user ?? null

    if (!sessionUser) {
      console.warn('No user session found, redirecting...')
      router.push('/')
    } else {
      console.log('User session found:', sessionUser)
      setUser(sessionUser)
      setLoadingUser(false)
    }
  })
}, [router])


  // 📩 Load messages + chat metadata + realtime updates
  useEffect(() => {
    if (!selectedChatId) return

    const fetchChatData = async () => {
      setLoadingChat(true)

      // 1. Fetch messages
      const { data: messagesData, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', selectedChatId)
        .order('created_at', { ascending: true })

      if (msgError) console.error('Error fetching messages:', msgError)
      setMessages(messagesData ?? [])

      // 2. Fetch chat metadata
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('id, title, tags, avatar_url, is_group')
        .eq('id', selectedChatId)
        .single()

      if (chatError) console.error('Error fetching chat info:', chatError)
      setSelectedChat(chatData ?? null)

      setLoadingChat(false)
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
          setMessages((prev) => [...prev, payload.new as Tables<'messages'>])
          document.getElementById('scroll-anchor')?.scrollIntoView({ behavior: 'smooth' })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedChatId])

  // ✅ Simplified chat selection
  const onChatClick = (chatId: string) => {
    setSelectedChatId(chatId)
  }

  // ✉️ Handle message sending
  const handleSend = async (text: string) => {
    if (!user || !selectedChatId) return

    const { error } = await supabase.from('messages').insert([
      {
        chat_id: selectedChatId,
        sender_id: user.id,
        content: text,
      },
    ])

    if (error) {
      console.error('Error sending message:', error)
    } else {
      document.getElementById('scroll-anchor')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (loadingUser) return <div className="p-6">Loading user...</div>

  return (
    <div className="flex h-screen">
      {/* Left Sidebar Nav (icons only) */}
      <SidebarNav />

      {/* Sidebar Chat List */}
      <Sidebar onSelectChat={onChatClick} selectedChatId={selectedChatId} />

      {/* Chat Area */}
      <div className="flex flex-col flex-1">
        {selectedChatId ? (
          <div className="relative flex flex-col flex-1">
            {/* Background image */}
            <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center opacity-30 z-0 pointer-events-none" />

            {/* Chat content above the faded background */}
            <div className="relative z-10 flex flex-col flex-1">
              {/* Chat Header */}
              <ChatHeader chat={selectedChat} />

              {/* Messages */}
              {loadingChat ? (
                <div className="p-6 text-gray-500">Loading chat...</div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {messages.map((msg) => (
                    <ChatBubble
                      key={msg.id}
                      isSender={msg.sender_id === user?.id}
                      content={msg.content}
                      timestamp={new Date(msg.created_at).toLocaleTimeString()}
                    />
                  ))}
                  <div id="scroll-anchor" />
                </div>
              )}

              {/* Message Input */}
              <MessageInput onSend={handleSend} />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  )
}
