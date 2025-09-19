'use client';

import { lusitana } from '@/app/ui/fonts';
import Pagination from '@/app/ui/pagination';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import WordHint from '@/app/ui/search/word-hint';
import LetterBoxInput from '@/app/ui/customers/letter-box-input';
import { Customer } from '@/app/lib/definitions';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const query = searchParams.get('query') || '';
  const currentPage = Number(searchParams.get('page') || 1);
  
  // 防抖定时器引用
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 每页显示的数量
  const itemsPerPage = 10;
  
  // 计算总页数
  const totalPages = Math.ceil(customers.length / itemsPerPage) || 1;
  
  // 获取当前页的数据
  const currentPageCustomers = customers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 记录搜索输入（带防抖功能）
  const recordSearch = async (term: string, isPartial: boolean, resultCount: number) => {
    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // 只有当搜索词长度>=3时才记录
    if (term.length >= 2) {
      // 设置新的定时器，延迟500毫秒执行（减少延迟时间提高响应速度）
      debounceTimerRef.current = setTimeout(async () => {
        try {
          console.log('防抖后执行搜索记录:', term);
          await fetch('/api/search-record', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              searchTerm: term,
              isPartial,
              resultCount,
            }),
          });
          console.log('搜索记录已保存:', term);
        } catch (error) {
          console.error('Error recording search:', error);
        }
      }, 1000); // 减少到500ms的防抖延迟，提高响应速度
    }
  };

  // 搜索功能
  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    
    if (term) {
      params.set('query', term);
      // 用户输入搜索，使用防抖记录
      recordSearch(term, false, customers.length);
    } else {
      params.delete('query');
    }
    
    replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    async function fetchData() {
      if (!query) {
        setCustomers([]);
        return;
      }
      
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.append('query', query);
        
        // 发送请求获取搜索结果
        const response = await fetch(`/api/customers/search?${params.toString()}`);
        if (!response.ok) {
          console.error('Search API error:', response.status, response.statusText);
          throw new Error('Failed to fetch search results');
        }
        
        const data = await response.json();
        console.log('搜索结果:', data); // 调试用，查看返回的数据结构
        setCustomers(data);
        
        // 记录搜索结果 - 这里不需要单独调用recordSearch
        // 因为handleSearch已经在输入变化时调用了recordSearch
        // 防止重复调用导致防抖失效
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [query]);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>单词搜索</h1>
      </div>

      <div className="mt-4 flex flex-col items-center gap-2 md:mt-8">
        {/* 搜索框 */}
        <div className="relative w-full md:w-2/3 lg:w-1/2 mx-auto">
          <label htmlFor="search" className="sr-only">
            搜索单词
          </label>
          <input
            type="text"
            id="search"
            className="peer block w-full rounded-md border border-gray-200 py-3 pl-10 text-sm outline-2 placeholder:text-gray-500 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="搜索单词..."
            defaultValue={query}
            onChange={(e) => {
              handleSearch(e.target.value);
            }}
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
        </div>
        
        {!loading && query && (
          <div className="text-sm text-gray-600 mt-2">
            找到 {customers.length} 个单词
          </div>
        )}
      </div>
      


      {loading && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-700">正在搜索...</span>
          </div>
        </div>
      )}

      {/* 搜索结果展示 */}
      {!loading && query && customers.length > 0 && (
        <div className="mt-6 flow-root">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {currentPageCustomers.map((customer) => (
              <div
                key={customer.id}
                className="col-span-1 rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="w-full">
                    <div className="mb-2 flex items-center justify-center">
                      <Image
                        src={customer.image_url}
                        className="rounded-md"
                        width={256}
                        height={256}
                        alt={`${customer.name}'s profile picture`}
                      />
                    </div>
                    <div className="mt-2 mb-2 text-center font-medium text-blue-600">
                      {customer.name}
                    </div>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div className="w-full">

                    <div className="mt-3 flex flex-wrap gap-2">
                       <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-pink-100 text-blue-800">
                        翻译: {customer.chinese_translation || '未知'}
                      </span>
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800">
                        版本: {customer.version || '未知'}
                      </span>
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800">
                        年级/学期: {customer.grade || '未知'}/{customer.theclass || '未知'}
                      </span>
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800">
                        单元: {customer.theunit || '未知'}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        customer.ok === '1' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        掌握: {customer.ok === '1' ? '是' : '否'}
                      </span>
                    </div>
                    <div className="mb-2">
                      <WordHint word={customer.name} wordId={customer.id} showWord={true} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 分页控件 */}
          {totalPages > 1 && (
            <div className="mt-5 flex w-full justify-center">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={customers.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => {
                  const params = new URLSearchParams(searchParams);
                  params.set('page', page.toString());
                  replace(`${pathname}?${params.toString()}`);
                }}
              />
            </div>
          )}
        </div>
      )}

      {!loading && query && customers.length === 0 && (
        <div className="mt-6 text-center">
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">未找到匹配的单词</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>请尝试使用不同的搜索词或检查拼写。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}