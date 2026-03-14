'use client';

import { useParams } from 'next/navigation';
import { SocketProvider } from '@/components/SocketProvider';
import ChatRoom from '@/components/ChatRoom';

export default function ChatPage() {
  const params = useParams();
  const roomId = params.id as string;

  return (
    <SocketProvider>
      <main className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background ambient light */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-zinc-600/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="z-10 w-full h-[100dvh] md:h-screen max-w-4xl flex flex-col md:border-x md:border-zinc-800/30">
          <ChatRoom roomId={roomId} />
        </div>
      </main>
    </SocketProvider>
  );
}
