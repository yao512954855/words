import { NextResponse } from 'next/server';
import { getUserArticles, getLatestUserArticle } from '@/app/lib/articles';
import { auth } from '@/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') || '10');
    const offset = Number(searchParams.get('offset') || '0');
    const latest = searchParams.get('latest') === 'true';
    
    const session = await auth();
    
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }
    
    const userId = session.user.email;
    
    // 如果请求最新文章
    if (latest) {
      const latestArticle = await getLatestUserArticle(userId);
      return NextResponse.json(latestArticle || {});
    }
    
    // 否则返回文章列表
    const articles = await getUserArticles(userId, limit, offset);
    
    return NextResponse.json(articles);
  } catch (error: any) {
    console.error('获取文章列表失败:', error);
    return NextResponse.json(
      { error: `获取文章列表失败: ${error.message}` },
      { status: 500 }
    );
  }
}