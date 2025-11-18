// Простой Service Worker для PWA
const CACHE_NAME = 'isiw-calculator-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker: Установлен');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Активирован');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Просто пропускаем все запросы
  return;
});