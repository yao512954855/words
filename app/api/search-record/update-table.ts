import postgres from 'postgres';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL || '');

export async function updateSearchRecordsTable() {
  try {
    // 检查is_completed字段是否已存在
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'search_records' 
      AND column_name = 'is_completed'
    `;

    // 如果字段不存在，则添加
    if (checkColumn.length === 0) {
      await sql`
        ALTER TABLE search_records 
        ADD COLUMN is_completed BOOLEAN DEFAULT false
      `;
      console.log(`Added "is_completed" column to "search_records" table`);
      return true;
    } else {
      console.log(`Column "is_completed" already exists in "search_records" table`);
      return true;
    }
  } catch (error) {
    console.error('Error updating search_records table:', error);
    return false;
  }
}

// API路由处理函数
export async function GET() {
  try {
    const result = await updateSearchRecordsTable();
    return NextResponse.json({ 
      success: result, 
      message: result ? 'Search records table updated successfully' : 'Failed to update search records table' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}