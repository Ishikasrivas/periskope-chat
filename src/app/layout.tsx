'use client';

import './globals.css'
import { ReactNode, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export const metadata = {
  title: 'Periskope Chat',
  description: 'A WhatsApp-style chat app',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth changed:', event, session);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
