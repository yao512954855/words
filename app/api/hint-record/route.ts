import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';
import { auth } from '@/auth';

const sql = postgres(process.env.POSTGRES_URL!);

export async function POST(request: NextRequest) {
  try {
    // 获取当前用户信息
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;
    const { wordId, wordText } = await request.json();

    if (!wordId || !wordText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 插入或更新提示记录
    const result = await sql`
      INSERT INTO word_hint_records (user_id, word_id, word_text, hint_count)
      VALUES (${userId}, ${wordId}, ${wordText}, 1)
      ON CONFLICT (user_id, word_id)
      DO UPDATE SET 
        hint_count = word_hint_records.hint_count + 1,
        updated_at = NOW()
      RETURNING *
    `;

    return NextResponse.json({ 
      success: true, 
      data: result[0],
      message: 'Hint record saved successfully' 
    });

  } catch (error) {
    console.error('Error saving hint record:', error);
    return NextResponse.json({ 
      error: 'Failed to save hint record' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // 获取当前用户信息
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;
    const { searchParams } = new URL(request.url);
    const wordId = searchParams.get('wordId');

    if (wordId) {
      // 获取特定单词的提示记录
      const result = await sql`
        SELECT * FROM word_hint_records 
        WHERE user_id = ${userId} AND word_id = ${wordId}
      `;
      return NextResponse.json({ data: result[0] || null });
    } else {
      // 获取用户所有提示记录
      const result = await sql`
        SELECT * FROM word_hint_records 
        WHERE user_id = ${userId}
        ORDER BY updated_at DESC
      `;
      return NextResponse.json({ data: result });
    }

  } catch (error) {
    console.error('Error fetching hint records:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch hint records' 
    }, { status: 500 });
  }
}