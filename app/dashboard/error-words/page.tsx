'use client';

import { lusitana } from '@/app/ui/fonts';
import ErrorWordsTable from '@/app/ui/error-words/error-words-table';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import clsx from 'clsx';

interface ErrorWord {
  id: string;
  correct_word: string;
  error_count: number;
  image_url: string;
  wrong_inputs: string[];
  error_times: string[];
  last_error_at: string;
}

export default function Page() {
  const [sortBy, setSortBy] = useState<'count' | 'latest'>('count');
  const [errorWords, setErrorWords] = useState<ErrorWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchErrorWords = async (sortType: 'count' | 'latest') => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/error-words-all?sortBy=${sortType}`);
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
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            返回首页
          </Link>
          <h1 className={`${lusitana.className} text-2xl`}>错误单词详情</h1>
        </div>
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
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <div className="text-sm text-gray-600">
          {isLoading ? '加载中...' : `共 ${errorWords.length} 个错误单词`}
          {!isLoading && (
            <span className="ml-2 text-xs text-gray-500">
              ({sortBy === 'count' ? '按错误次数排序' : '按最新错误排序'})
            </span>
          )}
        </div>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-500">加载错误单词数据...</span>
        </div>
      ) : (
        <ErrorWordsTable errorWords={errorWords} />
      )}
    </div>
  );
}