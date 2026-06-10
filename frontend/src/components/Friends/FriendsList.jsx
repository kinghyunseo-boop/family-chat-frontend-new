import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { HiUser } from 'react-icons/hi';

export default function FriendsList() {
  const { user, profile } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
    // 실시간 온라인 상태 구독
    const channel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => fetchMembers())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const fetchMembers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_approved', true)
      .order('nickname');
    setMembers(data || []);
    setLoading(false);
  };

  // My profile first
  const me = members.find(m => m.id === user?.id);
  const others = members.filter(m => m.id !== user?.id);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-kakao-yellow border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-full overflow-y-auto">
      {/* My profile */}
      {me && (
        <div className="px-4 py-3 border-b border-white/5">
          <p className="text-white/30 text-xs mb-2">나</p>
          <MemberRow member={me} isMe />
        </div>
      )}

      {/* Family members */}
      <div className="px-4 py-3">
        <p className="text-white/30 text-xs mb-2">가족 {others.length}명</p>
        <div className="space-y-1">
          {others.map(member => <MemberRow key={member.id} member={member} />)}
        </div>
      </div>
    </div>
  );
}

function MemberRow({ member, isMe }) {
  return (
    <div className="flex items-center gap-3 py-2 rounded-xl hover:bg-white/5 px-2 transition-colors cursor-pointer">
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden flex items-center justify-center">
          {member.avatar_url
            ? <img src={member.avatar_url} alt={member.nickname} className="w-full h-full object-cover" />
            : <HiUser className="w-6 h-6 text-white/30" />}
        </div>
        {/* Online indicator */}
        {member.is_online && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-kakao-sidebar" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">
          {member.nickname || '이름 없음'}
          {isMe && <span className="text-white/30 text-xs ml-1">(나)</span>}
        </p>
        {member.status_message && (
          <p className="text-white/40 text-xs truncate">{member.status_message}</p>
        )}
      </div>
      {/* Role badge */}
      {member.role === 'admin' && (
        <span className="text-xs bg-kakao-yellow/20 text-kakao-yellow px-2 py-0.5 rounded-full flex-shrink-0">관리자</span>
      )}
    </div>
  );
}
