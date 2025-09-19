import { NextResponse } from 'next/server';
import { getUserArticles } from '@/app/lib/articles';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const articles = await getUserArticles(userId);
    
    return NextResponse.json(articles);
  } catch (error: any) {
    console.error('获取文章列表失败:', error);
    return NextResponse.json(
      { error: `获取文章列表失败: ${error.message}` },
      { status: 500 }
    );
  }
}