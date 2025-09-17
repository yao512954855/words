'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { ChoiceOption } from '@/app/lib/definitions';

interface CustomersFiltersProps {
  choiceOptions: {
    [key: string]: ChoiceOption[];
  };
}

export default function CustomersFilters({ choiceOptions }: CustomersFiltersProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleFilterChange = useDebouncedCallback((filterType: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (value && value !== 'all') {
      params.set(filterType, value);
    } else {
      params.delete(filterType);
    }
    
    // 重置到第一页
    params.delete('page');
    
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const currentVersion = searchParams.get('version') || 'all';
  const currentGrade = searchParams.get('grade') || 'all';
  const currentClass = searchParams.get('theclass') || 'all';
  const currentUnit = searchParams.get('theunit') || 'all';
  const currentOk = searchParams.get('ok') || 'all';

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
          onClick={() => {
            const params = new URLSearchParams();
            replace(`${pathname}?${params.toString()}`);
          }}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
        >
          清除所有筛选
        </button>
      </div>
    </div>
  );
}