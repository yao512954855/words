import { NextResponse } from 'next/server';
import { updateSearchRecordsTable } from '../search-record/update-table';

export async function GET() {
  try {
    const result = await updateSearchRecordsTable();
    return NextResponse.json({ 
      success: result, 
      message: result ? '搜索记录表更新成功' : '更新搜索记录表失败' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}