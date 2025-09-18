'use client';

import { MagnifyingGlassIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { updateCustomer } from '@/app/lib/customers';
import { useState, useEffect } from 'react';

export default function Search({ placeholder,word,id }: { placeholder: string,word:string,id:string }) {

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isCorrect, setIsCorrect] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 记录错误输入的函数
  const recordWrongInput = async (wrongInput: string) => {
    try {
      await fetch('/api/wrong-input', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordId: id,
          correctWord: word,
          wrongInput: wrongInput,
        }),
      });
    } catch (error) {
      console.error('Failed to record wrong input:', error);
    }
  };

  const handleSearch = useDebouncedCallback((term) => {
    console.log(`Searching... ${term}`);

    if (term == word) {
      console.log('匹配成功');
      console.log(`id: ${id}`);
      
      // 获取当前URL参数并传递给updateCustomer
      const currentSearchParams = searchParams.toString();
      updateCustomer(id,'1', currentSearchParams);
      setIsCorrect(true);
      setShowSuccess(true);
      setShowError(false);
      
      // 1秒后隐藏成功提示
      setTimeout(() => {
        setShowSuccess(false);
      }, 1000);
      
    } else {
      setIsCorrect(false);
      setShowSuccess(false);
      
      // 检查是否是长度匹配但内容错误的情况
      if (term && term.length === word.length && term !== word) {
        console.log('长度匹配但内容错误:', term, 'vs', word);
        
        // 记录错误输入
        recordWrongInput(term);
        
        // 显示错误提示
        setErrorMessage('输入错误，再好好想想！');
        setShowError(true);
        
        // 3秒后隐藏错误提示
        setTimeout(() => {
          setShowError(false);
        }, 3000);
      } else {
        setShowError(false);
      }
    }
  }, 100);

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className={`peer block w-full rounded-md border py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 transition-all duration-300 ${
          isCorrect ? 'border-emerald-400 bg-emerald-50 shadow-md' : 'border-blue-200'
        }`}
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('query')?.toString()}
      />
      {/* <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" /> */}
      
      {/* 成功提示框 */}
      {showSuccess && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-green-100 border border-green-300 rounded-md shadow-lg z-10">
          <div className="flex items-center text-green-700">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            <span className="font-medium">正确！</span>
          </div>
        </div>
      )}

      {/* 错误提示框 */}
      {showError && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-red-100 border border-red-300 rounded-md shadow-lg z-10">
          <div className="flex items-center text-red-700">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
