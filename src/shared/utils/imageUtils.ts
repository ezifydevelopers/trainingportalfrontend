import { getApiBaseUrl } from '@/lib/api';

// Simple URL cache for performance optimization
const urlCache = new Map<string, string>();
const CACHE_SIZE_LIMIT = 100; // Reduced cache size

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
 * Generates a proper video URL with CORS handling and simple caching
 * @param videoUrl - The video URL or filename
 * @returns Complete URL for the video
 */
export const getVideoUrl = (videoUrl: string): string => {
  if (!videoUrl) return "";
  
  // Check cache first
  if (urlCache.has(videoUrl)) {
    return urlCache.get(videoUrl)!;
  }
  
  // If it's already a complete URL, return as is
  if (videoUrl.startsWith('http')) {
    if (urlCache.size < CACHE_SIZE_LIMIT) {
      urlCache.set(videoUrl, videoUrl);
    }
    return videoUrl;
  }
  
  // Get the base URL and remove /api for file uploads
  const baseUrl = getApiBaseUrl().replace('/api', '');
  
  // Clean the video URL to remove any double slashes
  const cleanVideoUrl = videoUrl.replace(/\/+/g, '/');
  
  // If the video URL already starts with /uploads/, use it as is
  // Otherwise, add /uploads/ prefix
  const normalizedUrl = cleanVideoUrl.startsWith('/uploads/') ? cleanVideoUrl : `/uploads/${cleanVideoUrl}`;
  
  // Combine base URL and normalized URL
  const finalUrl = `${baseUrl}${normalizedUrl}`;
  
  // Cache the URL
  if (urlCache.size < CACHE_SIZE_LIMIT) {
    urlCache.set(videoUrl, finalUrl);
  }
  
  return finalUrl;
};

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
