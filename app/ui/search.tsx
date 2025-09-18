'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { useState, useEffect } from 'react';

// 保存筛选状态的接口
interface FilterState {
  version?: string;
  grade?: string;
  theclass?: string;
  theunit?: string;
  ok?: string;
}

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [savedFilters, setSavedFilters] = useState<FilterState | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // 当组件加载时，检查是否有筛选条件
  useEffect(() => {
    if (!hasInitialized) {
      // 只在初始加载时保存筛选条件
      const currentFilters: FilterState = {};
      if (searchParams.has('version')) currentFilters.version = searchParams.get('version') || undefined;
      if (searchParams.has('grade')) currentFilters.grade = searchParams.get('grade') || undefined;
      if (searchParams.has('theclass')) currentFilters.theclass = searchParams.get('theclass') || undefined;
      if (searchParams.has('theunit')) currentFilters.theunit = searchParams.get('theunit') || undefined;
      if (searchParams.has('ok')) currentFilters.ok = searchParams.get('ok') || undefined;
      
      // 保存初始筛选条件，无论是否有查询
      setSavedFilters(currentFilters);
      setHasInitialized(true);
    }
  }, [searchParams, hasInitialized]);

  const handleSearch = useDebouncedCallback((term) => {
    console.log(`Searching... ${term}`);
    
    const params = new URLSearchParams();
    params.set('page', '1');
    
    if (term) {
      // 有搜索词时，清除所有筛选条件，只保留搜索词
      params.set('query', term);
      
      // 将所有筛选条件设为"全部"
      params.set('version', 'all');
      params.set('grade', 'all');
      params.set('theclass', 'all');
      params.set('theunit', 'all');
      params.set('ok', 'all');
    } else {
      // 无搜索词时，恢复之前保存的筛选条件
      params.delete('query');
      
      if (savedFilters) {
        Object.entries(savedFilters).forEach(([key, value]) => {
          if (value) {
            params.set(key, value);
          } else {
            params.delete(key);
          }
        });
      }
    }
    
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('query')?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
