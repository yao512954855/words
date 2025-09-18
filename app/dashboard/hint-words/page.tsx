'use client';

import { lusitana } from '@/app/ui/fonts';
import HintWordsTable from '@/app/ui/hint-words/hint-words-table';
import Pagination from '@/app/ui/pagination';
import Search from '@/app/ui/search';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import clsx from 'clsx';

interface HintWord {
  id: string;
  word: string;
  hint_count: number;
  image_url: string;
  last_hint_at: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function Page() {
  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState<'count' | 'latest'>('count');
  const [hintWords, setHintWords] = useState<HintWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 15,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const searchQuery = searchParams.get('query') || '';

  const fetchHintWords = async (sortType: 'count' | 'latest', page: number = 1, query: string = '') => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        sortBy: sortType,
        page: page.toString(),
        itemsPerPage: '15',
        ...(query && { query })
      });
      
      const response = await fetch(`/api/hint-words-all?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch hint words');
      }
      
      const result = await response.json();
      setHintWords(result.data);
      setPagination(result.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching hint words:', error);
      setHintWords([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHintWords(sortBy, 1, searchQuery);
  }, [sortBy, searchQuery]);

  const handleSortChange = (newSortBy: 'count' | 'latest') => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    fetchHintWords(sortBy, page, searchQuery);
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
          <h1 className={`${lusitana.className} text-2xl`}>常提示单词</h1>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="搜索提示单词..." />
        
        {!isLoading && (
          <div className="text-sm text-gray-600">
            共 {pagination.totalItems} 个单词
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm text-gray-600">排序方式:</span>
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => handleSortChange('count')}
            className={clsx(
              'rounded-md px-3 py-1 text-sm font-medium transition-colors',
              sortBy === 'count'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            按提示次数
          </button>
          <button
            onClick={() => handleSortChange('latest')}
            className={clsx(
              'rounded-md px-3 py-1 text-sm font-medium transition-colors',
              sortBy === 'latest'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            按最近提示
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <HintWordsTable hintWords={hintWords} />
          
          {pagination.totalPages > 1 && (
            <div className="mt-5 flex w-full justify-center">
              <Pagination 
                totalPages={pagination.totalPages}
                currentPage={currentPage}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}