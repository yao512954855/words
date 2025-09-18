'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  StopIcon, 
  Cog6ToothIcon,
  SpeakerWaveIcon 
} from '@heroicons/react/24/outline';
import { audioCache } from '@/app/lib/audio-cache';

interface ContinuousReadingProps {
  words: Array<{
    id: string;
    name: string;
    image_url: string;
    email: string;
    ok: string;
  }>;
  onWordChange?: (currentIndex: number, word: any) => void;
}

interface ReadingSettings {
  interval: number; // 间隔时间（秒）
  repeatCount: number; // 每个单词重复次数
}

export default function ContinuousReading({ words, onWordChange }: ContinuousReadingProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentRepeat, setCurrentRepeat] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<ReadingSettings>({
    interval: 2, // 默认2秒间隔
    repeatCount: 1 // 默认每个单词读1次
  });
  const [isReading, setIsReading] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(false);

  // 同步isPlaying状态到ref
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 播放单个单词的音频
  const playWordAudio = async (word: string): Promise<boolean> => {
    try {
      setIsReading(true);
      console.log('🔊 Playing word:', word);

      // 方案1: 尝试使用缓存的音频文件
      let audio = await audioCache.getAudio(word);
      
      if (!audio) {
        // 缓存未命中，从服务器获取音频
        try {
          const audioResponse = await fetch(`/api/audio?text=${encodeURIComponent(word)}`);
          
          if (audioResponse.ok) {
            const audioData = await audioResponse.json();
            
            if (audioData.success && audioData.audioUrl) {
              // 缓存音频并获取Audio对象
              audio = await audioCache.cacheAudio(word, audioData.audioUrl);
            }
          }
        } catch (error) {
          console.log('⚠️ Server audio failed:', error);
        }
      }

      // 如果有音频对象，播放它
      if (audio) {
        return new Promise((resolve) => {
          // 重置音频到开始位置
          audio!.currentTime = 0;
          audio!.muted = false;
          audio!.volume = 1.0;
          
          const handleEnded = () => {
            console.log('✅ Audio playback ended');
            audio!.removeEventListener('ended', handleEnded);
            audio!.removeEventListener('error', handleError);
            setIsReading(false);
            resolve(true);
          };
          
          const handleError = () => {
            console.log('❌ Audio playback error');
            audio!.removeEventListener('ended', handleEnded);
            audio!.removeEventListener('error', handleError);
            setIsReading(false);
            resolve(false);
          };
          
          audio!.addEventListener('ended', handleEnded);
          audio!.addEventListener('error', handleError);
          
          audio!.play().catch(() => {
            audio!.removeEventListener('ended', handleEnded);
            audio!.removeEventListener('error', handleError);
            setIsReading(false);
            resolve(false);
          });
        });
      }

      // 方案2: 降级到浏览器的SpeechSynthesis
      return new Promise((resolve) => {
        if (!('speechSynthesis' in window)) {
          setIsReading(false);
          resolve(false);
          return;
        }

        // 停止当前正在播放的语音
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onend = () => {
          setIsReading(false);
          resolve(true);
        };

        utterance.onerror = () => {
          setIsReading(false);
          resolve(false);
        };

        // 获取可用的语音
        const voices = window.speechSynthesis.getVoices();
        const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
        
        if (englishVoices.length > 0) {
          const preferredVoice = englishVoices.find(voice => 
            voice.lang === 'en-US'
          ) || englishVoices[0];
          utterance.voice = preferredVoice;
        }

        window.speechSynthesis.speak(utterance);
      });

    } catch (error) {
      console.error('❌ Speech failed completely:', error);
      setIsReading(false);
      return false;
    }
  };

  // 播放指定索引的单词
  const playWordAtIndex = async (index: number, repeat: number = 0) => {
    if (!isPlayingRef.current || words.length === 0 || index >= words.length) {
      return;
    }

    const currentWord = words[index];
    if (!currentWord) {
      stopReading();
      return;
    }

    // 更新状态
    setCurrentIndex(index);
    setCurrentRepeat(repeat);

    // 通知父组件当前单词变化
    onWordChange?.(index, currentWord);

    // 播放当前单词
    const success = await playWordAudio(currentWord.name);
    
    if (!isPlayingRef.current) {
      return; // 如果在播放过程中被停止，直接返回
    }

    if (success) {
      // 检查是否需要重复当前单词
      if (repeat + 1 < settings.repeatCount) {
        // 等待间隔时间后重复播放当前单词
        timeoutRef.current = setTimeout(() => {
          if (isPlayingRef.current) {
            playWordAtIndex(index, repeat + 1);
          }
        }, settings.interval * 1000);
      } else {
        // 当前单词播放完毕，移动到下一个单词
        const nextIndex = index + 1;
        if (nextIndex < words.length) {
          // 等待间隔时间后播放下一个单词
          timeoutRef.current = setTimeout(() => {
            if (isPlayingRef.current) {
              playWordAtIndex(nextIndex, 0);
            }
          }, settings.interval * 1000);
        } else {
          // 所有单词播放完毕
          stopReading();
        }
      }
    } else {
      // 播放失败，跳到下一个单词
      const nextIndex = index + 1;
      if (nextIndex < words.length) {
        timeoutRef.current = setTimeout(() => {
          if (isPlayingRef.current) {
            playWordAtIndex(nextIndex, 0);
          }
        }, 500); // 失败时短暂延迟
      } else {
        stopReading();
      }
    }
  };

  // 播放下一个单词（保持向后兼容）
  const playNextWord = async () => {
    await playWordAtIndex(currentIndex, currentRepeat);
  };

  // 开始播放
  const startReading = () => {
    if (words.length === 0) {
      alert('没有可朗读的单词');
      return;
    }

    setIsPlaying(true);
    
    // 开始播放第一个单词
    setTimeout(() => {
      playWordAtIndex(0, 0);
    }, 100);
  };

  // 暂停播放
  const pauseReading = () => {
    setIsPlaying(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // 停止当前音频播放
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setIsReading(false);
  };

  // 停止播放
  const stopReading = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    setCurrentRepeat(0);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // 停止当前音频播放
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setIsReading(false);
    
    // 通知父组件重置
    onWordChange?.(-1, null);
  };

  // 继续播放
  const resumeReading = () => {
    setIsPlaying(true);
    setTimeout(() => {
      playNextWord();
    }, 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SpeakerWaveIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">连续朗读</h3>
          <span className="text-sm text-gray-500">
            ({words.length} 个单词)
          </span>
        </div>
        
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          title="设置"
        >
          <Cog6ToothIcon className="w-5 h-5" />
        </button>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="bg-gray-50 rounded-md p-3 mb-4 space-y-3">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 min-w-0 flex-shrink-0">
              间隔时间:
            </label>
            <select
              value={settings.interval}
              onChange={(e) => setSettings(prev => ({ ...prev, interval: Number(e.target.value) }))}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isPlaying}
            >
              <option value={1}>1秒</option>
              <option value={2}>2秒</option>
              <option value={3}>3秒</option>
              <option value={4}>4秒</option>
              <option value={5}>5秒</option>
            </select>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 min-w-0 flex-shrink-0">
              重复次数:
            </label>
            <select
              value={settings.repeatCount}
              onChange={(e) => setSettings(prev => ({ ...prev, repeatCount: Number(e.target.value) }))}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isPlaying}
            >
              <option value={1}>1次</option>
              <option value={2}>2次</option>
              <option value={3}>3次</option>
              <option value={4}>4次</option>
              <option value={5}>5次</option>
            </select>
          </div>
        </div>
      )}

      {/* 控制按钮 */}
      <div className="flex items-center gap-3">
        {!isPlaying ? (
          <button
            onClick={currentIndex > 0 ? resumeReading : startReading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={words.length === 0}
          >
            <PlayIcon className="w-4 h-4" />
            {currentIndex > 0 ? '继续' : '开始'}
          </button>
        ) : (
          <button
            onClick={pauseReading}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <PauseIcon className="w-4 h-4" />
            暂停
          </button>
        )}
        
        <button
          onClick={stopReading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          disabled={!isPlaying && currentIndex === 0}
        >
          <StopIcon className="w-4 h-4" />
          停止
        </button>
      </div>

      {/* 进度显示 */}
      {words.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>
              进度: {currentIndex + 1} / {words.length}
              {settings.repeatCount > 1 && ` (第 ${currentRepeat + 1} 次)`}
            </span>
            <span>
              {isReading ? '朗读中...' : isPlaying ? '等待中...' : '已暂停'}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${words.length > 0 ? ((currentIndex + (currentRepeat / settings.repeatCount)) / words.length) * 100 : 0}%` 
              }}
            />
          </div>
          
          {words[currentIndex] && (
            <div className="mt-2 text-sm text-gray-700">
              当前单词: <span className="font-medium text-blue-600">{words[currentIndex].name}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}