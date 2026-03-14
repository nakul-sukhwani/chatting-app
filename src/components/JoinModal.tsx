'use client';

import { useState } from 'react';
import { Lock, ShieldAlert, ChevronRight } from 'lucide-react';

interface JoinModalProps {
  onJoin: (nickname: string, password?: string) => void;
  isAuthFailed: boolean;
  roomName: string;
}

export default function JoinModal({ onJoin, isAuthFailed, roomName }: JoinModalProps) {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    onJoin(nickname, password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center justify-center p-4 bg-zinc-800/50 rounded-2xl mb-4 border border-zinc-700/50">
            <Lock className="w-8 h-8 text-gold-500" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Private Session</h2>
          <p className="text-zinc-500 text-sm font-medium">Entering vault: <span className="text-gold-400/80">"{roomName}"</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Your Alias</label>
            <input
              type="text"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Ghost_01"
              className="w-full bg-zinc-800/30 border border-zinc-700/50 text-white px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500/50 transition-all font-medium placeholder-zinc-600"
              autoFocus
              maxLength={20}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Access PIN</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className={`w-full bg-zinc-800/30 border ${isAuthFailed ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-zinc-700/50'} text-white px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500/50 transition-all font-medium placeholder-zinc-600`}
            />
            {isAuthFailed && (
              <p className="text-red-400 text-[11px] flex items-center gap-1.5 mt-1 ml-1 animate-in slide-in-from-top-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Invalid access PIN. Try again.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-2xl transition-all shadow-xl shadow-gold-500/20 flex items-center justify-center gap-2 group active:scale-[0.98]"
          >
            Enter Session
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800/50 flex items-center justify-center gap-2 text-[10px] text-zinc-600 font-medium uppercase tracking-tighter">
          <div className="w-1.5 h-1.5 bg-gold-500/50 rounded-full" />
          End-to-end memory encryption active
        </div>
      </div>
    </div>
  );
}
