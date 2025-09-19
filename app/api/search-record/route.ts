import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';
import { auth } from '@/auth';

const sql = postgres(process.env.POSTGRES_URL || '');

// 记录搜索输入
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 打印session对象结构，查看用户信息
    console.log('Session user object:', JSON.stringify(session.user, null, 2));
    
    // 正确获取用户ID - 在NextAuth中，用户ID通常存储在user.id或user.email中
    // 优先使用id，如果没有则使用email作为唯一标识
    const userId = session.user.id || session.user.email || session.user.name || 'anonymous-user';
    
    // 记录获取到的userId
    console.log('Using userId:', userId);
    // 获取请求数据
    const requestData = await request.json();
    const searchTerm = requestData.searchTerm || '';
    const isPartial = requestData.isPartial || false;
    const resultCount = requestData.resultCount || 0;
    
    // 确保所有值都有定义
    const isPartialValue = isPartial === true;
    const resultCountValue = parseInt(resultCount.toString()) || 0;
    console.log('POST /api/search-record', { userId, searchTerm, isPartialValue, resultCountValue });

    // 记录搜索输入到数据库
    await sql`
      INSERT INTO search_records (user_id, search_term, is_partial, result_count,created_at)
      VALUES (${userId}, ${searchTerm}, ${isPartialValue}, ${resultCountValue},NOW())
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording search:', error);
    return NextResponse.json({ error: 'Failed to record search' }, { status: 500 });
  }
}

// 获取搜索记录统计
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id as string;
    const searchParams = request.nextUrl.searchParams;
    const limitStr = searchParams.get('limit') || '10';
    const limit = parseInt(limitStr);

    // 获取用户的搜索记录统计
    const searchStats = await sql`
      SELECT search_term, COUNT(*) as count, MAX(created_at) as last_searched
      FROM search_records
      WHERE user_id = ${userId}
      GROUP BY search_term
      ORDER BY count DESC, last_searched DESC
      LIMIT ${limit}
    `;

    return NextResponse.json(searchStats);
  } catch (error) {
    console.error('Error fetching search stats:', error);
    return NextResponse.json({ error: 'Failed to fetch search statistics' }, { status: 500 });
  }
}