'use client';

import { useState, useEffect } from 'react';
import { SparklesIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';
import DynamicReadingFilters from '@/app/ui/reading/dynamic-filters';
import FilteredWordsList from '@/app/ui/reading/filtered-words-list';
import GenerateArticleDialog from '@/app/ui/reading/generate-article-dialog';
import { useSearchParams } from 'next/navigation';
import { generateArticle } from '@/app/lib/article-generator';

export default function Page() {
  const searchParams = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [article, setArticle] = useState({
    english: '',
    chinese: '',
    words: [] as { word: string; phonetic: string }[]
  });
  const [filteredWords, setFilteredWords] = useState<string[]>([]);
  
  // 从URL获取当前筛选条件下的单词
  useEffect(() => {
    const fetchFilteredWords = async () => {
      // 构建查询参数
      const version = searchParams.get('version') || 'all';
      const grade = searchParams.get('grade') || 'all';
      const theclass = searchParams.get('theclass') || 'all';
      const theunit = searchParams.get('theunit') || 'all';
      const ok = searchParams.get('ok') || 'all';
      const limit = searchParams.get('limit') || '10';
      
      const params = new URLSearchParams();
      if (version !== 'all') params.set('version', version);
      if (grade !== 'all') params.set('grade', grade);
      if (theclass !== 'all') params.set('theclass', theclass);
      if (theunit !== 'all') params.set('theunit', theunit);
      if (ok !== 'all') params.set('ok', ok);
      params.set('limit', limit);
      
      try {
        const response = await fetch(`/api/reading-available-units?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          // 从返回的数据中提取单词
          const words = data.customers?.map((customer: any) => customer.name) || [];
          setFilteredWords(words.length > 0 ? words : ['importance', 'develop', 'perspective', 'enhance']);
        } else {
          console.error('获取筛选结果失败');
          setFilteredWords(['importance', 'develop', 'perspective', 'enhance']);
        }
      } catch (error) {
        console.error('获取筛选结果出错:', error);
        setFilteredWords(['importance', 'develop', 'perspective', 'enhance']);
      }
    };
    
    fetchFilteredWords();
  }, [searchParams]);
  
  const handleGenerateClick = () => {
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  
  const handleGenerateArticle = async (options: {
    style: string;
    difficulty: string;
    wordCount: number;
    filteredWords: string[];
  }) => {
    setIsLoading(true);
    try {
      const result = await generateArticle(options);
      setArticle(result);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('生成文章失败:', error);
      alert('生成文章失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="flex flex-col items-center p-4 md:p-6">
      <h1 className="mb-4 text-xl md:text-2xl">阅读练习</h1>
      
      <div className="w-full max-w-4xl">
        <div className="mb-4">
          <DynamicReadingFilters />
        </div>
        <div className="flex justify-center mb-6">
          <button
            onClick={handleGenerateClick}
            className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-colors shadow-md"
          >
            <SparklesIcon className="w-5 h-5 mr-2" />
            AI生成文章
          </button>
        </div>
      </div>
      
      {/* 文章生成对话框 */}
      <GenerateArticleDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onGenerate={handleGenerateArticle}
        filteredWords={filteredWords}
      />
      
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <SparklesIcon className="h-5 w-5 mr-2 text-blue-500" />
            {article.english ? '生成的阅读文章' : '今日推荐阅读'}
          </h2>
          {isLoading && <div className="text-blue-500">生成中...</div>}
        </div>
        
        <div className="prose max-w-none">
          {article.english ? (
            <>
              <div className="mb-6">
                {article.english.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph.split(' ').map((word, wordIndex) => {
                      const foundWord = article.words.find(w => 
                        w.word.toLowerCase() === word.replace(/[.,!?;:'"()]/g, '').toLowerCase()
                      );
                      return foundWord ? (
                        <span key={wordIndex} className="relative group">
                          <span className="font-medium">{word} </span>
                          <span className="absolute bottom-full left-0 bg-gray-800 text-white text-xs rounded p-1 hidden group-hover:block">
                            {foundWord.phonetic} 
                          </span>
                        </span>
                      ) : (
                        <span key={wordIndex}>{word} </span>
                      );
                    })}
                  </p>
                ))}
              </div>
              <div className="border-t pt-4 mt-4">
                <h4 className="text-lg font-medium mb-2">中文翻译</h4>
                {article.chinese.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700">{paragraph}</p>
                ))}
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
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