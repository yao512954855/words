import { Suspense } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import DynamicReadingFilters from '@/app/ui/reading/dynamic-filters';
import FilteredWordsList from '@/app/ui/reading/filtered-words-list';

export default async function Page() {
  return (
    <main className="flex flex-col items-center p-4 md:p-6">
      <h1 className="mb-4 text-xl md:text-2xl">阅读练习</h1>
      
      <div className="w-full max-w-4xl">
        <DynamicReadingFilters />
      </div>
      
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">AI生成阅读</h2>
          <SparklesIcon className="w-6 h-6 text-blue-500" />
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
        
        {/* <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="font-medium mb-2">中文翻译</h4>
          <p>阅读是一个人能够培养的最重要的技能之一。它为新的世界、思想和视角打开了大门。通过阅读，我们可以去往遥远的地方，了解不同的文化，并拓展我们在无数领域的知识。</p>
          <p>定期阅读能扩大词汇量、提高理解力并增强批判性思维能力。它还有助于减轻压力，并提供一种在任何地方都能享受的娱乐方式。</p>
        </div> */}
      </div>
      
      {/* 筛选结果显示 */}
      <FilteredWordsList />
    </main>
  );
}