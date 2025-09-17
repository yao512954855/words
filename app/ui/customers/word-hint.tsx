'use client';

import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface WordHintProps {
  word: string;
}

export default function WordHint({ word }: WordHintProps) {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="flex items-center gap-2 text-gray-500 mt-1">
      <button
        onClick={toggleVisibility}
        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
        type="button"
      >
        {isVisible ? (
          <>
            <EyeSlashIcon className="w-3 h-3" />
            隐藏
          </>
        ) : (
          <>
            <EyeIcon className="w-3 h-3" />
            提示
          </>
        )}
      </button>
      {isVisible && (
        <span className="text-sm font-medium text-blue-600">
          {word}
        </span>
      )}
    </div>
  );
}