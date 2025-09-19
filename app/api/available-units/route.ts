import { NextResponse } from 'next/server';
import postgres from 'postgres';

// 创建数据库连接
const sql = postgres(process.env.POSTGRES_URL!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const version = searchParams.get('version');
  const grade = searchParams.get('grade');
  const theclass = searchParams.get('theclass');

  if (!version || !grade || !theclass) {
    return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
  }

  try {
    // 从customers表中查询指定教材、年级、学期下存在的单元
    const result = await sql`
      SELECT DISTINCT theunit
      FROM customers
      WHERE version = ${version}
      AND grade = ${grade}
      AND theclass = ${theclass}
      ORDER BY theunit
    `;

    // 提取单元值
    const units = result.map(row => row.theunit);
    
    return NextResponse.json(units);
  } catch (error) {
    console.error('获取可用单元失败:', error);
    return NextResponse.json({ error: '获取可用单元失败' }, { status: 500 });
  }
}