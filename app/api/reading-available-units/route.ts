import { NextResponse } from 'next/server';
import postgres from 'postgres';

// 创建数据库连接
const sql = postgres(process.env.POSTGRES_URL!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const version = searchParams.get('version');
  const grade = searchParams.get('grade');
  const theclass = searchParams.get('theclass');
  const theunit = searchParams.get('theunit');
  const ok = searchParams.get('ok');
  const limit = searchParams.get('limit') || '10';

  try {
    // 构建查询条件
    let conditions = [];
    let params = [];
    
    if (version && version !== 'all') {
      conditions.push(`version = $${params.length + 1}`);
      params.push(version);
    }
    
    if (grade && grade !== 'all') {
      conditions.push(`grade = $${params.length + 1}`);
      params.push(grade);
    }
    
    if (theclass && theclass !== 'all') {
      conditions.push(`theclass = $${params.length + 1}`);
      params.push(theclass);
    }
    
    if (theunit && theunit !== 'all') {
      conditions.push(`theunit = $${params.length + 1}`);
      params.push(theunit);
    }

    // 构建查询语句
    let query = `
      SELECT * FROM customers
      ${conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''}
      ORDER BY name
      LIMIT ${parseInt(limit)}
    `;

    // 执行查询
    const result = await sql.unsafe(query, params);
    
    return NextResponse.json({ customers: result });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filtered words.' },
      { status: 500 }
    );
  }
}