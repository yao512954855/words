import { NextResponse } from 'next/server';
import { getArticleById } from '@/app/lib/articles';
import { auth } from '@/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const articleId = params.id;
    
    const article = await getArticleById(articleId, userId);
    
    if (!article) {
      return NextResponse.json(
        { error: '文章不存在或无权访问' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(article);
  } catch (error: any) {
    console.error('获取文章详情失败:', error);
    return NextResponse.json(
      { error: `获取文章详情失败: ${error.message}` },
      { status: 500 }
    );
  }
}