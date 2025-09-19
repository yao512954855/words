'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpenIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Article {
  id: string;
  title: string;
  style: string;
  difficulty: string;
  version?: string;
  grade?: string;
  theclass?: string;
  theunit?: string;
  created_at: string;
}

export default function MyArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch('/api/my-articles');
        if (response.ok) {
          const data = await response.json();
          setArticles(data);
        }
      } catch (error) {
        console.error('获取文章列表失败:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchArticles();
  }, []);

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取难度等级的中文名称
  const getDifficultyLabel = (difficulty: string) => {
    const difficultyMap: Record<string, string> = {
      'beginner': '初级',
      'intermediate': '中级',
      'advanced': '高级'
    };
    return difficultyMap[difficulty] || difficulty;
  };

  // 获取文章风格的中文名称
  const getStyleLabel = (style: string) => {
    const styleMap: Record<string, string> = {
      'informative': '信息类',
      'narrative': '叙事类',
      'descriptive': '描述类',
      'persuasive': '说服类',
      'story': '故事类'
    };
    return styleMap[style] || style;
  };

  return (
    <main className="flex flex-col items-center p-4 md:p-6">
      <div className="w-full max-w-4xl">
        <div className="flex items-center mb-6">
          <Link href="/dashboard/reading" className="mr-4 text-blue-600 hover:text-blue-800">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-xl md:text-2xl font-semibold">我的文章</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <BookOpenIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">您还没有保存的文章</p>
            <Link 
              href="/dashboard/reading" 
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              去生成文章
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {articles.map((article) => (
              <Link 
                key={article.id} 
                href={`/dashboard/reading/article/${article.id}`}
                className="block bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
              >
                <h2 className="text-lg font-medium mb-2 line-clamp-2">{article.title}</h2>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {getStyleLabel(article.style)}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    {getDifficultyLabel(article.difficulty)}
                  </span>
                  {article.version && article.grade && article.theclass && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {article.version}-{article.grade}-{article.theclass}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  创建于 {formatDate(article.created_at)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}