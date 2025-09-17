import postgres from 'postgres';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL!);

async function seedUserWordProgress() {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // 删除现有表（如果存在）
    await sql`DROP TABLE IF EXISTS user_word_progress`;

    // 创建用户单词学习状态表
    const createTable = await sql`
      CREATE TABLE user_word_progress (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        word_id UUID NOT NULL,
        is_learned BOOLEAN DEFAULT FALSE,
        learned_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, word_id)
      );
    `;

    // 创建索引以提高查询性能
    await sql`
      CREATE INDEX IF NOT EXISTS idx_user_word_progress_user_id 
      ON user_word_progress(user_id);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_user_word_progress_word_id 
      ON user_word_progress(word_id);
    `;

    console.log(`Created "user_word_progress" table with indexes`);

    return {
      createTable,
    };
  } catch (error) {
    console.error('Error seeding user word progress:', error);
    throw error;
  }
}

export async function GET() {
  try {
    await seedUserWordProgress();
    return NextResponse.json({ message: 'User word progress table created successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}