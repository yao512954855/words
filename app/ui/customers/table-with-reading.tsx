'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import LetterBoxInput from '@/app/ui/customers/letter-box-input';
import WordHint from '@/app/ui/customers/word-hint';
import ContinuousReading from './continuous-reading';

interface Customer {
  id: string;
  name: string;
  email: string;
  image_url: string;
  ok: string;
  version: string;
  grade: string;
  theclass: string;
  theunit: string;
  studytimes: string;
  sorderid: string;
}

interface TableWithReadingProps {
  query: string;
  currentPage: number;
  filters?: {
    version?: string;
    grade?: string;
    theclass?: string;
    theunit?: string;
    ok?: string;
  };
  initialCustomers: Customer[];
}

export default function TableWithReading({ 
  query, 
  currentPage, 
  filters, 
  initialCustomers 
}: TableWithReadingProps) {
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [isReadingCollapsed, setIsReadingCollapsed] = useState(true); // 连续朗读模块折叠状态
  const [isMobile, setIsMobile] = useState(false); // 是否为移动设备
  
  // 客户端分页状态
  const [clientCurrentPage, setClientCurrentPage] = useState(currentPage);
  const itemsPerPage = 6; // 每页显示的单词数量
  
  // 检测是否为移动设备
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // 计算当前页显示的数据
  const startIndex = (clientCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  // 如果allCustomers为空，则使用initialCustomers作为当前页数据
  const currentPageCustomers = allCustomers.length > 0 
    ? allCustomers.slice(startIndex, endIndex) 
    : initialCustomers;
  const totalPages = Math.ceil((allCustomers.length || initialCustomers.length) / itemsPerPage);

  // 获取所有符合筛选条件的单词（用于连续朗读）
  const fetchAllFilteredCustomers = async () => {
    setIsLoadingAll(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (filters?.version) params.append('version', filters.version);
      if (filters?.grade) params.append('grade', filters.grade);
      if (filters?.theclass) params.append('theclass', filters.theclass);
      if (filters?.theunit) params.append('theunit', filters.theunit);
      if (filters?.ok) params.append('ok', filters.ok);

      const response = await fetch(`/api/customers/all?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      
      const allWords: Customer[] = await response.json();
      setAllCustomers(allWords);
    } catch (error) {
      console.error('Error fetching all customers:', error);
      setAllCustomers([]);
    } finally {
      setIsLoadingAll(false);
    }
  };

  // 当筛选条件变化时，重新获取所有单词
  useEffect(() => {
    fetchAllFilteredCustomers();
  }, [query, filters]);

  // 当URL页面变化时，同步客户端页面状态
  useEffect(() => {
    setClientCurrentPage(currentPage);
  }, [currentPage]);

  const handleWordChange = (index: number, word: any) => {
    // 当朗读完成时，index为-1，保持当前单词索引不变
    if (index >= 0) {
      setCurrentWordIndex(index);
      
      // 自动翻页：如果当前朗读的单词不在当前页，自动跳转到对应页面
      if (allCustomers.length > 0) {
        const targetPage = Math.floor(index / itemsPerPage) + 1;
        if (targetPage !== clientCurrentPage) {
          setClientCurrentPage(targetPage);
        }
      }
    }
    // 当朗读完成时(index为-1)，不改变currentWordIndex，保持最后一个单词的高亮状态
  };

  // 手动翻页函数（不会中断朗读）
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setClientCurrentPage(page);
    }
  };

  const toggleReadingCollapse = () => {
    setIsReadingCollapsed(!isReadingCollapsed);
  };

  return (
    <div className="mt-6 flow-root">
      {/* 连续朗读控制组件 - 包含在方形框内 */}
      <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200 mb-4 md:mb-6">
        {/* 连续朗读控制组件标题和折叠按钮 */}
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">连续朗读</h3>
          {isMobile && (
            <button 
              onClick={toggleReadingCollapse}
              className="md:hidden flex items-center text-blue-500 hover:text-blue-600 transition-colors px-2 py-1 rounded-md hover:bg-blue-50"
            >
              <div className="flex items-center">
                <span className="text-sm mr-1">
                  {isReadingCollapsed ? '展开' : '收起'}
                </span>
                {isReadingCollapsed ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </div>
            </button>
          )}
        </div>
        
        {/* 连续朗读控制组件 - 根据折叠状态显示 */}
        <div className="md:block">
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isMobile && isReadingCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'
          }`}>
            <ContinuousReading 
              words={allCustomers}
              onWordChange={handleWordChange}
            />
          </div>
        </div>
      </div>
      
      {isLoadingAll && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-700">正在加载所有单词...</span>
          </div>
        </div>
      )}

      {/* 单词表格 */}
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {currentPageCustomers?.map((customer, index) => (
              <div
                key={customer.id}
                className={`mb-2 w-full rounded-md bg-white p-4 ${
                  allCustomers[currentWordIndex]?.id === customer.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : ''
                }`}
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <Image
                        src={customer.image_url}
                        className="mr-2 rounded-md"
                        width={256}
                        height={256}
                        alt={`${customer.name}'s profile picture`}
                        priority={index === 0}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div className="w-full">
                    <div className="mb-2">
                      <WordHint word={customer.name} wordId={customer.id} />
                    </div>
                    <LetterBoxInput 
                      word={customer.name} 
                      id={customer.id}
                      placeholder="请输入单词"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
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
                        {customer.ok === '1' ? '已掌握' : '学习中'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  单词
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  提示与输入
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  版本
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  年级/学期
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  单元
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  状态
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {currentPageCustomers?.map((customer) => (
                <tr
                  key={customer.id}
                  className={`w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg ${
                    allCustomers[currentWordIndex]?.id === customer.id 
                      ? 'bg-blue-50 ring-2 ring-blue-500' 
                      : ''
                  }`}
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={customer.image_url}
                        className="rounded-md"
                        width={28}
                        height={28}
                        alt={`${customer.name}'s profile picture`}
                      />
                      <p className="font-medium">{customer.name}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="space-y-2">
                      <WordHint word={customer.name} wordId={customer.id} />
                      <LetterBoxInput 
                        word={customer.name} 
                        id={customer.id}
                        placeholder="请输入单词"
                      />
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800">
                      {customer.version || '未知'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800">
                      {customer.grade || '未知'}/{customer.theclass || '未知'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800">
                      {customer.theunit || '未知'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      customer.ok === '1' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {customer.ok === '1' ? '已掌握' : '学习中'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 客户端分页控件 */}
      {totalPages > 1 && (
        <div className="mt-5 flex w-full justify-center">
          <div className="flex items-center space-x-2">
            {/* 上一页按钮 */}
            <button
              onClick={() => handlePageChange(clientCurrentPage - 1)}
              disabled={clientCurrentPage <= 1}
              className={`flex h-10 w-10 items-center justify-center rounded-md border text-sm font-medium ${
                clientCurrentPage <= 1
                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'border-blue-300 bg-white text-blue-500 hover:bg-blue-50'
              }`}
            >
              ←
            </button>

            {/* 页码按钮 */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`flex h-10 w-10 items-center justify-center rounded-md border text-sm font-medium ${
                  page === clientCurrentPage
                    ? 'border-blue-500 bg-blue-600 text-white'
                    : 'border-blue-300 bg-white text-blue-500 hover:bg-blue-50'
                }`}
              >
                {page}
              </button>
            ))}

            {/* 下一页按钮 */}
            <button
              onClick={() => handlePageChange(clientCurrentPage + 1)}
              disabled={clientCurrentPage >= totalPages}
              className={`flex h-10 w-10 items-center justify-center rounded-md border text-sm font-medium ${
                clientCurrentPage >= totalPages
                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'border-blue-300 bg-white text-blue-500 hover:bg-blue-50'
              }`}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}