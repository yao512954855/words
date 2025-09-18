import postgres from 'postgres';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL!);

export async function GET() {
  try {
    // 1. 首先检查customers表是否已有chinese_translation字段
    const checkColumnExists = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'customers' 
      AND column_name = 'chinese_translation';
    `;

    // 如果字段不存在，添加该字段
    if (checkColumnExists.length === 0) {
      await sql`
        ALTER TABLE customers 
        ADD COLUMN chinese_translation VARCHAR(255) DEFAULT '未知';
      `;
      console.log('Added chinese_translation column to customers table');
    }

    // 2. 从word_translations表获取数据并更新customers表
    const updateResult = await sql`
      UPDATE customers c
      SET chinese_translation = wt.chinese_translation
      FROM word_translations wt
      WHERE LOWER(c.name) = LOWER(wt.word_text);
    `;

    // 3. 获取更新的记录数
    const updatedCount = await sql`
      SELECT COUNT(*) as count
      FROM customers
      WHERE chinese_translation != '未知';
    `;

    return NextResponse.json({ 
      message: '成功将中文翻译数据迁移到customers表',
      updatedRecords: updatedCount[0].count,
      status: 'success'
    });
  } catch (error) {
    console.error('迁移数据时出错:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '未知错误',
      status: 'error'
    }, { status: 500 });
  }
}