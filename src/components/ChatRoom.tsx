'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from './SocketProvider';
import { Send, Lock, ExternalLink, ShieldCheck, Smile, Paperclip, X, Image as ImageIcon, File, Pencil, Check } from 'lucide-react';
import dynamic from 'next/dynamic';
import JoinModal from './JoinModal';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface Message {
  id: string;
  text: string;
  sender: string;
  attachment?: {
    name: string;
    type: string;
    data: string; // Base64
  } | null;
  timestamp: string;
}

export default function ChatRoom({ roomId }: { roomId: string }) {
  const { socket, isConnected } = useSocket();
  const [nickname, setNickname] = useState('');
  const [sessionName, setSessionName] = useState('Secure Session');
  const [isJoined, setIsJoined] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isAuthFailed, setIsAuthFailed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState<{ name: string, type: string, data: string } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('room-ready', ({ name, isOwner, history, onlineCount }) => {
      setSessionName(name);
      setIsOwner(isOwner);
      setMessages(history);
      setOnlineCount(onlineCount);
      setIsJoined(true);
      setIsAuthFailed(false);
    });

    socket.on('auth-failed', () => {
      setIsAuthFailed(true);
    });

    socket.on('room-renamed', ({ newName }) => {
      setSessionName(newName);
    });

    socket.on('receive-message', (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('user-count', (count: number) => {
      setOnlineCount(count);
    });

    socket.on('user-joined', (data: { nickname: string }) => {
      // System info log can be added here
    });

    socket.on('error', (err) => {
      console.error('Socket Error:', err.message);
    });

    return () => {
      socket.off('room-ready');
      socket.off('auth-failed');
      socket.off('room-renamed');
      socket.off('receive-message');
      socket.off('user-count');
      socket.off('error');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoin = (nick: string, pass?: string) => {
    if (!socket) return;
    setNickname(nick);
    socket.emit('join-room', { roomId, nickname: nick, password: pass });
  };

  const handleRename = () => {
    if (!socket || !isOwner) return;
    socket.emit('rename-room', { roomId, newName: sessionName });
    setIsEditingName(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputMessage.trim() && !attachment) || !socket) return;

    socket.emit('send-message', {
      roomId,
      message: inputMessage,
      nickname,
      attachment
    });

    setInputMessage('');
    setAttachment(null);
    setShowEmojiPicker(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Max 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachment({
        name: file.name,
        type: file.type,
        data: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const onEmojiClick = (emojiData: any) => {
    setInputMessage(prev => prev + emojiData.emoji);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isJoined) {
    return (
      <JoinModal 
        onJoin={handleJoin} 
        isAuthFailed={isAuthFailed} 
        roomName={sessionName}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950/20 backdrop-blur-3xl shadow-2xl border-x border-zinc-800/30">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-zinc-800/50 bg-zinc-900/50 flex-none sticky top-0 md:relative z-20">
        <div className="flex items-center gap-3">
          <div className="p-1.5 md:p-2 bg-zinc-800 rounded-lg">
            <Lock className="w-4 h-4 md:w-5 md:h-5 text-gold-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 group">
              {isOwner && isEditingName ? (
                <div className="flex items-center gap-1">
                  <input 
                    type="text" 
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    className="bg-zinc-800/50 border border-zinc-700/50 text-white text-xs md:text-sm px-2 py-0.5 rounded outline-none w-32 md:w-48"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                  />
                  <button onClick={handleRename} className="p-1 text-green-500">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-white font-medium text-xs md:text-sm">
                    {sessionName} {isOwner && <span className="text-[9px] text-gold-500 border border-gold-500/20 px-1 rounded ml-1 uppercase">Owner</span>}
                  </h1>
                  {isOwner && (
                    <button 
                      onClick={() => setIsEditingName(true)}
                      className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-gold-500"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  )}
                </>
              )}
            </div>
            <p className="text-[9px] md:text-[10px] text-zinc-500 flex items-center gap-1.5 uppercase font-semibold tracking-wider">
               <span className="flex items-center gap-1">
                 <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                 {onlineCount} {onlineCount === 1 ? 'Ghost' : 'Ghosts'} Online
               </span>
               <span>•</span>
               <span className="truncate max-w-[80px] md:max-w-none">@{nickname}</span>
            </p>
          </div>
        </div>
        
        <button 
          onClick={copyLink}
          className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 text-[11px] md:text-sm text-zinc-300 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-lg md:rounded-xl transition-all"
        >
          {isCopied ? 'Copied!' : 'Share'}
          <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-8 scroll-smooth z-10">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-3 md:space-y-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-zinc-900/50 flex items-center justify-center border border-zinc-800/50">
               <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 opacity-50" />
            </div>
            <p className="text-[10px] md:text-xs border border-zinc-800/50 bg-zinc-900/30 px-4 md:px-6 py-1.5 md:py-2 rounded-full text-center">
              Vault initialized. All data is ephemeral.
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender === nickname;
            
            return (
              <div 
                key={msg.id} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                {!isMe && (
                  <span className="text-[10px] font-medium text-zinc-500 mb-1 ml-2 uppercase tracking-tight">{msg.sender}</span>
                )}
                <div 
                  className={`
                    px-4 py-2.5 rounded-2xl max-w-[85%] sm:max-w-[70%] break-words shadow-[0_4px_15px_-5px_rgba(0,0,0,0.4)] text-[14px] md:text-[15px]
                    ${isMe 
                      ? 'bg-zinc-900 border border-gold-600/40 text-gold-400 rounded-tr-none bubble-tail-me' 
                      : 'bg-zinc-800/80 border border-zinc-700/50 text-zinc-100 rounded-tl-none bubble-tail-other'
                    }
                    transform transition-transform hover:scale-[1.01]
                  `}
                >
                  {msg.attachment && (
                    <div className="mb-2 max-w-full overflow-hidden rounded-lg border border-white/5">
                      {msg.attachment.type.startsWith('image/') ? (
                        <img 
                          src={msg.attachment.data} 
                          alt={msg.attachment.name} 
                          className="max-h-64 object-contain shadow-inner"
                          onLoad={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-black/20 text-xs">
                          <File className="w-4 h-4 text-gold-500" />
                          <span className="truncate max-w-[150px]">{msg.attachment.name}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="relative z-30">
        {showEmojiPicker && (
          <div className="absolute bottom-full left-4 mb-4 emoji-picker-container shadow-2xl">
            <EmojiPicker 
              onEmojiClick={onEmojiClick} 
              theme={'dark' as any}
              width={300}
              height={400}
              lazyLoadEmojis={true}
            />
          </div>
        )}

        <form 
          onSubmit={handleSendMessage} 
          className="p-3 md:p-4 bg-zinc-900/80 backdrop-blur-md border-t border-zinc-800/50 pb-safe"
        >
          {attachment && (
            <div className="mb-3 flex items-center gap-2 p-2 bg-zinc-800/50 border border-zinc-700/50 rounded-xl w-fit animate-in fade-in zoom-in duration-200">
              {attachment.type.startsWith('image/') ? (
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10">
                  <img src={attachment.data} className="w-full h-full object-cover" />
                </div>
              ) : (
                <File className="w-5 h-5 text-gold-500 ml-2" />
              )}
              <span className="text-xs text-zinc-400 max-w-[120px] truncate">{attachment.name}</span>
              <button 
                type="button"
                onClick={() => setAttachment(null)}
                className="p-1 hover:bg-zinc-700 rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2 md:gap-3 max-w-4xl mx-auto">
            <div className="flex items-center gap-1 md:gap-2 mb-1">
              <button
                type="button"
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                }}
                className={`p-2 rounded-xl transition-all ${showEmojiPicker ? 'bg-gold-500 text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
              >
                <Smile className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"
              >
                <Paperclip className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
                accept="image/*, .pdf, .doc, .docx, .txt"
              />
            </div>

            <div className="flex-1 bg-zinc-800/30 border border-zinc-700/50 rounded-xl md:rounded-2xl p-1.5 md:p-2 focus-within:ring-1 focus-within:ring-gold-500/50 focus-within:border-gold-500/50 transition-all shadow-inner">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Secure message..."
                className="w-full bg-transparent border-none text-white placeholder-zinc-500 px-2 md:px-3 py-1.5 md:py-2 outline-none text-sm md:text-base min-h-[40px] md:min-h-[48px]"
                autoComplete="off"
              />
            </div>
            
            <button
              type="submit"
              disabled={(!inputMessage.trim() && !attachment) || !isConnected}
              className="p-3 md:p-4 bg-gold-500 hover:bg-gold-400 text-black rounded-xl md:rounded-2xl transition-all shadow-xl shadow-gold-500/20 disabled:opacity-50 disabled:hover:bg-gold-500 shrink-0 h-10 md:h-12 w-10 md:w-12 flex items-center justify-center mb-1 active:scale-95"
            >
              <Send className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
