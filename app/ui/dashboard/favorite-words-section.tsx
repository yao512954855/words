'use client';

import { ArrowPathIcon, EyeIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import { useState, useEffect } from 'react';

interface FavoriteWord {
  id: string;
  word_text: string;
  favorite_count: number;
  image_url: string;
  created_at: string;
  last_favorited_at: string;
}

export default function FavoriteWordsSection() {
  const [favoriteWords, setFavoriteWords] = useState<FavoriteWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavoriteWords = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/favorite-stats?sortBy=recent&limit=5`);
      if (!response.ok) {
        throw new Error('Failed to fetch favorite words');
      }
      const data = await response.json();
      setFavoriteWords(data.favoriteWords || []);
    } catch (error) {
      console.error('Error fetching favorite words:', error);
      setFavoriteWords([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavoriteWords();
  }, []);

  return (
    <div className="flex w-full flex-col">
      <div className="mb-4">
        <h2 className={`${lusitana.className} text-xl md:text-2xl`}>
          新收藏单词
        </h2>
      </div>
      
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">
        <div className="bg-white px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-500">加载中...</span>
            </div>
          ) : favoriteWords.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-gray-500">暂无收藏单词记录</p>
            </div>
          ) : (
            favoriteWords.map((favoriteWord, i) => (
              <div
                key={favoriteWord.id}
                className={clsx(
                  'flex flex-row items-center justify-between py-4',
                  {
                    'border-t': i !== 0,
                  },
                )}
              >
                <div className="flex items-center">
                  <Image
                    src={favoriteWord.image_url}
                    alt={`${favoriteWord.word_text}'s picture`}
                    className="mr-4 rounded-full"
                    width={32}
                    height={32}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold md:text-base">
                      {favoriteWord.word_text}
                    </p>
                    <p className="hidden text-sm text-gray-500 sm:block">
                      最后收藏: {new Date(favoriteWord.last_favorited_at).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
                <p
                  className={`${lusitana.className} truncate text-sm font-medium md:text-base text-blue-600`}
                >
                  {favoriteWord.favorite_count} 次
                </p>
              </div>
            ))
          )}
        </div>
        <div className="flex items-center justify-between pb-2 pt-6">
          <div className="flex items-center">
            <ArrowPathIcon className="h-5 w-5 text-gray-500" />
            <h3 className="ml-2 text-sm text-gray-500">
              按最新收藏排序
            </h3>
          </div>
          <Link
            href="/dashboard/favorite-words"
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            查看全部
          </Link>
        </div>
      </div>
    </div>
  );
}