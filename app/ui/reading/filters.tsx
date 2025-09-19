'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { ChoiceOption } from '@/app/lib/definitions';
import { getUserFilterState, saveUserFilterState } from '@/app/lib/filter-state';
import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface ReadingFiltersProps {
  choiceOptions: {
    [key: string]: ChoiceOption[];
  };
}

export default function ReadingFilters({ choiceOptions }: ReadingFiltersProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
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
  const currentCategory = searchParams.get('category') || 'all';
  const currentLevel = searchParams.get('level') || 'all';
  const currentTopic = searchParams.get('topic') || 'all';
  
  // 保存筛选状态到数据库
  const saveFilterState = async (updatedParams: URLSearchParams) => {
    const filterState: Record<string, string[]> = {};
    
    const category = updatedParams.get('category');
    const level = updatedParams.get('level');
    const topic = updatedParams.get('topic');
    
    if (category && category !== 'all') filterState.category = [category];
    if (level && level !== 'all') filterState.level = [level];
    if (topic && topic !== 'all') filterState.topic = [topic];
    
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
        <h3 className="text-base md:text-lg font-semibold text-gray-900">筛选阅读材料</h3>
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
            {/* 类别筛选 - 移动端 */}
            <div>
              <label htmlFor="category-mobile" className="block text-xs font-medium text-gray-700 mb-1">
                类别
              </label>
              <select
                id="category-mobile"
                value={currentCategory}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全部类别</option>
                {choiceOptions.category?.map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* 难度筛选 - 移动端 */}
            <div>
              <label htmlFor="level-mobile" className="block text-xs font-medium text-gray-700 mb-1">
                难度
              </label>
              <select
                id="level-mobile"
                value={currentLevel}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全部难度</option>
                {choiceOptions.level?.map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* 主题筛选 - 移动端 */}
            <div>
              <label htmlFor="topic-mobile" className="block text-xs font-medium text-gray-700 mb-1">
                主题
              </label>
              <select
                id="topic-mobile"
                value={currentTopic}
                onChange={(e) => handleFilterChange('topic', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全部主题</option>
                {choiceOptions.topic?.map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* 桌面端：始终显示筛选条件 */}
      <div className="hidden md:block">
        <div className="grid grid-cols-3 gap-4">
          {/* 类别筛选 - 桌面端 */}
          <div>
            <label htmlFor="category-desktop" className="block text-sm font-medium text-gray-700 mb-1">
              类别
            </label>
            <select
              id="category-desktop"
              value={currentCategory}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">全部类别</option>
              {choiceOptions.category?.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* 难度筛选 - 桌面端 */}
          <div>
            <label htmlFor="level-desktop" className="block text-sm font-medium text-gray-700 mb-1">
              难度
            </label>
            <select
              id="level-desktop"
              value={currentLevel}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">全部难度</option>
              {choiceOptions.level?.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* 主题筛选 - 桌面端 */}
          <div>
            <label htmlFor="topic-desktop" className="block text-sm font-medium text-gray-700 mb-1">
              主题
            </label>
            <select
              id="topic-desktop"
              value={currentTopic}
              onChange={(e) => handleFilterChange('topic', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">全部主题</option>
              {choiceOptions.topic?.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}