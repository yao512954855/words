// 音频缓存管理工具

interface AudioCacheItem {
  url: string;
  timestamp: number;
  audio?: HTMLAudioElement;
}

class AudioCacheManager {
  private cache = new Map<string, AudioCacheItem>();
  private maxCacheSize = 50; // 最多缓存50个音频文件
  private maxAge = 30 * 60 * 1000; // 30分钟过期

  // 获取缓存的音频
  async getAudio(text: string): Promise<HTMLAudioElement | null> {
    const cacheKey = this.getCacheKey(text);
    const cached = this.cache.get(cacheKey);

    if (cached && this.isValidCache(cached)) {
      console.log('🎵 Using cached audio for:', text);
      
      // 如果已经有Audio对象，直接返回
      if (cached.audio) {
        return cached.audio;
      }
      
      // 如果只有URL，创建新的Audio对象
      const audio = new Audio(cached.url);
      cached.audio = audio;
      return audio;
    }

    // 缓存未命中或已过期
    console.log('🔄 Cache miss for:', text);
    return null;
  }

  // 缓存音频
  async cacheAudio(text: string, audioUrl: string): Promise<HTMLAudioElement> {
    const cacheKey = this.getCacheKey(text);
    
    // 清理过期缓存
    this.cleanExpiredCache();
    
    // 如果缓存已满，删除最旧的项目
    if (this.cache.size >= this.maxCacheSize) {
      this.removeOldestCache();
    }

    // 创建Audio对象
    const audio = new Audio(audioUrl);
    
    // 预加载音频
    audio.preload = 'auto';
    
    // 缓存音频信息
    this.cache.set(cacheKey, {
      url: audioUrl,
      timestamp: Date.now(),
      audio: audio
    });

    console.log('💾 Cached audio for:', text, 'Cache size:', this.cache.size);
    return audio;
  }

  // 预加载常用单词的音频
  async preloadCommonWords(words: string[]): Promise<void> {
    console.log('🚀 Preloading audio for common words:', words.length);
    
    for (const word of words.slice(0, 10)) { // 只预加载前10个
      try {
        const response = await fetch(`/api/audio?text=${encodeURIComponent(word)}`);
        if (response.ok) {
          const data = await response.json();
          // 只有在服务器成功生成音频时才缓存
          if (data.success && data.audioUrl && !data.fallback) {
            await this.cacheAudio(word, data.audioUrl);
          } else {
            console.log('⚠️ Skipping preload for', word, '- server TTS unavailable');
          }
        }
      } catch (error) {
        console.warn('Failed to preload audio for:', word, error);
      }
    }
  }

  // 清理所有缓存
  clearCache(): void {
    console.log('🗑️ Clearing audio cache');
    this.cache.clear();
  }

  // 获取缓存统计信息
  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize
    };
  }

  // 私有方法：生成缓存键
  private getCacheKey(text: string): string {
    return text.toLowerCase().trim();
  }

  // 私有方法：检查缓存是否有效
  private isValidCache(cached: AudioCacheItem): boolean {
    return Date.now() - cached.timestamp < this.maxAge;
  }

  // 私有方法：清理过期缓存
  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp >= this.maxAge) {
        this.cache.delete(key);
      }
    }
  }

  // 私有方法：删除最旧的缓存项
  private removeOldestCache(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, cached] of this.cache.entries()) {
      if (cached.timestamp < oldestTime) {
        oldestTime = cached.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log('🗑️ Removed oldest cache item:', oldestKey);
    }
  }
}

// 创建全局音频缓存管理器实例
export const audioCache = new AudioCacheManager();

// 导出类型
export type { AudioCacheItem };