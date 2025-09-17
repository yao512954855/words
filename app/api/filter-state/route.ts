import postgres from 'postgres';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const sql = postgres(process.env.POSTGRES_URL!);

// 获取用户筛选状态
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;
    
    const result = await sql`
      SELECT filter_type, filter_value 
      FROM user_filter_state 
      WHERE user_id = ${userId}
    `;

    const filterState: Record<string, string[]> = {};
    
    result.forEach((row: any) => {
      if (!filterState[row.filter_type]) {
        filterState[row.filter_type] = [];
      }
      filterState[row.filter_type].push(row.filter_value);
    });

    return NextResponse.json({ filterState });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 保存用户筛选状态
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;
    const { filterState } = await request.json();

    // 先删除用户现有的筛选状态
    await sql`
      DELETE FROM user_filter_state 
      WHERE user_id = ${userId}
    `;

    // 插入新的筛选状态
    for (const [filterType, values] of Object.entries(filterState)) {
      if (Array.isArray(values) && values.length > 0) {
        for (const value of values) {
          await sql`
            INSERT INTO user_filter_state (user_id, filter_type, filter_value)
            VALUES (${userId}, ${filterType}, ${value})
            ON CONFLICT (user_id, filter_type, filter_value) DO NOTHING
          `;
        }
      }
    }

    return NextResponse.json({ message: 'Filter state saved successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}