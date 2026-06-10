import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import ChatRoom from './ChatRoom';
import { HiUser } from 'react-icons/hi';

export default function ChatList() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState(null);

  useEffect(() => {
    fetchRooms();
    const channel = supabase
      .channel('rooms-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => fetchRooms())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const fetchRooms = async () => {
    try {
      // Get rooms with last message and unread count
      const { data: roomsData } = await supabase
        .from('rooms')
        .select(`
          *,
          messages(
            id, content, message_type, created_at,
            sender:profiles(nickname, avatar_url)
          )
        `)
        .order('created_at', { foreignTable: 'messages', ascending: false })
        .limit(1, { foreignTable: 'messages' });

      // Get unread counts
      if (roomsData) {
        const roomsWithUnread = await Promise.all(
          roomsData.map(async (room) => {
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('room_id', room.id)
              .gt('created_at', room.last_read_at || '1970-01-01')
              .neq('sender_id', user.id);
            return { ...room, unread_count: count || 0 };
          })
        );
        setRooms(roomsWithUnread);
      }
    } catch (e) {
      console.error('채팅방 로드 실패:', e);
    } finally {
      setLoading(false);
    }
  };

  if (activeRoom) {
    return <ChatRoom room={activeRoom} onBack={() => { setActiveRoom(null); fetchRooms(); }} />;
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-kakao-yellow border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-full overflow-y-auto">
      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-white/30">
          <div className="text-5xl mb-3">💬</div>
          <p className="text-sm">아직 채팅방이 없습니다</p>
          <p className="text-xs mt-1">관리자에게 채팅방 생성을 요청하세요</p>
        </div>
      ) : (
        <div>
          {rooms.map(room => (
            <RoomRow key={room.id} room={room} onOpen={() => setActiveRoom(room)} />
          ))}
        </div>
      )}
    </div>
  );
}

function RoomRow({ room, onOpen }) {
  const lastMsg = room.messages?.[0];
  const lastContent = lastMsg
    ? lastMsg.message_type === 'IMAGE' ? '📷 사진'
    : lastMsg.message_type === 'FILE' ? '📎 파일'
    : lastMsg.content
    : '대화를 시작해 보세요';

  return (
    <button
      onClick={onOpen}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
    >
      {/* Room icon */}
      <div className="w-12 h-12 rounded-full bg-kakao-accent/30 flex items-center justify-center text-xl flex-shrink-0">
        {room.icon || '💬'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-white text-sm font-medium truncate">{room.name}</span>
          {lastMsg && (
            <span className="text-white/30 text-xs flex-shrink-0 ml-2">
              {formatDistanceToNow(new Date(lastMsg.created_at), { addSuffix: false, locale: ko })}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-white/40 text-xs truncate flex-1">{lastContent}</p>
          {room.unread_count > 0 && (
            <span className="ml-2 bg-kakao-yellow text-kakao-brown text-xs font-bold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5 flex-shrink-0">
              {room.unread_count > 99 ? '99+' : room.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
