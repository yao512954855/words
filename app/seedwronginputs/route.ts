import { NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!);

async function seedWrongInputs() {
  try {
    // 创建错误输入记录表
    await sql`
      CREATE TABLE IF NOT EXISTS word_wrong_inputs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        word_id VARCHAR(255) NOT NULL,
        correct_word VARCHAR(255) NOT NULL,
        wrong_input VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // 创建索引以提高查询性能
    await sql`
      CREATE INDEX IF NOT EXISTS idx_word_wrong_inputs_user_id ON word_wrong_inputs(user_id)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_word_wrong_inputs_word_id ON word_wrong_inputs(word_id)
    `;

    console.log('Word wrong inputs table created successfully');
    return { message: 'Word wrong inputs table created successfully' };
  } catch (error) {
    console.error('Error creating word wrong inputs table:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const result = await seedWrongInputs();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create word wrong inputs table' },
      { status: 500 }
    );
  }
}