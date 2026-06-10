import React, { useState } from 'react';
import { format } from 'date-fns';
import { HiUser, HiDocumentText, HiDownload } from 'react-icons/hi';
import LinkPreview from './LinkPreview';

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export default function MessageBubble({ message, isMe, showAvatar, showTime }) {
  const time = format(new Date(message.created_at), 'HH:mm');
  const { message_type, content, sender, metadata } = message;

  const hasUrl = message_type === 'TEXT' && URL_REGEX.test(content);
  const urlMatch = hasUrl ? content.match(URL_REGEX) : null;

  return (
    <div className={`flex items-end gap-2 mb-0.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!isMe && (
        <div className={`w-8 h-8 rounded-full flex-shrink-0 overflow-hidden bg-white/10 flex items-center justify-center ${showAvatar ? 'visible' : 'invisible'}`}>
          {sender?.avatar_url
            ? <img src={sender.avatar_url} alt={sender.nickname} className="w-full h-full object-cover" />
            : <HiUser className="w-4 h-4 text-white/30" />}
        </div>
      )}

      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {/* Sender name */}
        {!isMe && showAvatar && (
          <span className="text-white/50 text-xs mb-1 ml-1">{sender?.nickname || '알 수 없음'}</span>
        )}

        <div className={`flex items-end gap-1.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Bubble */}
          <div className={`rounded-2xl overflow-hidden max-w-full ${
            isMe
              ? 'bg-kakao-yellow text-kakao-brown rounded-tr-sm'
              : 'bg-white text-gray-800 rounded-tl-sm'
          }`}>
            {message_type === 'TEXT' && (
              <div className="px-3.5 py-2.5">
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {content.split(URL_REGEX).map((part, i) =>
                    URL_REGEX.test(part)
                      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline opacity-80 break-all">{part}</a>
                      : part
                  )}
                </p>
              </div>
            )}

            {message_type === 'IMAGE' && (
              <a href={content} target="_blank" rel="noopener noreferrer">
                <img
                  src={content}
                  alt="이미지"
                  className="max-w-full max-h-64 object-cover"
                  loading="lazy"
                />
              </a>
            )}

            {message_type === 'VIDEO' && (
              <video
                src={content}
                controls
                className="max-w-full max-h-64"
                playsInline
              />
            )}

            {message_type === 'FILE' && (
              <a
                href={content}
                download={metadata?.filename}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 bg-kakao-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <HiDocumentText className="w-5 h-5 text-kakao-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate max-w-[150px]">
                    {metadata?.filename || '파일'}
                  </p>
                  <p className="text-xs opacity-60">
                    {metadata?.size ? formatFileSize(metadata.size) : ''}
                  </p>
                </div>
                <HiDownload className="w-4 h-4 opacity-50 flex-shrink-0" />
              </a>
            )}
          </div>

          {/* Time */}
          {showTime && (
            <span className="text-white/30 text-[10px] flex-shrink-0 mb-0.5">{time}</span>
          )}
        </div>

        {/* Link Preview */}
        {hasUrl && urlMatch && (
          <div className="mt-1 w-full">
            <LinkPreview url={urlMatch[0]} isMe={isMe} />
          </div>
        )}
      </div>
    </div>
  );
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + 'B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
}
