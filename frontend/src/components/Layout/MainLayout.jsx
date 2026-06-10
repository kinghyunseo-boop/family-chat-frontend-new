import React, { useState } from 'react';
import { HiUserGroup, HiChat, HiCog } from 'react-icons/hi';
import FriendsList from '../Friends/FriendsList';
import ChatList from '../Chat/ChatList';
import Settings from './Settings';

export default function MainLayout() {
  const [tab, setTab] = useState('chats');

  return (
    <div className="h-screen bg-kakao-sidebar flex flex-col overflow-hidden max-w-md mx-auto relative">
      {/* Top bar */}
      <div className="bg-kakao-sidebar px-4 pt-safe pt-4 pb-2 border-b border-white/5 flex items-center justify-between">
        <h1 className="text-white font-bold text-lg tracking-tight">
          {tab === 'friends' ? '친구' : tab === 'chats' ? '채팅' : '설정'}
        </h1>
        {tab === 'chats' && (
          <button className="text-white/60 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'friends' && <FriendsList />}
        {tab === 'chats' && <ChatList />}
        {tab === 'settings' && <Settings />}
      </div>

      {/* Bottom nav */}
      <div className="bg-kakao-sidebar border-t border-white/5 pb-safe">
        <div className="flex">
          {[
            { id: 'friends', icon: HiUserGroup, label: '친구' },
            { id: 'chats', icon: HiChat, label: '채팅' },
            { id: 'settings', icon: HiCog, label: '설정' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
                tab === id ? 'text-kakao-yellow' : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
