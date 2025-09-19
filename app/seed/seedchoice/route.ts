import postgres from 'postgres';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL!);

// 筛选选项的种子数据
const choiceData = [
  // 版本选项
  { type: 'version', value: 'rj', label: '人教版', sort_order: 1 },
  { type: 'version', value: 'bs', label: '北师大版', sort_order: 2 },
  { type: 'version', value: 'wy', label: '外研版', sort_order: 3 },
  { type: 'version', value: 'pep', label: 'PEP版', sort_order: 4 },
  
  // 年级选项
  { type: 'grade', value: 'k1', label: '幼儿园小班', sort_order: 1 },
  { type: 'grade', value: 'k2', label: '幼儿园中班', sort_order: 2 },
  { type: 'grade', value: 'k3', label: '幼儿园大班', sort_order: 3 },
  { type: 'grade', value: '1', label: '一年级', sort_order: 4 },
  { type: 'grade', value: '2', label: '二年级', sort_order: 5 },
  { type: 'grade', value: '3', label: '三年级', sort_order: 6 },
  { type: 'grade', value: '4', label: '四年级', sort_order: 7 },
  { type: 'grade', value: '5', label: '五年级', sort_order: 8 },
  { type: 'grade', value: '6', label: '六年级', sort_order: 9 },
  { type: 'grade', value: '7', label: '七年级', sort_order: 10 },
  { type: 'grade', value: '8', label: '八年级', sort_order: 11 },
  { type: 'grade', value: '9', label: '九年级', sort_order: 12 },
  { type: 'grade', value: '10', label: '高一', sort_order: 13 },
  { type: 'grade', value: '11', label: '高二', sort_order: 14 },
  { type: 'grade', value: '12', label: '高三', sort_order: 15 },
  
  // 学期选项
  { type: 'theclass', value: '1', label: '上学期', sort_order: 1 },
  { type: 'theclass', value: '2', label: '下学期', sort_order: 2 },
  
  // 单元选项
  { type: 'theunit', value: '1', label: '第1单元', sort_order: 1 },
  { type: 'theunit', value: '2', label: '第2单元', sort_order: 2 },
  { type: 'theunit', value: '3', label: '第3单元', sort_order: 3 },
  { type: 'theunit', value: '4', label: '第4单元', sort_order: 4 },
  { type: 'theunit', value: '5', label: '第5单元', sort_order: 5 },
  { type: 'theunit', value: '6', label: '第6单元', sort_order: 6 },
  { type: 'theunit', value: '7', label: '第7单元', sort_order: 7 },
  { type: 'theunit', value: '8', label: '第8单元', sort_order: 8 },
  { type: 'theunit', value: '9', label: '第9单元', sort_order: 9 },
  { type: 'theunit', value: '10', label: '第10单元', sort_order: 10 },
  
  // 掌握状态选项
  { type: 'ok', value: '0', label: '未掌握', sort_order: 1 },
  { type: 'ok', value: '1', label: '已掌握', sort_order: 2 },
];

async function seedChoiceTable() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  
  // 创建choicetable表
  await sql`
    CREATE TABLE IF NOT EXISTS choicetable (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      type VARCHAR(50) NOT NULL,
      value VARCHAR(50) NOT NULL,
      label VARCHAR(100) NOT NULL,
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 创建索引以提高查询性能
  await sql`
    CREATE INDEX IF NOT EXISTS idx_choicetable_type ON choicetable(type);
  `;
  
  await sql`
    CREATE INDEX IF NOT EXISTS idx_choicetable_type_active ON choicetable(type, is_active);
  `;

  // 插入种子数据
  const insertedChoices = await Promise.all(
    choiceData.map(
      (choice) => sql`
        INSERT INTO choicetable (type, value, label, sort_order)
        VALUES (${choice.type}, ${choice.value}, ${choice.label}, ${choice.sort_order})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedChoices;
}

export async function GET() {
  try {
    await seedChoiceTable();
    return NextResponse.json({ 
      message: 'Choice table seeded successfully',
      data: choiceData 
    });
  } catch (error: any) {
    console.error('Error seeding choice table:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}