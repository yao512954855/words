'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface GenerateArticleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (options: {
    style: string;
    difficulty: string;
    wordCount: number;
    filteredWords: string[];
  }) => void;
  filteredWords: string[];
}

export default function GenerateArticleDialog({
  isOpen,
  onClose,
  onGenerate,
  filteredWords,
}: GenerateArticleDialogProps) {
  const [style, setStyle] = useState('informative');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [wordCount, setWordCount] = useState(300);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      style,
      difficulty,
      wordCount,
      filteredWords,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">生成阅读文章</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              文章风格
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="informative">信息类</option>
              <option value="narrative">叙事类</option>
              <option value="descriptive">描述类</option>
              <option value="persuasive">说服类</option>
              <option value="story">故事类</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              难易程度
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="beginner">初级</option>
              <option value="intermediate">中级</option>
              <option value="advanced">高级</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              生成字数
            </label>
            <input
              type="number"
              min="100"
              max="1000"
              step="50"
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              包含的单词
            </label>
            <div className="border border-gray-300 rounded-md p-2 max-h-32 overflow-y-auto">
              {filteredWords.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {filteredWords.map((word, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">没有筛选的单词</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              disabled={filteredWords.length === 0}
            >
              生成文章
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}