import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { HiLockClosed, HiMail, HiEye, HiEyeOff } from 'react-icons/hi';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('이메일과 비밀번호를 입력해 주세요.'); return; }
    setError(''); setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      if (err.message?.includes('Invalid login')) setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      else if (err.message?.includes('approved')) setError('아직 승인되지 않은 계정입니다. 관리자에게 문의하세요.');
      else setError('로그인에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-kakao-sidebar flex flex-col items-center justify-center px-6">
      {/* Logo area */}
      <div className="mb-10 flex flex-col items-center">
        <div className="w-24 h-24 bg-kakao-yellow rounded-3xl flex items-center justify-center text-5xl mb-5 shadow-2xl">
          💬
        </div>
        <h1 className="text-white text-3xl font-bold tracking-tight">우리가족톡</h1>
        <p className="text-white/50 text-sm mt-2">가족만을 위한 비공개 메신저</p>
      </div>

      {/* Login card */}
      <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/10">
        <h2 className="text-white text-lg font-semibold mb-5">로그인</h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 mb-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="이메일"
              className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-kakao-yellow focus:bg-white/15 transition-all"
              autoComplete="email"
            />
          </div>

          <div className="relative">
            <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="비밀번호"
              className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-11 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-kakao-yellow focus:bg-white/15 transition-all"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            >
              {showPw ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-kakao-yellow text-kakao-brown font-bold py-3 rounded-xl text-sm transition-all hover:opacity-90 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                로그인 중...
              </span>
            ) : '카카오 로그인'}
          </button>
        </form>

        <p className="text-white/30 text-xs text-center mt-5">
          가족 초대를 받지 못했다면<br />관리자에게 문의하세요.
        </p>
      </div>

      <p className="text-white/20 text-xs mt-8">우리가족톡 v1.0 · 가족 전용 서비스</p>
    </div>
  );
}
