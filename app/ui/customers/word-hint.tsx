'use client';

import { useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon, HeartIcon, LanguageIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface WordHintProps {
  word: string;
  wordId: string;
}

export default function WordHint({ word, wordId }: WordHintProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [translation, setTranslation] = useState<string>('');
  const [showTranslation, setShowTranslation] = useState(false);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);

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

  const toggleVisibility = () => {
    if (!isVisible) {
      // 只在显示提示时记录点击
      recordHintClick();
    }
    setIsVisible(!isVisible);
  };

  return (
    <div className="flex items-center gap-2 text-gray-500 mt-1">
      <button
        onClick={toggleVisibility}
        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
        type="button"
      >
        {isVisible ? (
          <>
            <EyeSlashIcon className="w-3 h-3" />
            隐藏
          </>
        ) : (
          <>
            <EyeIcon className="w-3 h-3" />
            提示
          </>
        )}
      </button>
      
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
      
      <button
        onClick={toggleTranslation}
        disabled={isLoadingTranslation}
        className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
          showTranslation 
            ? 'bg-purple-100 hover:bg-purple-200 text-purple-600' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        } ${isLoadingTranslation ? 'opacity-50 cursor-not-allowed' : ''}`}
        type="button"
      >
        <LanguageIcon className="w-3 h-3" />
        {isLoadingTranslation ? '翻译中...' : showTranslation ? '隐藏翻译' : '翻译'}
      </button>
      
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
  );
}