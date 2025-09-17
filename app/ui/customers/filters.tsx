'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { ChoiceOption } from '@/app/lib/definitions';
import { getUserFilterState, saveUserFilterState } from '@/app/lib/filter-state';
import { useState, useEffect } from 'react';

interface CustomersFiltersProps {
  choiceOptions: {
    [key: string]: ChoiceOption[];
  };
}

export default function CustomersFilters({ choiceOptions }: CustomersFiltersProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // 从URL参数获取当前筛选状态
  const currentVersion = searchParams.get('version') || 'all';
  const currentGrade = searchParams.get('grade') || 'all';
  const currentClass = searchParams.get('theclass') || 'all';
  const currentUnit = searchParams.get('theunit') || 'all';
  const currentOk = searchParams.get('ok') || 'all';

  // 加载用户保存的筛选状态
  useEffect(() => {
    const loadFilterState = async () => {
      try {
        const savedState = await getUserFilterState();
        
        // 如果有保存的状态且当前URL没有筛选参数，则应用保存的状态
        const hasUrlFilters = searchParams.get('version') || searchParams.get('grade') || 
                             searchParams.get('theclass') || searchParams.get('theunit') || 
                             searchParams.get('ok');
        
        if (!hasUrlFilters && Object.keys(savedState).length > 0) {
          const params = new URLSearchParams(searchParams);
          
          // 应用保存的筛选状态到URL
          Object.entries(savedState).forEach(([filterType, values]) => {
            if (Array.isArray(values) && values.length > 0) {
              params.set(filterType, values[0]); // 取第一个值
            }
          });
          
          replace(`${pathname}?${params.toString()}`);
        }
      } catch (error) {
        console.error('Failed to load filter state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFilterState();
  }, []);

  // 保存筛选状态到数据库
  const saveFilterState = async (updatedParams: URLSearchParams) => {
    const filterState: Record<string, string[]> = {};
    
    const version = updatedParams.get('version');
    const grade = updatedParams.get('grade');
    const theclass = updatedParams.get('theclass');
    const theunit = updatedParams.get('theunit');
    const ok = updatedParams.get('ok');
    
    if (version && version !== 'all') filterState.version = [version];
    if (grade && grade !== 'all') filterState.grade = [grade];
    if (theclass && theclass !== 'all') filterState.theclass = [theclass];
    if (theunit && theunit !== 'all') filterState.theunit = [theunit];
    if (ok && ok !== 'all') filterState.ok = [ok];
    
    try {
      await saveUserFilterState(filterState);
    } catch (error) {
      console.error('Failed to save filter state:', error);
    }
  };

  const handleFilterChange = useDebouncedCallback(async (filterType: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (value && value !== 'all') {
      params.set(filterType, value);
    } else {
      params.delete(filterType);
    }
    
    // 重置到第一页
    params.delete('page');
    
    replace(`${pathname}?${params.toString()}`);
    
    // 立即保存新的筛选状态
    await saveFilterState(params);
  }, 300);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">筛选条件</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 版本筛选 */}
        <div>
          <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-2">
            版本
          </label>
          <select
            id="version"
            value={currentVersion}
            onChange={(e) => handleFilterChange('version', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">全部版本</option>
            {choiceOptions.version?.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 年级筛选 */}
        <div>
          <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
            年级
          </label>
          <select
            id="grade"
            value={currentGrade}
            onChange={(e) => handleFilterChange('grade', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">全部年级</option>
            {choiceOptions.grade?.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 学期筛选 */}
        <div>
          <label htmlFor="theclass" className="block text-sm font-medium text-gray-700 mb-2">
            学期
          </label>
          <select
            id="theclass"
            value={currentClass}
            onChange={(e) => handleFilterChange('theclass', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">全部学期</option>
            {choiceOptions.theclass?.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 单元筛选 */}
        <div>
          <label htmlFor="theunit" className="block text-sm font-medium text-gray-700 mb-2">
            单元
          </label>
          <select
            id="theunit"
            value={currentUnit}
            onChange={(e) => handleFilterChange('theunit', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">全部单元</option>
            {choiceOptions.theunit?.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 掌握状态筛选 */}
        <div>
          <label htmlFor="ok" className="block text-sm font-medium text-gray-700 mb-2">
            掌握状态
          </label>
          <select
            id="ok"
            value={currentOk}
            onChange={(e) => handleFilterChange('ok', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">全部状态</option>
            {choiceOptions.ok?.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 清除所有筛选 */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={async () => {
            const params = new URLSearchParams();
            replace(`${pathname}?${params.toString()}`);
            
            // 清除数据库中保存的筛选状态
            try {
              await saveUserFilterState({});
            } catch (error) {
              console.error('Failed to clear filter state:', error);
            }
          }}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
        >
          清除所有筛选
        </button>
      </div>
    </div>
  );
}