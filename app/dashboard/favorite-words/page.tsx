'use client';

import { lusitana } from '@/app/ui/fonts';
import FavoriteWordsTable from '@/app/ui/favorite-words/favorite-words-table';
import Pagination from '@/app/ui/pagination';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import clsx from 'clsx';

interface FavoriteWord {
  id: string;
  word_text: string;
  favorite_count: number;
  image_url: string;
  created_at: string;
  last_favorited_at: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function FavoriteWordsPage() {
  const [favoriteWords, setFavoriteWords] = useState<FavoriteWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 15,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchFavoriteWords = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/favorite-stats?sortBy=recent&page=${page}&limit=15`);
      if (!response.ok) {
        throw new Error('Failed to fetch favorite words');
      }
      const result = await response.json();
      setFavoriteWords(result.favoriteWords);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error fetching favorite words:', error);
      setFavoriteWords([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 15,
        hasNextPage: false,
        hasPrevPage: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavoriteWords(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
          <h1 className={`${lusitana.className} text-2xl`}>收藏单词列表</h1>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <div className="text-sm text-gray-600">
          {isLoading ? '加载中...' : `共 ${pagination.totalItems} 个收藏单词`}
          {!isLoading && pagination.totalItems > 0 && (
            <span className="ml-2 text-xs text-gray-500">
              (第 {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} - {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} 条，按最新收藏排序)
            </span>
          )}
        </div>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-500">加载收藏单词数据...</span>
        </div>
      ) : (
        <>
          <FavoriteWordsTable favoriteWords={favoriteWords} />
          {pagination.totalPages > 1 && (
            <div className="mt-5 flex w-full justify-center">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
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