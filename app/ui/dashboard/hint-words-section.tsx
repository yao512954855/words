'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ClockIcon,
  HashtagIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import Link from 'next/link';

interface HintWord {
  id: string;
  name: string;
  email: string;
  image_url: string;
  amount: number;
  last_hint_at: string;
}

async function fetchHintWords(sortBy: 'count' | 'latest' = 'count'): Promise<HintWord[]> {
  try {
    const response = await fetch(`/api/hint-stats?sortBy=${sortBy}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch hint words');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching hint words:', error);
    return [];
  }
}

export default function HintWordsSection() {
  const [hintWords, setHintWords] = useState<HintWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'count' | 'latest'>('count');

  useEffect(() => {
    const loadHintWords = async () => {
      setLoading(true);
      const data = await fetchHintWords(sortBy);
      setHintWords(data);
      setLoading(false);
    };

    loadHintWords();
  }, [sortBy]);

  const handleSortChange = (newSortBy: 'count' | 'latest') => {
    setSortBy(newSortBy);
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex w-full items-center justify-between">
          <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
            经常提示单词
          </h2>
        </div>
        <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">
          <div className="bg-white px-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
          经常提示单词
        </h2>
      </div>
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">
        <div className="bg-white px-6">
          {/* 排序选项 */}
          <div className="flex items-center justify-between border-b border-gray-200 py-4">
            <div className="flex items-center space-x-2">
              <LightBulbIcon className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">排序方式:</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleSortChange('count')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  sortBy === 'count'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <HashtagIcon className="h-4 w-4" />
                <span>提示次数</span>
                {sortBy === 'count' && <ArrowDownIcon className="h-3 w-3" />}
              </button>
              <button
                onClick={() => handleSortChange('latest')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  sortBy === 'latest'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ClockIcon className="h-4 w-4" />
                <span>最近提示</span>
                {sortBy === 'latest' && <ArrowDownIcon className="h-3 w-3" />}
              </button>
            </div>
          </div>

          {hintWords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <LightBulbIcon className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 text-center">
                还没有提示记录<br />
                <span className="text-sm">在单词页面点击提示按钮后，这里会显示统计信息</span>
              </p>
            </div>
          ) : (
            <>
              {hintWords.slice(0, 5).map((hintWord, i) => (
                <div
                  key={hintWord.id}
                  className={`flex flex-row items-center justify-between py-4 ${
                    i !== 0 ? 'border-t' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <Image
                      src={hintWord.image_url}
                      alt={`${hintWord.name}'s profile picture`}
                      className="mr-4 rounded-full"
                      width={32}
                      height={32}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/customers/default-avatar.png';
                      }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold md:text-base">
                        {hintWord.name}
                      </p>
                      <p className="hidden text-sm text-gray-500 sm:block">
                        {hintWord.email}
                      </p>
                      {sortBy === 'latest' && hintWord.last_hint_at && (
                        <p className="text-xs text-gray-400">
                          最近提示: {new Date(hintWord.last_hint_at).toLocaleDateString('zh-CN')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <LightBulbIcon className="h-4 w-4 text-yellow-500" />
                    <p className={`${lusitana.className} truncate text-sm font-medium md:text-base`}>
                      {hintWord.amount}
                    </p>
                  </div>
                </div>
              ))}
              
              {hintWords.length > 5 && (
                <div className="flex items-center justify-between pt-6">
                  <p className="text-xs text-gray-500">
                    按照{sortBy === 'count' ? '提示次数' : '最近提示'}排序
                  </p>
                  <Link
                    href="/dashboard/hint-words"
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <svg
                      className="mr-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    查看全部
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}