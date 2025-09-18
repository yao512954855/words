import postgres from 'postgres';
import { auth } from '@/auth';
import { NextRequest } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL!);

// GET - 获取收藏单词统计数据（支持分页）
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const sortBy = searchParams.get('sortBy') || 'count'; // 'count' 或 'recent'
    const userId = session.user.email; // 临时使用email作为用户标识

    const offset = (page - 1) * limit;

    // 获取收藏单词统计数据
    let orderClause = '';
    if (sortBy === 'count') {
      orderClause = 'ORDER BY favorite_count DESC, last_favorited_at DESC';
    } else if (sortBy === 'recent') {
      orderClause = 'ORDER BY last_favorited_at DESC';
    }

    // 查询收藏单词统计（包含收藏次数）
    const favoriteWords = await sql`
      SELECT 
        word_id as id,
        word_text,
        COUNT(*) as favorite_count,
        MIN(created_at) as created_at,
        MAX(updated_at) as last_favorited_at,
        CONCAT('/wordspic/', word_text, '.png') as image_url
      FROM word_favorites 
      WHERE user_id = ${userId}
      GROUP BY word_id, word_text
      ${sql.unsafe(orderClause)}
      LIMIT ${limit} OFFSET ${offset}
    `;

    // 获取总数
    const totalResult = await sql`
      SELECT COUNT(DISTINCT word_id) as total
      FROM word_favorites 
      WHERE user_id = ${userId}
    `;

    const total = parseInt(totalResult[0]?.total || '0');
    const totalPages = Math.ceil(total / limit);

    return Response.json({
      favoriteWords: favoriteWords.map(word => ({
        id: word.id,
        word_text: word.word_text,
        favorite_count: parseInt(word.favorite_count),
        image_url: word.image_url,
        created_at: word.created_at,
        last_favorited_at: word.last_favorited_at
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching favorite words stats:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}