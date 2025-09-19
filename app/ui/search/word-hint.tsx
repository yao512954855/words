'use client';

import { useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon, HeartIcon, LanguageIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { audioCache } from '@/app/lib/audio-cache';

interface WordHintProps {
  word: string;
  wordId: string;
  showWord?: boolean;
  chinese_translation?: string; // 添加中文翻译字段
}

export default function WordHint({ word, wordId, showWord = true, chinese_translation }: WordHintProps) {
  // 提示功能完全独立于showWord属性，不受显示/隐藏英文单词的影响
  const [isVisible, setIsVisible] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [translation, setTranslation] = useState<string>(chinese_translation || '');
  const [showTranslation, setShowTranslation] = useState(!!chinese_translation);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  // 检查语音功能支持（现在有服务器端音频作为主要方案）
  useEffect(() => {
    console.log('🔍 Initializing speech functionality...');
    // 现在我们有服务器端音频作为主要方案，浏览器TTS作为降级方案
    // 所以总是启用语音功能
    setSpeechSupported(true);
    console.log('✅ Speech functionality enabled (server audio + browser TTS fallback)');
  }, []);

  // 检查收藏状态
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const response = await fetch(`/api/favorite?wordId=${wordId}`);
        if (response.ok) {
          const data = await response.json();
          setIsFavorited(data.isFavorited);
        }
      } catch (error) {
        console.error('Failed to check favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [wordId]);

  const recordHintClick = async () => {
    try {
      await fetch('/api/hint-record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordId: wordId,
          wordText: word,
        }),
      });
    } catch (error) {
      console.error('Failed to record hint click:', error);
    }
  };

  const toggleFavorite = async () => {
    if (isLoadingFavorite) return;
    
    setIsLoadingFavorite(true);
    try {
      const action = isFavorited ? 'remove' : 'add';
      const response = await fetch('/api/favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordId: wordId,
          wordText: word,
          action: action,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data.isFavorited);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const getTranslation = async () => {
    if (isLoadingTranslation) return;
    
    setIsLoadingTranslation(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: word,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTranslation(data.translation);
        setShowTranslation(true);
      } else {
        // 如果API失败，使用简单的预设翻译
        setTranslation(`${word}的中文翻译`);
        setShowTranslation(true);
      }
    } catch (error) {
      console.error('Failed to get translation:', error);
      // 如果出错，使用简单的预设翻译
      setTranslation(`${word}的中文翻译`);
      setShowTranslation(true);
    } finally {
      setIsLoadingTranslation(false);
    }
  };

  const toggleTranslation = () => {
    if (!showTranslation && !translation) {
      getTranslation();
    } else {
      setShowTranslation(!showTranslation);
    }
  };

  const speakWord = async () => {
    console.log('🔊 speakWord called, isSpeaking:', isSpeaking);
    
    if (isSpeaking) {
      console.log('❌ Already speaking');
      return;
    }

    try {
      setIsSpeaking(true);
      console.log('🚀 Starting audio generation for word:', word);

      // 方案1: 尝试使用缓存的音频文件
      let audio = await audioCache.getAudio(word);
      
      if (!audio) {
        // 缓存未命中，从服务器获取音频
        try {
          const audioResponse = await fetch(`/api/audio?text=${encodeURIComponent(word)}`);
          
          if (audioResponse.ok) {
            const audioData = await audioResponse.json();
            
            // 检查是否需要降级到浏览器TTS
            if (audioData.fallback || !audioData.success) {
              console.log('🔄 Server returned fallback response, using browser TTS');
              fallbackToSpeechSynthesis();
              return;
            }
            
            if (audioData.success && audioData.audioUrl) {
              console.log('✅ Got audio URL:', audioData.audioUrl);
              
              // 缓存音频并获取Audio对象
              audio = await audioCache.cacheAudio(word, audioData.audioUrl);
            }
          } else {
            console.log('⚠️ Server audio API returned error status:', audioResponse.status);
          }
        } catch (error) {
          console.log('⚠️ Server audio failed, falling back to browser TTS:', error);
        }
      }

      // 如果有音频对象，播放它
      if (audio) {
        // 重置音频到开始位置
        audio.currentTime = 0;
        
        // 设置移动端友好的属性
        audio.muted = false;
        audio.volume = 1.0;
        
        // 设置事件监听器
        const handleLoadStart = () => console.log('🎵 Audio loading started');
        const handleCanPlay = () => console.log('🎵 Audio can play');
        const handlePlay = () => console.log('✅ Audio playback started');
        const handleEnded = () => {
          console.log('✅ Audio playback ended');
          setIsSpeaking(false);
          // 清理事件监听器
          audio!.removeEventListener('loadstart', handleLoadStart);
          audio!.removeEventListener('canplay', handleCanPlay);
          audio!.removeEventListener('play', handlePlay);
          audio!.removeEventListener('ended', handleEnded);
          audio!.removeEventListener('error', handleError);
        };
        const handleError = (e: Event) => {
          console.log('❌ Audio playback error:', e);
          setIsSpeaking(false);
          // 清理事件监听器
          audio!.removeEventListener('loadstart', handleLoadStart);
          audio!.removeEventListener('canplay', handleCanPlay);
          audio!.removeEventListener('play', handlePlay);
          audio!.removeEventListener('ended', handleEnded);
          audio!.removeEventListener('error', handleError);
          // 降级到浏览器TTS
          fallbackToSpeechSynthesis();
        };
        
        // 添加事件监听器
        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);
        
        try {
          // 移动端可能需要用户交互才能播放音频
          const playPromise = audio.play();
          
          if (playPromise !== undefined) {
            await playPromise;
            console.log('✅ Audio started playing successfully');
            return; // 成功播放，直接返回
          }
        } catch (playError: any) {
          console.log('❌ Audio play failed:', playError);
          
          // 检查是否是移动端自动播放限制
          if (playError.name === 'NotAllowedError') {
            console.log('🔒 Autoplay blocked by browser, falling back to browser TTS');
          }
          
          // 清理事件监听器
          audio.removeEventListener('loadstart', handleLoadStart);
          audio.removeEventListener('canplay', handleCanPlay);
          audio.removeEventListener('play', handlePlay);
          audio.removeEventListener('ended', handleEnded);
          audio.removeEventListener('error', handleError);
        }
      }

      // 方案2: 降级到浏览器的SpeechSynthesis
      fallbackToSpeechSynthesis();

    } catch (error) {
      console.error('❌ Speech failed completely:', error);
      setIsSpeaking(false);
    }
  };

  // 降级方案：使用浏览器的SpeechSynthesis
  const fallbackToSpeechSynthesis = async () => {
    console.log('🔄 Using browser SpeechSynthesis as fallback');
    
    try {
      // 检查浏览器支持
      if (!('speechSynthesis' in window)) {
        console.log('❌ SpeechSynthesis not supported');
        setIsSpeaking(false);
        return;
      }

      // 停止当前正在播放的语音
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const utterance = new SpeechSynthesisUtterance(word);
      
      // 设置语音参数
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // 设置事件监听器
      utterance.onstart = () => {
        console.log('✅ Browser speech started');
      };

      utterance.onend = () => {
        console.log('✅ Browser speech ended');
        setIsSpeaking(false);
      };

      utterance.onerror = (event) => {
        console.log('❌ Browser speech error:', event.error);
        setIsSpeaking(false);
      };

      // 获取可用的语音
      const voices = window.speechSynthesis.getVoices();
      const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
      
      if (englishVoices.length > 0) {
        // 优先选择美式英语语音
        const preferredVoice = englishVoices.find(voice => 
          voice.lang === 'en-US'
        ) || englishVoices[0];
        
        utterance.voice = preferredVoice;
        console.log('🎯 Using voice:', preferredVoice.name);
      }

      // 开始朗读
      console.log('🚀 Starting browser speech synthesis...');
      window.speechSynthesis.speak(utterance);

    } catch (error) {
      console.error('❌ Browser speech synthesis failed:', error);
      setIsSpeaking(false);
    }
  };

  const toggleVisibility = () => {
    if (!isVisible) {
      // 只在显示提示时记录点击
      recordHintClick();
    }
    setIsVisible(!isVisible);
  };

  return (
    <>
      <div className="flex items-center gap-2 text-gray-500 mt-1"> 
      <button
        onClick={toggleFavorite}
        disabled={isLoadingFavorite}
        className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
          isFavorited 
            ? 'bg-green-100 hover:bg-green-200 text-green-600' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        } ${isLoadingFavorite ? 'opacity-50 cursor-not-allowed' : ''}`}
        type="button"
      >
        {isFavorited ? (
          <>
            <HeartSolidIcon className="w-3 h-3" />
            已收藏
          </>
        ) : (
          <>
            <HeartIcon className="w-3 h-3" />
            收藏
          </>
        )}
      </button>
      {speechSupported && (
        <button
          onClick={speakWord}
          disabled={isSpeaking}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
            isSpeaking 
              ? 'bg-orange-100 text-orange-600 cursor-not-allowed' 
              : 'bg-gray-100 hover:bg-orange-200 text-gray-600 hover:text-orange-600'
          }`}
          type="button"
          title="朗读单词"
        >
          <SpeakerWaveIcon className="w-3 h-3" />
          {isSpeaking ? '朗读中...' : '朗读'}
        </button>
      )}
      
      {/* 提示内容完全独立于单词显示状态 */}
      {isVisible && (
        <span className="text-sm font-medium text-blue-600">
          {word}
        </span>
      )}
      
      {showTranslation && translation && (
        <span className="text-sm font-medium text-purple-600">
          {translation}
        </span>
      )}
    </div>
     </>
  );
 
}