import React, { useEffect, useRef, useState, useCallback } from 'react';
import { supabase, uploadFile, getPublicUrl } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { HiArrowLeft, HiPaperClip, HiPhotograph, HiDocumentText, HiVideoCamera } from 'react-icons/hi';
import MessageBubble from './MessageBubble';

export default function ChatRoom({ room, onBack }) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    fetchMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`room:${room.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${room.id}` },
        async (payload) => {
          // Fetch sender profile
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, nickname, avatar_url')
            .eq('id', payload.new.sender_id)
            .single();
          setMessages(prev => [...prev, { ...payload.new, sender }]);
        }
      )
      .subscribe();

    // Mark as read
    updateLastRead();

    return () => supabase.removeChannel(channel);
  }, [room.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select(`*, sender:profiles(id, nickname, avatar_url)`)
      .eq('room_id', room.id)
      .order('created_at', { ascending: true })
      .limit(100);
    setMessages(data || []);
    setLoading(false);
    setTimeout(scrollToBottom, 100);
  };

  const updateLastRead = async () => {
    await supabase
      .from('room_members')
      .upsert({ room_id: room.id, user_id: user.id, last_read_at: new Date().toISOString() });
  };

  const sendMessage = async (content, type = 'TEXT', metadata = null) => {
    if (!content.trim() && type === 'TEXT') return;
    setSending(true);
    try {
      await supabase.from('messages').insert({
        room_id: room.id,
        sender_id: user.id,
        content,
        message_type: type,
        metadata,
      });
      if (type === 'TEXT') setInputText('');
    } catch (e) {
      alert('메시지 전송 실패: ' + e.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;
    const maxSize = type === 'VIDEO' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`파일 크기는 ${type === 'VIDEO' ? '50MB' : '10MB'} 이하여야 합니다.`);
      return;
    }
    setUploading(true);
    setShowAttach(false);
    try {
      const ext = file.name.split('.').pop();
      const path = `${room.id}/${Date.now()}_${Math.random().toString(36).substr(2,6)}.${ext}`;
      await uploadFile('chat-files', path, file);
      const url = getPublicUrl('chat-files', path);
      await sendMessage(url, type, { filename: file.name, size: file.size, mimeType: file.type });
    } catch (e) {
      alert('파일 업로드 실패: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = format(new Date(msg.created_at), 'yyyy년 M월 d일', { locale: ko });
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  return (
    <div className="h-full flex flex-col bg-kakao-chat">
      {/* Header */}
      <div className="bg-kakao-sidebar px-4 py-3 flex items-center gap-3 border-b border-white/5 flex-shrink-0">
        <button onClick={onBack} className="text-white/60 hover:text-white transition-colors p-1 -ml-1">
          <HiArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{room.name}</p>
          <p className="text-white/40 text-xs">{room.member_count || '가족'}명</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center gap-2 my-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-white/30 text-xs px-2">{date}</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              {msgs.map((msg, idx) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isMe={msg.sender_id === user.id}
                  showAvatar={msg.sender_id !== msgs[idx - 1]?.sender_id}
                  showTime={msg.sender_id !== msgs[idx + 1]?.sender_id || 
                    (msgs[idx + 1] && format(new Date(msg.created_at), 'HH:mm') !== format(new Date(msgs[idx + 1].created_at), 'HH:mm'))}
                />
              ))}
            </div>
          ))
        )}
        {uploading && (
          <div className="flex justify-end px-2">
            <div className="bg-kakao-yellow/20 rounded-2xl px-4 py-3 flex items-center gap-2 text-white/60 text-sm">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              파일 업로드 중...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Attach menu overlay */}
      {showAttach && (
        <div className="bg-kakao-sidebar/95 backdrop-blur border-t border-white/10 px-4 py-4 flex gap-4 flex-shrink-0">
          {[
            { icon: HiPhotograph, label: '사진', ref: imageRef, accept: 'image/*', type: 'IMAGE', color: 'bg-blue-500' },
            { icon: HiVideoCamera, label: '동영상', ref: videoRef, accept: 'video/*', type: 'VIDEO', color: 'bg-purple-500' },
            { icon: HiDocumentText, label: '파일', ref: fileRef, accept: '*/*', type: 'FILE', color: 'bg-green-500' },
          ].map(({ icon: Icon, label, ref, accept, type, color }) => (
            <button key={type} onClick={() => ref.current.click()} className="flex flex-col items-center gap-1.5">
              <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center shadow`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-white/60 text-xs">{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Hidden file inputs */}
      <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e.target.files[0], 'IMAGE')} />
      <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={e => handleFileUpload(e.target.files[0], 'VIDEO')} />
      <input ref={fileRef} type="file" accept="*/*" className="hidden" onChange={e => handleFileUpload(e.target.files[0], 'FILE')} />

      {/* Input bar */}
      <div className="bg-kakao-sidebar border-t border-white/5 px-3 py-2 flex items-end gap-2 flex-shrink-0 pb-safe">
        <button
          onClick={() => setShowAttach(!showAttach)}
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
            showAttach ? 'bg-kakao-yellow text-kakao-brown' : 'text-white/50 hover:text-white hover:bg-white/10'
          }`}
        >
          <HiPaperClip className="w-5 h-5" />
        </button>

        <div className="flex-1 bg-white/10 rounded-2xl px-4 py-2.5 min-h-[40px] max-h-32">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지 입력"
            rows={1}
            className="w-full bg-transparent text-white text-sm placeholder-white/30 resize-none focus:outline-none leading-5 max-h-24 overflow-y-auto"
            style={{ height: 'auto' }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
            }}
          />
        </div>

        <button
          onClick={() => sendMessage(inputText)}
          disabled={!inputText.trim() || sending}
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
            inputText.trim()
              ? 'bg-kakao-yellow text-kakao-brown shadow hover:opacity-90 active:scale-95'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
          }`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
