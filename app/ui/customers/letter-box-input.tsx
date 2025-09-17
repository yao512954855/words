'use client';

import { MagnifyingGlassIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
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

  const handleSearch = useDebouncedCallback((term) => {
    console.log(`Searching... ${term}`);

    if (term==word) {
      console.log('匹配成功');
      console.log(`id: ${id}`);
      
      // 获取当前URL参数并传递给updateCustomer
      const currentSearchParams = searchParams.toString();
      updateCustomer(id,'1', currentSearchParams);
      setIsCorrect(true);
      setShowSuccess(true);
      
      // 1秒后隐藏成功提示
      setTimeout(() => {
        setShowSuccess(false);
      }, 1000);
      
      // const params = new URLSearchParams(searchParams);
      // params.set('page', '1');
      // if (term) {
      //   params.set('query', term);
      // } else {
      //   params.delete('query');
      // }
      // console.log(`param ${params}`)
      // replace(`${pathname}?${params.toString()}`);
      
    } else {
      setIsCorrect(false);
      setShowSuccess(false);
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
      
      {/* 成功提示 */}
      {showSuccess && (
        <div className="absolute top-full left-0 right-0 mt-2 z-10">
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
            <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
            <span className="font-semibold text-sm">🎉 你答对了！</span>
          </div>
        </div>
      )}
    </div>
  );
}
