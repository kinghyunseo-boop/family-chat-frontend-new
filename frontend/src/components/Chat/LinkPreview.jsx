import React, { useEffect, useState } from 'react';

export default function LinkPreview({ url, isMe }) {
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchMeta();
  }, [url]);

  const fetchMeta = async () => {
    try {
      // Use our backend proxy to avoid CORS
      const res = await fetch(`/api/og-preview?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      if (data.title || data.description || data.image) setMeta(data);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className={`rounded-xl px-3 py-2 text-xs opacity-50 ${isMe ? 'bg-kakao-yellow/50 text-kakao-brown' : 'bg-white/20 text-white'}`}>
      링크 로딩 중...
    </div>
  );
  if (error || !meta) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block rounded-xl overflow-hidden border transition-opacity hover:opacity-90 ${
        isMe ? 'bg-kakao-yellow/60 border-kakao-brown/20' : 'bg-white/90 border-gray-200'
      }`}
    >
      {meta.image && (
        <img src={meta.image} alt="" className="w-full h-32 object-cover" loading="lazy" />
      )}
      <div className="px-3 py-2">
        {meta.title && (
          <p className={`text-xs font-semibold line-clamp-2 ${isMe ? 'text-kakao-brown' : 'text-gray-800'}`}>
            {meta.title}
          </p>
        )}
        {meta.description && (
          <p className={`text-xs mt-0.5 line-clamp-2 ${isMe ? 'text-kakao-brown/70' : 'text-gray-500'}`}>
            {meta.description}
          </p>
        )}
        <p className={`text-[10px] mt-1 truncate ${isMe ? 'text-kakao-brown/50' : 'text-gray-400'}`}>
          {new URL(url).hostname}
        </p>
      </div>
    </a>
  );
}
