'use client';

import { generateYAxis } from '@/app/lib/utils';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { Revenue } from '@/app/lib/definitions';
import { useState, useEffect } from 'react';

// 定义时间维度类型
type TimePeriod = 'monthly' | 'weekly';

export default function RevenueChart() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');
  const [wordProgress, setWordProgress] = useState<Revenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWordProgressData = async (period: TimePeriod) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/word-progress?period=${period}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      setWordProgress(data);
    } catch (err) {
      setError('Failed to load word progress data');
      console.error('Error fetching word progress:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWordProgressData(timePeriod);
  }, [timePeriod]);

  const handlePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period);
  };

  const getPeriodTitle = () => {
    switch (timePeriod) {
      case 'monthly':
        return '月度学习统计';
      case 'weekly':
        return '周度学习统计';
      default:
        return '学习统计';
    }
  };

  const getPeriodDescription = () => {
    switch (timePeriod) {
      case 'monthly':
        return '本年度各月份';
      case 'weekly':
        return '本周各天';
      default:
        return '';
    }
  };

  if (error) {
    return (
      <div className="w-full md:col-span-4">
        <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
          学习统计
        </h2>
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  const chartHeight = 350;
  const { yAxisLabels, topLabel } = generateYAxis(wordProgress);

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        {getPeriodTitle()}
      </h2>
      
      {/* 时间维度切换按钮 */}
      <div className="mb-4 flex space-x-2">
        <button
          onClick={() => handlePeriodChange('monthly')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            timePeriod === 'monthly'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          月
        </button>
        <button
          onClick={() => handlePeriodChange('weekly')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            timePeriod === 'weekly'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          周
        </button>
      </div>

      <div className="rounded-xl bg-gray-50 p-4">
        <div className="sm:grid-cols-13 mt-0 grid grid-cols-12 items-end gap-2 rounded-md bg-white p-4 md:gap-4">
          <div
            className="mb-6 hidden flex-col justify-between text-sm text-gray-400 sm:flex"
            style={{ height: `${chartHeight}px` }}
          >
            {yAxisLabels.map((label) => (
              <p key={label}>{label}</p>
            ))}
          </div>

          {isLoading ? (
            <div className="col-span-11 flex items-center justify-center" style={{ height: `${chartHeight}px` }}>
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            wordProgress.map((month) => (
              <div key={month.month} className="flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-md bg-blue-300"
                  style={{
                    height: `${(chartHeight / topLabel) * month.revenue}px`,
                  }}
                ></div>
                <p className="-rotate-90 text-sm text-gray-400 sm:rotate-0">
                  {month.month}
                </p>
              </div>
            ))
          )}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500">{getPeriodDescription()}</h3>
        </div>
      </div>
    </div>
  );
}
