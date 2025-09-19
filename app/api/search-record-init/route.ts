import { NextResponse } from 'next/server';
import { createSearchRecordsTable } from '../search-record/create-table';

export async function GET() {
  try {
    const result = await createSearchRecordsTable();
    return NextResponse.json({ 
      success: result, 
      message: result ? '搜索记录表创建成功' : '创建搜索记录表失败' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}