import postgres from 'postgres';
import { auth } from '@/auth';
import { NextRequest } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL!);

// POST - 添加或删除收藏
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { wordId, wordText, action } = await request.json();
    
    if (!wordId || !wordText || !action) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 获取用户ID (这里简化处理，实际应该从用户表获取)
    const userId = session.user.email; // 临时使用email作为用户标识

    if (action === 'add') {
      // 添加收藏 (使用 ON CONFLICT DO NOTHING 避免重复)
      await sql`
        INSERT INTO word_favorites (user_id, word_id, word_text, created_at, updated_at)
        VALUES (${userId}, ${wordId}, ${wordText}, NOW(), NOW())
        ON CONFLICT (user_id, word_id) DO NOTHING
      `;
      
      return Response.json({ 
        message: 'Word favorited successfully',
        isFavorited: true 
      });
    } else if (action === 'remove') {
      // 删除收藏
      await sql`
        DELETE FROM word_favorites 
        WHERE user_id = ${userId} AND word_id = ${wordId}
      `;
      
      return Response.json({ 
        message: 'Word unfavorited successfully',
        isFavorited: false 
      });
    } else {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error handling favorite:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - 获取收藏状态或收藏列表
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const wordId = searchParams.get('wordId');
    const userId = session.user.email; // 临时使用email作为用户标识

    if (wordId) {
      // 检查特定单词的收藏状态
      const result = await sql`
        SELECT id FROM word_favorites 
        WHERE user_id = ${userId} AND word_id = ${wordId}
        LIMIT 1
      `;
      
      return Response.json({ 
        isFavorited: result.length > 0 
      });
    } else {
      // 获取用户的所有收藏
      const result = await sql`
        SELECT * FROM word_favorites 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `;
      
      return Response.json({ 
        favorites: result,
        count: result.length 
      });
    }

  } catch (error) {
    console.error('Error fetching favorites:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}