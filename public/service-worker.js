const CACHE_NAME = 'villanyszerelo-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(names => {
      return Promise.all(names.map(name => {
        if (name !== CACHE_NAME) return caches.delete(name)
      }))
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || 
      event.request.url.includes('chrome-extension')) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then(res => res || fetch(event.request))
      .catch(() => caches.match('/index.html'))
  )
})