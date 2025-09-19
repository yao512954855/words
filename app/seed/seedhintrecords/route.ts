import postgres from 'postgres';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL!);

async function seedHintRecords() {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // 删除现有表（如果存在）
    await sql`DROP TABLE IF EXISTS word_hint_records`;

    // 创建单词提示记录表
    const createTable = await sql`
      CREATE TABLE word_hint_records (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        word_id UUID NOT NULL,
        word_text VARCHAR(255) NOT NULL,
        hint_count INTEGER DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, word_id)
      );
    `;

    // 创建索引以提高查询性能
    await sql`
      CREATE INDEX IF NOT EXISTS idx_word_hint_records_user_id 
      ON word_hint_records(user_id);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_word_hint_records_word_id 
      ON word_hint_records(word_id);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_word_hint_records_created_at 
      ON word_hint_records(created_at);
    `;

    console.log(`Created "word_hint_records" table with indexes`);

    return {
      createTable,
    };
  } catch (error) {
    console.error('Error seeding word hint records:', error);
    throw error;
  }
}

export async function GET() {
  try {
    await seedHintRecords();
    return NextResponse.json({ message: 'Word hint records table created successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}