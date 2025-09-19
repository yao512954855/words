interface GenerateArticleOptions {
  style: string;
  difficulty: string;
  wordCount: number;
  filteredWords: string[];
  version?: string;
  grade?: string;
  theclass?: string;
  theunit?: string;
}

interface GeneratedArticle {
  english: string;
  chinese: string;
  words: {
    word: string;
    phonetic: string;
  }[];
  title?: string;
  saved?: boolean;
  articleId?: string;
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
    
    // 自动保存文章到数据库
    try {
      const saveResponse = await fetch('/api/save-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...result,
          style: options.style,
          difficulty: options.difficulty,
          version: options.version,
          grade: options.grade,
          theclass: options.theclass,
          theunit: options.theunit
        }),
      });
      
      if (saveResponse.ok) {
        const saveResult = await saveResponse.json();
        if (saveResult.success) {
          result.saved = true;
          result.articleId = saveResult.articleId;
        }
      }
    } catch (saveError) {
      console.error('保存文章失败:', saveError);
      // 保存失败不影响返回生成的文章
    }
    
    return result;
  } catch (error) {
    console.error('生成文章失败:', error);
    throw new Error('生成文章失败，请稍后重试');
  }
}