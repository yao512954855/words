import { Suspense } from 'react';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import DynamicReadingFilters from '@/app/ui/reading/dynamic-filters';

export default async function Page() {
  return (
    <main className="flex flex-col items-center p-4 md:p-6">
      <h1 className="mb-4 text-xl md:text-2xl">阅读练习</h1>
      
      <div className="w-full max-w-4xl">
        <DynamicReadingFilters />
      </div>
      
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">今日推荐阅读</h2>
          <BookOpenIcon className="w-6 h-6 text-blue-500" />
        </div>
        
        <div className="prose max-w-none">
          <h3>The Importance of Reading</h3>
          <p>
            Reading is one of the most important skills a person can develop. It opens doors to new worlds, 
            ideas, and perspectives. Through reading, we can travel to distant places, learn about different 
            cultures, and expand our knowledge on countless subjects.
          </p>
          <p>
            Regular reading improves vocabulary, enhances comprehension, and strengthens critical thinking 
            abilities. It also helps reduce stress and provides entertainment that can be enjoyed anywhere.
          </p>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="font-medium mb-2">生词表</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <li className="flex items-center">
              <span className="font-medium mr-2">importance</span>
              <span className="text-gray-600">重要性</span>
            </li>
            <li className="flex items-center">
              <span className="font-medium mr-2">develop</span>
              <span className="text-gray-600">发展</span>
            </li>
            <li className="flex items-center">
              <span className="font-medium mr-2">perspective</span>
              <span className="text-gray-600">观点</span>
            </li>
            <li className="flex items-center">
              <span className="font-medium mr-2">enhance</span>
              <span className="text-gray-600">提高</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="w-full max-w-4xl">
        <h2 className="text-lg font-medium mb-4">阅读列表</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
              <h3 className="font-medium">阅读文章 {item}</h3>
              <p className="text-gray-600 text-sm mt-1">
                这是一篇简短的阅读文章，包含了常用词汇和语法结构...
              </p>
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-gray-500">难度: {item} / 5</span>
                <button className="text-blue-600 text-sm hover:text-blue-800">
                  开始阅读
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}