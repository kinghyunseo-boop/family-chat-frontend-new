import React, { useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, uploadFile, getPublicUrl } from '../../utils/supabase';
import { HiLogout, HiCamera, HiUser } from 'react-icons/hi';

export default function Settings() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const [nickname, setNickname] = useState(profile?.nickname || '');
  const [statusMsg, setStatusMsg] = useState(profile?.status_message || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ nickname, status_message: statusMsg });
      alert('저장되었습니다.');
    } catch (e) {
      alert('저장 실패: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('파일 크기는 5MB 이하여야 합니다.'); return; }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `avatars/${user.id}.${ext}`;
      await uploadFile('chat-files', path, file);
      const url = getPublicUrl('chat-files', path);
      await updateProfile({ avatar_url: url });
    } catch (e) {
      alert('업로드 실패: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto text-white">
      {/* Profile header */}
      <div className="bg-kakao-accent/10 px-4 py-6 flex flex-col items-center gap-3 border-b border-white/5">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-white/10 overflow-hidden flex items-center justify-center">
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              : <HiUser className="w-10 h-10 text-white/30" />}
          </div>
          <button
            onClick={() => fileRef.current.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-kakao-yellow rounded-full flex items-center justify-center shadow"
          >
            {uploading
              ? <svg className="animate-spin w-4 h-4 text-kakao-brown" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              : <HiCamera className="w-4 h-4 text-kakao-brown" />
            }
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </div>
        <div className="text-center">
          <p className="font-bold text-lg">{profile?.nickname || '이름 없음'}</p>
          <p className="text-white/40 text-sm">{user?.email}</p>
        </div>
      </div>

      {/* Edit fields */}
      <div className="p-4 space-y-4">
        <div>
          <label className="text-white/50 text-xs mb-1 block">닉네임</label>
          <input
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            placeholder="닉네임을 입력하세요"
            className="w-full bg-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-kakao-yellow border border-white/10"
          />
        </div>
        <div>
          <label className="text-white/50 text-xs mb-1 block">상태 메시지</label>
          <input
            value={statusMsg}
            onChange={e => setStatusMsg(e.target.value)}
            placeholder="상태 메시지"
            maxLength={60}
            className="w-full bg-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-kakao-yellow border border-white/10"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-kakao-yellow text-kakao-brown font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>

      <div className="px-4 pb-8">
        <button
          onClick={() => { if(window.confirm('로그아웃 하시겠어요?')) signOut(); }}
          className="w-full flex items-center justify-center gap-2 text-red-400 border border-red-400/20 bg-red-400/5 py-3 rounded-xl text-sm hover:bg-red-400/10 transition-colors"
        >
          <HiLogout className="w-5 h-5" />
          로그아웃
        </button>
      </div>
    </div>
  );
}
