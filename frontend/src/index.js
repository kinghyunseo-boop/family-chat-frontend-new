import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register PWA service worker
serviceWorkerRegistration.register({
  onSuccess: () => console.log('[PWA] 앱이 오프라인에서도 사용 가능합니다.'),
  onUpdate: (registration) => {
    const confirmUpdate = window.confirm('새 버전이 있습니다. 업데이트하시겠어요?');
    if (confirmUpdate && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  },
});
