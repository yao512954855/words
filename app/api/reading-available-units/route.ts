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
    // 检查是否是请求可用单元列表
    const isUnitListRequest = version && version !== 'all' && 
                             grade && grade !== 'all' && 
                             theclass && theclass !== 'all' && 
                             !theunit && !ok;

    if (isUnitListRequest) {
      // 对于joinin四年级上，返回所有可能的单元（1-7）
      if (version === 'joinin' && grade === '4' && theclass === '1') {
        return NextResponse.json(['1', '2', '3', '4', '5', '6', '7']);
      }
      
      // 对于其他组合，查询数据库中实际存在的单元
      const query = `
        SELECT DISTINCT theunit FROM customers
        WHERE version = $1 AND grade = $2 AND theclass = $3
        ORDER BY theunit
      `;
      
      const units = await sql.unsafe(query, [version, grade, theclass]);
      const unitValues = units.map((row: any) => row.theunit).filter(Boolean);
      
      return NextResponse.json(unitValues);
    }
    
    // 正常的单词查询
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