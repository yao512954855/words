'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { ChoiceOption } from '@/app/lib/definitions';
import { getUserFilterState, saveUserFilterState } from '@/app/lib/filter-state';
import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface CustomersFiltersProps {
  choiceOptions: {
    [key: string]: ChoiceOption[];
  };
}

export default function CustomersFilters({ choiceOptions }: CustomersFiltersProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(true); // 手机端折叠状态
  const [isMobile, setIsMobile] = useState(false);
  const [filteredUnitOptions, setFilteredUnitOptions] = useState<ChoiceOption[]>(choiceOptions.theunit || []);
  
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

  // 从URL参数获取当前筛选状态
  const currentVersion = searchParams.get('version') || 'all';
  const currentGrade = searchParams.get('grade') || 'all';
  const currentClass = searchParams.get('theclass') || 'all';
  const currentUnit = searchParams.get('theunit') || 'all';
  const currentOk = searchParams.get('ok') || 'all';
  
  // 获取可用单元
  const fetchAvailableUnits = async (version: string, grade: string, theclass: string) => {
    if (version === 'all' || grade === 'all' || theclass === 'all') {
      // 如果任何一个条件是"全部"，则不需要获取特定单元
      setFilteredUnitOptions(choiceOptions.theunit || []);
      return;
    }

    try {
      // 从API获取实际存在的单元
      const response = await fetch(`/api/available-units?version=${version}&grade=${grade}&theclass=${theclass}`);
      if (response.ok) {
        const units = await response.json();
        
        // 根据可用单元过滤选项
        const filtered = choiceOptions.theunit?.filter(option => 
          units.includes(option.value) || option.value === 'all'
        ) || [];
        
        setFilteredUnitOptions(filtered);
        
        // 如果当前选择的单元不在可用单元中，重置为"全部"
        if (currentUnit !== 'all' && !units.includes(currentUnit)) {
          handleFilterChange('theunit', 'all');
        }
      } else {
        console.error('获取可用单元失败');
        setFilteredUnitOptions(choiceOptions.theunit || []);
      }
    } catch (error) {
      console.error('获取可用单元出错:', error);
      setFilteredUnitOptions(choiceOptions.theunit || []);
    }
  };
  
  // 当版本、年级或学期改变时，获取可用单元
  useEffect(() => {
    fetchAvailableUnits(currentVersion, currentGrade, currentClass);
  }, [currentVersion, currentGrade, currentClass]);

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

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200 mb-4 md:mb-6">
      {/* 标题和折叠按钮 */}
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-900">筛选条件</h3>
        {/* 手机端折叠按钮 */}
        <button
          onClick={toggleCollapse}
          className="md:hidden flex items-center text-blue-500 hover:text-blue-600 transition-colors px-2 py-1 rounded-md hover:bg-blue-50"
        >
          <div className="flex items-center">
            <span className="text-sm mr-1">
              {isCollapsed ? '展开' : '收起'}
            </span>
            {isCollapsed ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronUpIcon className="h-4 w-4" />
            )}
          </div>
        </button>
      </div>
      
      {/* 移动端：根据折叠状态显示筛选条件 */}
      <div className="md:hidden">
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'
        }`}>
          <div className="grid grid-cols-1 gap-3 mb-3">
            {/* 版本筛选 - 移动端 */}
            <div>
              <label htmlFor="version-mobile" className="block text-xs font-medium text-gray-700 mb-1">
                版本
              </label>
              <select
                id="version-mobile"
                value={currentVersion}
                onChange={(e) => handleFilterChange('version', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全部版本</option>
                {choiceOptions.version?.map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* 年级筛选 - 移动端 */}
            <div>
              <label htmlFor="grade-mobile" className="block text-xs font-medium text-gray-700 mb-1">
                年级
              </label>
              <select
                id="grade-mobile"
                value={currentGrade}
                onChange={(e) => handleFilterChange('grade', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全部年级</option>
                {choiceOptions.grade?.map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* 学期筛选 - 移动端 */}
            <div>
              <label htmlFor="theclass-mobile" className="block text-xs font-medium text-gray-700 mb-1">
                学期
              </label>
              <select
                id="theclass-mobile"
                value={currentClass}
                onChange={(e) => handleFilterChange('theclass', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全部学期</option>
                {choiceOptions.theclass?.map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* 单元筛选 - 移动端 */}
            <div>
              <label htmlFor="theunit-mobile" className="block text-xs font-medium text-gray-700 mb-1">
                单元
              </label>
              <select
                id="theunit-mobile"
                value={currentUnit}
                onChange={(e) => handleFilterChange('theunit', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全部单元</option>
                {filteredUnitOptions.map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* 掌握状态筛选 - 移动端 */}
            <div>
              <label htmlFor="ok-mobile" className="block text-xs font-medium text-gray-700 mb-1">
                掌握状态
              </label>
              <select
                id="ok-mobile"
                value={currentOk}
                onChange={(e) => handleFilterChange('ok', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全部状态</option>
                {choiceOptions.ok?.map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* 清除所有筛选 - 移动端 */}
            <div className="mt-3">
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
                className="w-full px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-colors"
              >
                清除所有筛选
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* PC端：始终显示所有筛选条件 */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-5 gap-4">
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
            {filteredUnitOptions.map((option) => (
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

      {/* 清除所有筛选 - PC端 */}
      <div className="hidden md:flex mt-4 justify-end">
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