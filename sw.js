const CACHE_NAME = 'timer-cache-v1';
// 缓存列表中包含所有必要的文件，以及闹钟声音（虽然是外部链接，但Service Worker会尝试缓存它）
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  // 注意：这个外部链接的声音缓存可能会失败，因为 CORS 限制。如果失败，离线时闹钟将无声。
  'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3' 
];

// 安装阶段：打开缓存并将所有列出的文件添加到缓存中
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: 缓存打开成功');
        return cache.addAll(urlsToCache);
      })
  );
});

// 激活阶段：清理旧的缓存版本
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // 删除不在白名单中的旧缓存
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 抓取阶段：拦截所有网络请求，优先从缓存中获取资源
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果缓存中有匹配的资源，则返回缓存资源
        if (response) {
          return response;
        }
        // 否则，进行网络请求
        return fetch(event.request);
      })
  );
});