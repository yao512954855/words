import postgres from 'postgres';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL!);

async function seedUserFilterState() {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // 创建用户筛选状态表
    const createTable = await sql`
      CREATE TABLE IF NOT EXISTS user_filter_state (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        filter_type VARCHAR(50) NOT NULL,
        filter_value VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, filter_type, filter_value)
      );
    `;

    console.log(`Created "user_filter_state" table`);

    return {
      createTable,
    };
  } catch (error) {
    console.error('Error seeding user filter state:', error);
    throw error;
  }
}

export async function GET() {
  try {
    await seedUserFilterState();
    return NextResponse.json({ message: 'User filter state table created successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}