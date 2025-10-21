// Service Worker for Video Caching and Performance
const CACHE_NAME = 'video-cache-v1';
const VIDEO_CACHE_NAME = 'video-files-v1';
const STATIC_CACHE_NAME = 'static-assets-v1';

// Video file extensions to cache
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.avi', '.mov'];
const STATIC_EXTENSIONS = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2'];

// Install event - set up caches
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    Promise.all([
      caches.open(VIDEO_CACHE_NAME),
      caches.open(STATIC_CACHE_NAME),
      caches.open(CACHE_NAME)
    ]).then(() => {
      console.log('Service Worker installed successfully');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== VIDEO_CACHE_NAME && 
              cacheName !== STATIC_CACHE_NAME && 
              cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - handle caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and other unsupported schemes
  if (url.protocol === 'chrome-extension:' || 
      url.protocol === 'moz-extension:' ||
      url.protocol === 'safari-extension:') {
    return;
  }

  // Handle video files with range request support
  if (isVideoFile(url.pathname)) {
    event.respondWith(handleVideoRequest(request));
    return;
  }

  // Handle static assets
  if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticAssetRequest(request));
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Default: network first, cache fallback
  event.respondWith(handleDefaultRequest(request));
});

// Check if file is a video
function isVideoFile(pathname) {
  return VIDEO_EXTENSIONS.some(ext => pathname.toLowerCase().endsWith(ext));
}

// Check if file is a static asset
function isStaticAsset(pathname) {
  return STATIC_EXTENSIONS.some(ext => pathname.toLowerCase().endsWith(ext));
}

// Handle video requests with range request support
async function handleVideoRequest(request) {
  try {
    // Check if this is a range request
    const rangeHeader = request.headers.get('range');
    const isRangeRequest = !!rangeHeader;
    
    if (isRangeRequest) {
      // For range requests, always go to network (don't cache partial responses)
      console.log('Range request for video:', request.url, rangeHeader);
      return fetch(request);
    }
    
    // For non-range requests, try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('Video served from cache:', request.url);
      return cachedResponse;
    }

    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    // Only cache complete responses (status 200, not 206)
    if (networkResponse.ok && networkResponse.status === 200) {
      try {
        // Clone response for caching
        const responseToCache = networkResponse.clone();
        
        // Cache the complete video
        const cache = await caches.open(VIDEO_CACHE_NAME);
        await cache.put(request, responseToCache);
        console.log('Complete video cached:', request.url);
      } catch (cacheError) {
        console.warn('Failed to cache video:', request.url, cacheError);
      }
    } else if (networkResponse.status === 206) {
      console.log('Partial video response (range request):', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Error handling video request:', error);
    return new Response('Video not available', { status: 404 });
  }
}

// Handle static asset requests
async function handleStaticAssetRequest(request) {
  try {
    // Skip chrome-extension and other unsupported schemes
    if (request.url.startsWith('chrome-extension:') || 
        request.url.startsWith('moz-extension:') ||
        request.url.startsWith('safari-extension:')) {
      return fetch(request);
    }

    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && networkResponse.status !== 206) {
      try {
        const responseToCache = networkResponse.clone();
        const cache = await caches.open(STATIC_CACHE_NAME);
        await cache.put(request, responseToCache);
      } catch (cacheError) {
        console.warn('Failed to cache static asset:', request.url, cacheError);
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Error handling static asset request:', error);
    return new Response('Asset not available', { status: 404 });
  }
}

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful API responses for a short time
      const responseToCache = networkResponse.clone();
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cache if network fails
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('API not available', { status: 503 });
  }
}

// Handle default requests
async function handleDefaultRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Resource not available', { status: 404 });
  }
}

// Background sync for video preloading
self.addEventListener('sync', (event) => {
  if (event.tag === 'video-preload') {
    event.waitUntil(preloadVideos());
  }
});

// Preload videos in background
async function preloadVideos() {
  try {
    // Get video URLs from IndexedDB or storage
    const videoUrls = await getVideoUrlsToPreload();
    
    for (const url of videoUrls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const cache = await caches.open(VIDEO_CACHE_NAME);
          await cache.put(url, response);
          console.log('Background preloaded video:', url);
        }
      } catch (error) {
        console.error('Failed to preload video:', url, error);
      }
    }
  } catch (error) {
    console.error('Error in video preloading:', error);
  }
}

// Get video URLs to preload (placeholder - implement based on your data structure)
async function getVideoUrlsToPreload() {
  // This should be implemented based on your application's data structure
  // For now, return empty array
  return [];
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'PRELOAD_VIDEOS':
      preloadVideos();
      break;
    case 'CLEAR_CACHE':
      clearVideoCache();
      break;
    case 'GET_CACHE_SIZE':
      getCacheSize().then(size => {
        event.ports[0].postMessage({ type: 'CACHE_SIZE', size });
      });
      break;
  }
});

// Clear video cache
async function clearVideoCache() {
  try {
    await caches.delete(VIDEO_CACHE_NAME);
    console.log('Video cache cleared');
  } catch (error) {
    console.error('Error clearing video cache:', error);
  }
}

// Get cache size
async function getCacheSize() {
  try {
    const cache = await caches.open(VIDEO_CACHE_NAME);
    const keys = await cache.keys();
    return keys.length;
  } catch (error) {
    console.error('Error getting cache size:', error);
    return 0;
  }
}
