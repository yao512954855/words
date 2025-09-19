'use client';

import { lusitana } from '@/app/ui/fonts';
import Pagination from '@/app/ui/pagination';
import Search from '@/app/ui/search';
import { useState, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import WordHint from '@/app/ui/customers/word-hint';
import LetterBoxInput from '@/app/ui/customers/letter-box-input';
import { Customer } from '@/app/lib/definitions';
import { CustomerField } from '@/app/lib/definitions';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  // 移除了显示英文单词的状态
  
  const query = searchParams.get('query') || '';
  const currentPage = Number(searchParams.get('page') || 1);
  const version = searchParams.get('version') || 'all';
  const grade = searchParams.get('grade') || 'all';
  const theclass = searchParams.get('theclass') || 'all';
  const theunit = searchParams.get('theunit') || 'all';
  const ok = searchParams.get('ok') || 'all';
  
  // 每页显示的数量
  const itemsPerPage = 10;
  
  // 计算总页数
  const totalPages = Math.ceil(customers.length / itemsPerPage) || 1;
  
  // 获取当前页的数据
  const currentPageCustomers = customers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        
        // 发送请求获取真实数据，只使用query参数
        const response = await fetch(`/api/customers/search?${params.toString()}`);
        if (!response.ok) {
          console.error('Search API error:', response.status, response.statusText);
          throw new Error('Failed to fetch search results');
        }
        
        const data = await response.json();
        console.log('搜索结果:', data); // 调试用，查看返回的数据结构
        setCustomers(data);
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

      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="搜索单词..." />
        
        {!loading && query && (
          <div className="text-sm text-gray-600">
            找到 {customers.length} 个单词
          </div>
        )}
      </div>
      
      {/* 移除了显示/隐藏英文单词按钮 */}

      {loading && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-700">正在搜索...</span>
          </div>
        </div>
      )}

      {!loading && query && customers.length === 0 && (
        <div className="mt-6 text-center">
          <p className="text-gray-600">没有找到匹配的单词</p>
        </div>
      )}

      {!loading && customers.length > 0 && (
        <div className="mt-6 flow-root">
          <div className="inline-block min-w-full align-middle">
            <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
              {/* 移动端显示 */}
              <div className="md:hidden">
                {currentPageCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="mb-2 w-full rounded-md bg-white p-4"
                  >
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <div className="mb-2 flex items-center">
                          <Image
                            src={customer.image_url || `/wordspic/${customer.name}.png`}
                            className="mr-2 rounded-md"
                            width={256}
                            height={256}
                            alt={`${customer.name}'s profile picture`}
                          />
                        </div>
                        {/* 将单词显示放在图片下面 */}
                        <div className="mt-2 mb-2 text-center">
                          <div className="font-medium text-blue-600">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.chinese_translation}</div>
                          <div className="text-xs text-gray-400">{customer.version} {customer.grade} {customer.theclass} {customer.theunit}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-between pt-4">
                      <div className="w-full">
                        <div className="mb-2">
                          <WordHint word={customer.name} wordId={customer.id} showWord={true} />
                        </div>
                        <LetterBoxInput 
                          word={customer.name} 
                          id={customer.id}
                          placeholder="请输入单词"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* PC端显示 */}
              <table className="hidden min-w-full text-gray-900 md:table">
                <thead className="rounded-lg text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      单词
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      输入
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {currentPageCustomers.map((customer, index) => (
                    <tr
                      key={customer.id}
                      className="w-full border-b py-3 text-lg last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                    >
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <Image
                            src={customer.image_url || `/wordspic/${customer.name}.png`}
                            className="rounded-md"
                            width={256}
                            height={256}
                            alt={`${customer.name}'s profile picture`}
                            priority={index === 0}
                          />
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-gray-500">{customer.chinese_translation}</p>
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex flex-col items-start gap-1 width:256px height:256px text-gray-500 m-3">
                          <p>提示：字母长度{customer.name.length}</p>
                          <WordHint word={customer.name} wordId={customer.id} />
                        </div>
                        <div className="flex items-center gap-3 width:256px height:256px">
                          <LetterBoxInput id={customer.id} word={customer.name} placeholder="请输入单词" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="mt-5 flex w-full justify-center">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={customers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set('page', page.toString());
              replace(`${pathname}?${params.toString()}`);
            }}
          />
        </div>
      )}
    </div>
  );
}