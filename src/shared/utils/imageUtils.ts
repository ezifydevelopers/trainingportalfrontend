import { getApiBaseUrl } from '@/lib/api';

// URL cache for performance optimization
const urlCache = new Map<string, string>();
const CACHE_SIZE_LIMIT = 1000;

// Network quality detection
let networkQuality: 'good' | 'medium' | 'poor' = 'good';
let connectionSpeed = 0;

// Initialize network monitoring
if ('connection' in navigator) {
  const connection = (navigator as any).connection;
  connectionSpeed = connection.downlink || 0;
  
  if (connectionSpeed > 2) {
    networkQuality = 'good';
  } else if (connectionSpeed > 0.5) {
    networkQuality = 'medium';
  } else {
    networkQuality = 'poor';
  }
  
  connection.addEventListener('change', () => {
    connectionSpeed = connection.downlink || 0;
    if (connectionSpeed > 2) {
      networkQuality = 'good';
    } else if (connectionSpeed > 0.5) {
      networkQuality = 'medium';
    } else {
      networkQuality = 'poor';
    }
  });
}

/**
 * Generates a proper image URL with CORS handling and caching
 * @param imageUrl - The image URL or filename
 * @returns Complete URL for the image
 */
export const getImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return "";
  
  // Check cache first
  if (urlCache.has(imageUrl)) {
    return urlCache.get(imageUrl)!;
  }
  
  // If it's already a complete URL, return as is
  if (imageUrl.startsWith('http')) {
    // Cache the URL
    if (urlCache.size < CACHE_SIZE_LIMIT) {
      urlCache.set(imageUrl, imageUrl);
    }
    return imageUrl;
  }
  
  // Get the base URL and remove /api for file uploads
  const baseUrl = getApiBaseUrl().replace('/api', '');
  
  // Clean the image URL to remove any double slashes
  const cleanImageUrl = imageUrl.replace(/\/+/g, '/');
  
  // Ensure the image URL starts with /uploads/ if it doesn't already
  const normalizedUrl = cleanImageUrl.startsWith('/uploads/') ? cleanImageUrl : `/uploads/${cleanImageUrl}`;
  
  // Combine base URL and normalized URL
  const finalUrl = `${baseUrl}${normalizedUrl}`;
  
  // Cache the URL
  if (urlCache.size < CACHE_SIZE_LIMIT) {
    urlCache.set(imageUrl, finalUrl);
  }
  
  return finalUrl;
};

/**
 * Generates a proper video URL with CORS handling, caching, and quality optimization
 * @param videoUrl - The video URL or filename
 * @param quality - Video quality preference
 * @returns Complete URL for the video with optimization parameters
 */
export const getVideoUrl = (videoUrl: string, quality?: 'auto' | 'high' | 'medium' | 'low'): string => {
  if (!videoUrl) return "";
  
  // Check cache first
  const cacheKey = `${videoUrl}-${quality || 'auto'}`;
  if (urlCache.has(cacheKey)) {
    return urlCache.get(cacheKey)!;
  }
  
  // If it's already a complete URL, return as is
  if (videoUrl.startsWith('http')) {
    const optimizedUrl = addVideoOptimizationParams(videoUrl, quality);
    if (urlCache.size < CACHE_SIZE_LIMIT) {
      urlCache.set(cacheKey, optimizedUrl);
    }
    return optimizedUrl;
  }
  
  // Get the base URL and remove /api for file uploads
  const baseUrl = getApiBaseUrl().replace('/api', '');
  
  // Clean the video URL to remove any double slashes
  const cleanVideoUrl = videoUrl.replace(/\/+/g, '/');
  
  // If the video URL already starts with /uploads/, use it as is
  // Otherwise, add /uploads/ prefix
  const normalizedUrl = cleanVideoUrl.startsWith('/uploads/') ? cleanVideoUrl : `/uploads/${cleanVideoUrl}`;
  
  // Combine base URL and normalized URL
  const baseUrlWithPath = `${baseUrl}${normalizedUrl}`;
  
  // Add optimization parameters
  const finalUrl = addVideoOptimizationParams(baseUrlWithPath, quality);
  
  // Cache the URL
  if (urlCache.size < CACHE_SIZE_LIMIT) {
    urlCache.set(cacheKey, finalUrl);
  }
  
  return finalUrl;
};

/**
 * Add video optimization parameters to URL
 */
function addVideoOptimizationParams(url: string, quality?: 'auto' | 'high' | 'medium' | 'low'): string {
  const urlObj = new URL(url);
  
  // Add quality parameter based on network conditions
  const effectiveQuality = quality || getOptimalQuality();
  urlObj.searchParams.set('quality', effectiveQuality);
  
  // Add cache busting for development
  if (process.env.NODE_ENV === 'development') {
    urlObj.searchParams.set('v', Date.now().toString());
  }
  
  // Add range request support
  urlObj.searchParams.set('range', 'bytes');
  
  // Add compression hint
  if (networkQuality === 'poor') {
    urlObj.searchParams.set('compress', 'true');
  }
  
  return urlObj.toString();
}

/**
 * Get optimal quality based on network conditions
 */
function getOptimalQuality(): string {
  if (networkQuality === 'poor') {
    return 'low';
  } else if (networkQuality === 'medium') {
    return 'medium';
  } else {
    return 'high';
  }
}

/**
 * Preload video for faster playback
 */
export const preloadVideo = (videoUrl: string, quality?: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.crossOrigin = 'anonymous';
    
    video.oncanplay = () => {
      video.remove();
      resolve();
    };
    
    video.onerror = () => {
      video.remove();
      reject(new Error('Failed to preload video'));
    };
    
    video.src = getVideoUrl(videoUrl, quality as any);
  });
};

/**
 * Batch preload multiple videos
 */
export const preloadVideos = async (videoUrls: string[], maxConcurrent: number = 3): Promise<void> => {
  const chunks = [];
  for (let i = 0; i < videoUrls.length; i += maxConcurrent) {
    chunks.push(videoUrls.slice(i, i + maxConcurrent));
  }
  
  for (const chunk of chunks) {
    await Promise.allSettled(chunk.map(url => preloadVideo(url)));
  }
};

/**
 * Get network quality information
 */
export const getNetworkInfo = () => ({
  quality: networkQuality,
  speed: connectionSpeed,
  isOnline: navigator.onLine
});

/**
 * Clear URL cache
 */
export const clearUrlCache = (): void => {
  urlCache.clear();
};

/**
 * Generates a proper resource URL with CORS handling
 * @param resourceUrl - The resource URL or filename
 * @returns Complete URL for the resource
 */
export const getResourceUrl = (resourceUrl: string): string => {
  if (!resourceUrl) return "";
  
  // If it's already a complete URL, return as is
  if (resourceUrl.startsWith('http')) {
    return resourceUrl;
  }
  
  // Get the base URL and remove /api for file uploads
  const baseUrl = getApiBaseUrl().replace('/api', '');
  
  // Clean the resource URL to remove any double slashes
  const cleanResourceUrl = resourceUrl.replace(/\/+/g, '/');
  
  // Ensure the resource URL starts with /uploads/ if it doesn't already
  const normalizedUrl = cleanResourceUrl.startsWith('/uploads/') ? cleanResourceUrl : `/uploads/${cleanResourceUrl}`;
  
  // Combine base URL and normalized URL
  const finalUrl = `${baseUrl}${normalizedUrl}`;
  
  return finalUrl;
};
