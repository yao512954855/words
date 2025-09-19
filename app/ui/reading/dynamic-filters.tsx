'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { saveUserFilterState } from '@/app/lib/filter-state';
import { ChoiceOption } from '@/app/lib/definitions';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

export default function DynamicReadingFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [choiceOptions, setChoiceOptions] = useState<{[key: string]: ChoiceOption[]}>({});
  const [filteredUnitOptions, setFilteredUnitOptions] = useState<ChoiceOption[]>([]);
  
  // 从URL参数获取当前筛选状态
  const currentVersion = searchParams.get('version') || 'all';
  const currentGrade = searchParams.get('grade') || 'all';
  const currentClass = searchParams.get('theclass') || 'all';
  const currentUnit = searchParams.get('theunit') || 'all';
  const currentOk = searchParams.get('ok') || 'all';

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

  // 获取筛选选项
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/reading-filter-options');
        if (response.ok) {
          const data = await response.json();
          setChoiceOptions(data);
          setFilteredUnitOptions(data.theunit || []);
        } else {
          console.error('获取筛选选项失败');
        }
      } catch (error) {
        console.error('获取筛选选项出错:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // 获取可用单元
  const fetchAvailableUnits = async (version: string, grade: string, theclass: string) => {
    if (version === 'all' || grade === 'all' || theclass === 'all') {
      // 如果任何一个条件是"全部"，则不需要获取特定单元
      setFilteredUnitOptions(choiceOptions.theunit || []);
      return;
    }

    try {
      // 从API获取实际存在的单元
      const response = await fetch(`/api/reading-available-units?version=${version}&grade=${grade}&theclass=${theclass}`);
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
    if (choiceOptions.theunit) {
      fetchAvailableUnits(currentVersion, currentGrade, currentClass);
    }
  }, [currentVersion, currentGrade, currentClass, choiceOptions.theunit]);

  // 处理筛选条件变化
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    
    // 更新筛选参数
    if (value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    // 如果更改了版本、年级或学期，重置单元为"全部"
    if ((key === 'version' || key === 'grade' || key === 'theclass') && value !== searchParams.get(key)) {
      params.delete('theunit');
    }
    
    // 重置页码
    params.delete('page');
    
    // 更新URL
    replace(`${pathname}?${params.toString()}`);
    
    // 保存筛选状态到数据库
    saveFilterState(params);
  };

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

  // 切换折叠状态
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      {/* 移动端筛选标题和折叠按钮 */}
      {isMobile && (
        <div 
          className="flex justify-between items-center mb-4 cursor-pointer"
          onClick={toggleCollapse}
        >
          <h2 className="text-lg font-semibold">筛选条件</h2>
          {isCollapsed ? (
            <ArrowDownIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ArrowUpIcon className="h-5 w-5 text-gray-500" />
          )}
        </div>
      )}
      
      {/* 桌面端筛选标题 */}
      {!isMobile && (
        <h2 className="text-lg font-semibold mb-4">筛选条件</h2>
      )}
      
      {/* 筛选表单 - 桌面端 */}
      {(!isMobile || !isCollapsed) && (
        <div className={isMobile ? "space-y-4" : "grid grid-cols-5 gap-4"}>
          {/* 版本筛选 */}
          <div>
            <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-1">
              版本
            </label>
            <select
              id="version"
              value={currentVersion}
              onChange={(e) => handleFilterChange('version', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
              年级
            </label>
            <select
              id="grade"
              value={currentGrade}
              onChange={(e) => handleFilterChange('grade', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
            <label htmlFor="theclass" className="block text-sm font-medium text-gray-700 mb-1">
              学期
            </label>
            <select
              id="theclass"
              value={currentClass}
              onChange={(e) => handleFilterChange('theclass', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
            <label htmlFor="theunit" className="block text-sm font-medium text-gray-700 mb-1">
              单元
            </label>
            <select
              id="theunit"
              value={currentUnit}
              onChange={(e) => handleFilterChange('theunit', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
            <label htmlFor="ok" className="block text-sm font-medium text-gray-700 mb-1">
              掌握状态
            </label>
            <select
              id="ok"
              value={currentOk}
              onChange={(e) => handleFilterChange('ok', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
      )}
    </div>
  );
}