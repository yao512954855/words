interface GenerateArticleOptions {
  style: string;
  difficulty: string;
  wordCount: number;
  filteredWords: string[];
}

interface GeneratedArticle {
  english: string;
  chinese: string;
  words: {
    word: string;
    phonetic: string;
  }[];
}

export async function generateArticle(options: GenerateArticleOptions): Promise<GeneratedArticle> {
  try {
    // 调用API路由
    const response = await fetch('/api/generate-article', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '生成文章失败');
    }
    
    // 解析API响应
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('生成文章失败:', error);
    throw new Error('生成文章失败，请稍后重试');
  }
}