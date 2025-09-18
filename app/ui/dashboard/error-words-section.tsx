'use client';

import { ArrowPathIcon, EyeIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import { useState, useEffect } from 'react';

interface ErrorWord {
  id: string;
  name: string;
  email: string;
  image_url: string;
  amount: number;
  wrong_inputs: string[];
}

export default function ErrorWordsSection() {
  const [sortBy, setSortBy] = useState<'count' | 'latest'>('count');
  const [errorWords, setErrorWords] = useState<ErrorWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchErrorWords = async (sortType: 'count' | 'latest') => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/error-words?sortBy=${sortType}`);
      if (!response.ok) {
        throw new Error('Failed to fetch error words');
      }
      const data = await response.json();
      setErrorWords(data);
    } catch (error) {
      console.error('Error fetching error words:', error);
      setErrorWords([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchErrorWords(sortBy);
  }, [sortBy]);

  const handleSortChange = (newSortBy: 'count' | 'latest') => {
    setSortBy(newSortBy);
  };

  return (
    <div className="flex w-full flex-col md:col-span-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className={`${lusitana.className} text-xl md:text-2xl`}>
          经常错误的单词
        </h2>
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => handleSortChange('count')}
            className={clsx(
              'px-3 py-1 text-sm font-medium rounded-md transition-colors',
              {
                'bg-white text-blue-600 shadow-sm': sortBy === 'count',
                'text-gray-600 hover:text-gray-900': sortBy !== 'count',
              }
            )}
          >
            次数最多
          </button>
          <button
            onClick={() => handleSortChange('latest')}
            className={clsx(
              'px-3 py-1 text-sm font-medium rounded-md transition-colors',
              {
                'bg-white text-blue-600 shadow-sm': sortBy === 'latest',
                'text-gray-600 hover:text-gray-900': sortBy !== 'latest',
              }
            )}
          >
            最新错误
          </button>
        </div>
      </div>
      
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">
        <div className="bg-white px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-500">加载中...</span>
            </div>
          ) : errorWords.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-gray-500">暂无错误单词记录</p>
            </div>
          ) : (
            errorWords.map((errorWord, i) => (
              <div
                key={errorWord.id}
                className={clsx(
                  'flex flex-row items-center justify-between py-4',
                  {
                    'border-t': i !== 0,
                  },
                )}
              >
                <div className="flex items-center">
                  <Image
                    src={errorWord.image_url}
                    alt={`${errorWord.name}'s profile picture`}
                    className="mr-4 rounded-full"
                    width={32}
                    height={32}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold md:text-base">
                      {errorWord.name}
                    </p>
                    <p className="hidden text-sm text-gray-500 sm:block">
                      {errorWord.email}
                    </p>
                  </div>
                </div>
                <p
                  className={`${lusitana.className} truncate text-sm font-medium md:text-base text-red-600`}
                >
                  {errorWord.amount} 次
                </p>
              </div>
            ))
          )}
        </div>
        <div className="flex items-center justify-between pb-2 pt-6">
          <div className="flex items-center">
            <ArrowPathIcon className="h-5 w-5 text-gray-500" />
            <h3 className="ml-2 text-sm text-gray-500">
              {sortBy === 'count' ? '按错误次数排序' : '按最新错误排序'}
            </h3>
          </div>
          <Link
            href="/dashboard/error-words"
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