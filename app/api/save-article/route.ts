import { NextResponse } from 'next/server';
import { saveArticle } from '@/app/lib/articles';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 提取标题 - 通常是第一段文本
    let title = '未命名文章';
    if (body.english) {
      const paragraphs = body.english.split('\n');
      if (paragraphs.length > 0) {
        // 清除标题中的星号和其他格式标记
        title = paragraphs[0].replace(/\*\*/g, '').trim();
        // 如果标题太长，截取前50个字符
        if (title.length > 50) {
          title = title.substring(0, 50) + '...';
        }
      }
    }
    
    // 保存文章
    const result = await saveArticle({
      title,
      english: body.english,
      chinese: body.chinese,
      words: body.words || [],
      style: body.style || 'informative',
      difficulty: body.difficulty || 'intermediate',
      version: body.version,
      grade: body.grade,
      theclass: body.theclass,
      theunit: body.theunit
    });
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('保存文章失败:', error);
    return NextResponse.json(
      { success: false, error: `保存文章失败: ${error.message}` },
      { status: 500 }
    );
  }
}