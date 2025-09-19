'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface ArticleData {
  id: string;
  title: string;
  english: string;
  chinese: string;
  words: {
    word: string;
    translation: string;
    phonetic?: string;
    version?: string;
    grade?: string;
    theclass?: string;
    theunit?: string;
  }[];
  created_at: string;
}

// 正确定义params类型为Promise<{id: string}>
export default function ArticlePage({ params }: { params: Promise<{id: string}> }) {
  // 使用use函数解包Promise
  const resolvedParams = use(params);
  const articleId = resolvedParams.id;
  
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const response = await fetch(`/api/article/${articleId}`);
        if (!response.ok) {
          throw new Error('文章获取失败');
        }
        const data = await response.json();
        setArticle(data);
      } catch (error: any) {
        console.error('获取文章详情失败:', error);
        setError(error.message || '获取文章详情失败');
      } finally {
        setIsLoading(false);
      }
    }

    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  // 处理英文和中文段落的渲染
  const renderContent = () => {
    if (!article) return null;

    const englishParagraphs = article.english.split('\n').filter(p => p.trim() !== '');
    const chineseParagraphs = article.chinese.split('\n').filter(p => p.trim() !== '');

    return englishParagraphs.map((paragraph, index) => {
      const isTitle = index === 0;
      const chineseText = chineseParagraphs[index] || '';

      if (isTitle) {
        return (
          <div key={index} className="mb-6">
            <div className="text-2xl font-bold text-center mb-2">{paragraph}</div>
            <div className="text-lg text-center text-gray-600">{chineseText}</div>
          </div>
        );
      }

      return (
        <div key={index} className="mb-4">
          <div className="mb-1">{paragraph}</div>
          <div className="pl-3 border-l-2 border-gray-300 text-gray-600">{chineseText}</div>
        </div>
      );
    });
  };

  // 渲染单词列表
  const renderWordList = () => {
    if (!article || !article.words || article.words.length === 0) {
      return <p className="text-gray-500 italic">没有筛选的单词</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {article.words.map((word, index) => (
          <div key={index} className="bg-gray-50 p-3 rounded-md">
            <div className="font-medium">{word.word}</div>
            {word.phonetic && <div className="text-sm text-gray-500">{word.phonetic}</div>}
            <div className="text-sm">{word.translation}</div>
            {word.version && <div className="text-xs text-gray-400">版本: {word.version}</div>}
            {word.grade && <div className="text-xs text-gray-400">年级: {word.grade}</div>}
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 mb-4">{error}</div>
        <Link href="/dashboard/reading/my-articles" className="text-blue-600 hover:underline">
          返回文章列表
        </Link>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-gray-500 mb-4">文章不存在或已被删除</div>
        <Link href="/dashboard/reading/my-articles" className="text-blue-600 hover:underline">
          返回文章列表
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <Link href="/dashboard/reading/my-articles" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          返回文章列表
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {renderContent()}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">单词列表</h2>
        {renderWordList()}
      </div>
    </main>
  );
}