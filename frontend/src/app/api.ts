export const isBrowserDemo =
  window.location.hostname.endsWith('github.io') ||
  window.location.hostname.endsWith('vercel.app') ||
  (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');

export const API =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000/api/v1'
    : '/api/v1';
