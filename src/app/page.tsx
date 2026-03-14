'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Shield, Zap, MessagesSquare, X, Plus } from 'lucide-react';
import { useSocket } from '@/components/SocketProvider';

export default function Home() {
  const router = useRouter();
  const { socket } = useSocket();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [password, setPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on('room-created', ({ roomId }) => {
      router.push(`/chat/${roomId}`);
    });

    return () => {
      socket.off('room-created');
    };
  }, [socket, router]);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || isCreating) return;
    
    setIsCreating(true);
    socket.emit('create-room', { roomName, password });
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="z-10 max-w-4xl w-full flex flex-col items-center text-center space-y-12 relative animate-in fade-in duration-700">
        <div className="space-y-4 md:space-y-6">
          <div className="inline-flex items-center justify-center p-2.5 md:p-3 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl md:rounded-2xl mb-2 md:mb-4 shadow-xl">
            <Lock className="w-8 h-8 md:w-12 md:h-12 text-gold-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
            Ephemeral <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600 outline-none">Spaces</span>
          </h1>
          <p className="text-base md:text-xl text-zinc-400 max-w-lg mx-auto leading-relaxed px-4 md:px-0">
            Minimalist, real-time communication. No login, no database, history vanishes the moment the room is empty.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => setShowCreateModal(true)}
            className="group relative inline-flex items-center justify-center px-8 md:px-10 py-4 md:py-5 font-bold text-black bg-gold-500 rounded-full hover:bg-gold-400 transition-all duration-300 w-full sm:w-auto overflow-hidden shadow-2xl shadow-gold-500/20 active:scale-95"
          >
            <span className="flex items-center gap-3 text-base md:text-lg">
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
              Create Private Session
            </span>
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pt-8 md:pt-12 w-full">
          {[
            { 
              icon: <Zap className="w-5 h-5 md:w-6 md:h-6" />, 
              title: "Instant Setup", 
              desc: "One click unique URL creation" 
            },
            { 
              icon: <Shield className="w-5 h-5 md:w-6 md:h-6" />, 
              title: "Ram Only", 
              desc: "Zero persistence, zero database" 
            },
            { 
              icon: <Lock className="w-5 h-5 md:w-6 md:h-6" />, 
              title: "Auto Wipe", 
              desc: "Self-destructs when empty" 
            },
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center p-5 md:p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-sm hover:border-gold-500/20 transition-all hover:bg-zinc-800/40">
              <div className="p-2.5 md:p-3 bg-zinc-800/50 text-gold-400 rounded-xl mb-3 md:mb-4">
                {feature.icon}
              </div>
              <h3 className="text-white font-medium mb-1 md:mb-2 text-base md:text-lg">{feature.title}</h3>
              <p className="text-xs md:text-sm text-zinc-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300 ring-1 ring-zinc-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Initialize Vault</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">Session Name</label>
                <input
                  type="text"
                  required
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. Tactical Intel Chat"
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 text-white px-5 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 transition-all font-medium"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">Access Pin (Password)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank for public"
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 text-white px-5 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 transition-all font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-5 bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-2xl transition-all shadow-xl shadow-gold-500/20 disabled:opacity-50 active:scale-95"
              >
                {isCreating ? 'Securing Room...' : 'Confirm Initialization'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
