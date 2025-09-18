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
    const { wordId, correctWord, wrongInput } = await request.json();

    if (!wordId || !correctWord || !wrongInput) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 插入错误输入记录
    const result = await sql`
      INSERT INTO word_wrong_inputs (user_id, word_id, correct_word, wrong_input)
      VALUES (${userId}, ${wordId}, ${correctWord}, ${wrongInput})
      RETURNING *
    `;

    return NextResponse.json({ 
      success: true, 
      data: result[0],
      message: 'Wrong input recorded successfully' 
    });

  } catch (error) {
    console.error('Error recording wrong input:', error);
    return NextResponse.json({ 
      error: 'Failed to record wrong input' 
    }, { status: 500 });
  }
}

// 获取用户的错误输入统计
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
      // 获取特定单词的错误输入记录
      const result = await sql`
        SELECT * FROM word_wrong_inputs 
        WHERE user_id = ${userId} AND word_id = ${wordId}
        ORDER BY created_at DESC
      `;
      return NextResponse.json({ data: result });
    } else {
      // 获取用户所有错误输入统计
      const result = await sql`
        SELECT 
          word_id,
          correct_word,
          COUNT(*) as error_count,
          array_agg(wrong_input ORDER BY created_at DESC) as wrong_inputs,
          MAX(created_at) as last_error_at
        FROM word_wrong_inputs 
        WHERE user_id = ${userId}
        GROUP BY word_id, correct_word
        ORDER BY error_count DESC, last_error_at DESC
      `;
      return NextResponse.json({ data: result });
    }

  } catch (error) {
    console.error('Error fetching wrong input records:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch wrong input records' 
    }, { status: 500 });
  }
}