import { NextResponse } from 'next/server';
import postgres from 'postgres';

// 创建数据库连接
const sql = postgres(process.env.POSTGRES_URL!);

// 获取阅读页面的筛选选项
export async function GET() {
  try {
    // 从数据库获取所有筛选选项
    const options = await sql`
      SELECT id, type, value, label, sort_order, is_active
      FROM choicetable
      WHERE is_active = true
      ORDER BY type ASC, sort_order ASC, label ASC
    `;
    
    // 按类型分组
    const groupedOptions = options.reduce((acc, option) => {
      if (!acc[option.type]) {
        acc[option.type] = [];
      }
      acc[option.type].push(option);
      return acc;
    }, {});
    
    return NextResponse.json(groupedOptions);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reading filter options.' },
      { status: 500 }
    );
  }
}