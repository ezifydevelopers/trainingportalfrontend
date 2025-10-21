// Video optimization utilities for client-side compression and optimization

interface VideoOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  bitrate?: number; // in kbps
  frameRate?: number;
  format?: 'webm' | 'mp4';
  enableHardwareAcceleration?: boolean;
}

interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  optimizedBlob: Blob;
  duration: number;
}

export class VideoOptimizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Optimize video file for web delivery
   */
  async optimizeVideo(
    videoFile: File,
    options: VideoOptimizationOptions = {}
  ): Promise<OptimizationResult> {
    const {
      maxWidth = 1280,
      maxHeight = 720,
      quality = 0.8,
      bitrate = 1000,
      frameRate = 30,
      format = 'webm',
      enableHardwareAcceleration = true
    } = options;

    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        try {
          const { width, height } = this.calculateOptimalDimensions(
            video.videoWidth,
            video.videoHeight,
            maxWidth,
            maxHeight
          );

          this.canvas.width = width;
          this.canvas.height = height;

          const stream = this.canvas.captureStream(frameRate);
          const mimeType = this.getMimeType(format);
          
          const mediaRecorderOptions: MediaRecorderOptions = {
            mimeType,
            videoBitsPerSecond: bitrate * 1000
          };

          this.mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);
          this.chunks = [];

          this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              this.chunks.push(event.data);
            }
          };

          this.mediaRecorder.onstop = () => {
            const optimizedBlob = new Blob(this.chunks, { type: mimeType });
            const compressionRatio = (1 - optimizedBlob.size / videoFile.size) * 100;

            resolve({
              originalSize: videoFile.size,
              optimizedSize: optimizedBlob.size,
              compressionRatio,
              optimizedBlob,
              duration: video.duration
            });
          };

          this.startOptimization(video, width, height, quality);
        } catch (error) {
          reject(error);
        }
      };

      video.onerror = () => reject(new Error('Failed to load video'));
      video.src = URL.createObjectURL(videoFile);
    });
  }

  /**
   * Create multiple quality versions of a video
   */
  async createQualityVersions(
    videoFile: File,
    qualities: Array<{ label: string; maxWidth: number; maxHeight: number; bitrate: number }>
  ): Promise<Array<{ quality: string; blob: Blob; size: number }>> {
    const results = [];

    for (const quality of qualities) {
      try {
        const result = await this.optimizeVideo(videoFile, {
          maxWidth: quality.maxWidth,
          maxHeight: quality.maxHeight,
          bitrate: quality.bitrate,
          quality: 0.8
        });

        results.push({
          quality: quality.label,
          blob: result.optimizedBlob,
          size: result.optimizedSize
        });
      } catch (error) {
        console.error(`Failed to create ${quality.label} version:`, error);
      }
    }

    return results;
  }

  /**
   * Generate video thumbnail
   */
  async generateThumbnail(
    videoFile: File,
    timeOffset: number = 1
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(timeOffset, video.duration);
      };

      video.onseeked = () => {
        try {
          const { width, height } = this.calculateOptimalDimensions(
            video.videoWidth,
            video.videoHeight,
            320,
            240
          );

          this.canvas.width = width;
          this.canvas.height = height;

          this.ctx.drawImage(video, 0, 0, width, height);
          
          this.canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to generate thumbnail'));
            }
          }, 'image/jpeg', 0.8);
        } catch (error) {
          reject(error);
        }
      };

      video.onerror = () => reject(new Error('Failed to load video'));
      video.src = URL.createObjectURL(videoFile);
    });
  }

  /**
   * Analyze video file and suggest optimization settings
   */
  async analyzeVideo(videoFile: File): Promise<{
    duration: number;
    width: number;
    height: number;
    fileSize: number;
    suggestedSettings: VideoOptimizationOptions;
  }> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        const { width, height, duration } = video;
        const fileSize = videoFile.size;
        
        // Suggest optimization settings based on video characteristics
        const suggestedSettings: VideoOptimizationOptions = {
          maxWidth: width > 1920 ? 1920 : width,
          maxHeight: height > 1080 ? 1080 : height,
          quality: fileSize > 50 * 1024 * 1024 ? 0.7 : 0.8, // Lower quality for large files
          bitrate: this.calculateOptimalBitrate(width, height, duration),
          frameRate: duration > 300 ? 24 : 30, // Lower frame rate for long videos
          format: 'webm' // Better compression
        };

        resolve({
          duration,
          width,
          height,
          fileSize,
          suggestedSettings
        });
      };

      video.onerror = () => reject(new Error('Failed to analyze video'));
      video.src = URL.createObjectURL(videoFile);
    });
  }

  private calculateOptimalDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;
    
    let width = originalWidth;
    let height = originalHeight;

    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  private calculateOptimalBitrate(width: number, height: number, duration: number): number {
    const pixels = width * height;
    const durationInMinutes = duration / 60;
    
    // Base bitrate calculation
    let bitrate = Math.round(pixels / 1000); // Rough estimate
    
    // Adjust for duration (longer videos can use lower bitrates)
    if (durationInMinutes > 10) {
      bitrate *= 0.8;
    }
    
    // Ensure reasonable bounds
    return Math.max(500, Math.min(5000, bitrate));
  }

  private getMimeType(format: string): string {
    const mimeTypes = {
      webm: 'video/webm;codecs=vp9',
      mp4: 'video/mp4;codecs=h264'
    };
    
    return mimeTypes[format as keyof typeof mimeTypes] || 'video/webm;codecs=vp9';
  }

  private startOptimization(
    video: HTMLVideoElement,
    width: number,
    height: number,
    quality: number
  ): void {
    if (!this.mediaRecorder) return;

    const drawFrame = () => {
      if (video.ended || video.paused) {
        this.mediaRecorder?.stop();
        return;
      }

      this.ctx.drawImage(video, 0, 0, width, height);
      requestAnimationFrame(drawFrame);
    };

    this.mediaRecorder.start();
    video.play();
    drawFrame();
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.chunks = [];
  }
}

/**
 * Utility functions for video optimization
 */
export const videoOptimizationUtils = {
  /**
   * Check if browser supports video optimization
   */
  isOptimizationSupported(): boolean {
    return !!(
      HTMLCanvasElement.prototype.captureStream &&
      MediaRecorder &&
      document.createElement('video').canPlayType('video/webm')
    );
  },

  /**
   * Get recommended optimization settings based on device capabilities
   */
  getRecommendedSettings(): VideoOptimizationOptions {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
    
    if (isMobile || isLowEndDevice) {
      return {
        maxWidth: 854,
        maxHeight: 480,
        quality: 0.7,
        bitrate: 800,
        frameRate: 24,
        format: 'webm'
      };
    }
    
    return {
      maxWidth: 1280,
      maxHeight: 720,
      quality: 0.8,
      bitrate: 1500,
      frameRate: 30,
      format: 'webm'
    };
  },

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  },

  /**
   * Estimate compression time based on video characteristics
   */
  estimateCompressionTime(duration: number, fileSize: number): number {
    // Rough estimation: 1 second of video takes ~0.1 seconds to compress
    const baseTime = duration * 0.1;
    const sizeFactor = Math.log(fileSize / (1024 * 1024)); // MB
    return Math.round(baseTime * (1 + sizeFactor / 10));
  }
};

export default VideoOptimizer;
