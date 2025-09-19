'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Customer } from '@/app/lib/definitions';

export default function FilteredWordsList() {
  const searchParams = useSearchParams();
  const [words, setWords] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 从URL获取当前筛选条件
  const version = searchParams.get('version') || 'all';
  const grade = searchParams.get('grade') || 'all';
  const theclass = searchParams.get('theclass') || 'all';
  const theunit = searchParams.get('theunit') || 'all';
  const ok = searchParams.get('ok') || 'all';
  const limit = searchParams.get('limit') || '10';

  // 当筛选条件变化时获取数据
  useEffect(() => {
    const fetchFilteredWords = async () => {
      setIsLoading(true);
      
      // 构建查询参数
      const params = new URLSearchParams();
      if (version !== 'all') params.set('version', version);
      if (grade !== 'all') params.set('grade', grade);
      if (theclass !== 'all') params.set('theclass', theclass);
      if (theunit !== 'all') params.set('theunit', theunit);
      if (ok !== 'all') params.set('ok', ok);
      params.set('limit', limit); // 始终传递limit参数
      
      try {
        const response = await fetch(`/api/reading-available-units?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setWords(data.customers || []);
        } else {
          console.error('获取筛选结果失败');
          setWords([]);
        }
      } catch (error) {
        console.error('获取筛选结果出错:', error);
        setWords([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredWords();
  }, [version, grade, theclass, theunit, ok, limit]);

  // 如果没有筛选条件，不显示结果
  const hasFilters = version !== 'all' || grade !== 'all' || theclass !== 'all' || theunit !== 'all' || ok !== 'all' || (limit !== '10' && limit !== null);
  
  // 如果有limit参数，即使其他筛选条件都是默认值，也显示结果
  const hasLimit = limit !== null && limit !== undefined;
  
  if (!hasFilters && !hasLimit) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="mt-4 w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-medium mb-4">筛选结果</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="mt-4 w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-medium mb-4">筛选结果</h2>
        <p className="text-gray-500">没有找到符合条件的单词</p>
      </div>
    );
  }

  return (
    <div className="mt-4 w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-medium mb-4">筛选结果</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {words.map((word) => (
          <div key={word.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center">
              <Image
                src={word.image_url}
                alt={word.name}
                width={100}
                height={100}
                className="mb-2 rounded-md"
              />
              <h3 className="font-medium text-center">{word.name}</h3>
              <div className="mt-2 flex flex-wrap gap-1 justify-center">
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800">
                  {word.version}
                </span>
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800">
                  {word.grade}/{word.theclass}
                </span>
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800">
                  单元{word.theunit}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}