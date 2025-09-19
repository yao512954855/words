import postgres from 'postgres';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL || '');

export async function createSearchRecordsTable() {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // 创建搜索记录表
    await sql`
      CREATE TABLE IF NOT EXISTS search_records (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        search_term VARCHAR(255) NOT NULL,
        is_partial BOOLEAN DEFAULT false,
        result_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    console.log(`Created "search_records" table`);
    return true;
  } catch (error) {
    console.error('Error creating search_records table:', error);
    return false;
  }
}

// API路由处理函数
export async function GET() {
  try {
    const result = await createSearchRecordsTable();
    return NextResponse.json({ 
      success: result, 
      message: result ? 'Search records table created successfully' : 'Failed to create search records table' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}