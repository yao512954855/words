import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!);

export async function POST(request: NextRequest) {
  try {
    const { word } = await request.json();
    
    if (!word) {
      return NextResponse.json(
        { error: '请提供要翻译的单词' },
        { status: 400 }
      );
    }

    // 转换为小写进行查找
    const lowerWord = word.toLowerCase();
    
    // 从数据库查询翻译
    const result = await sql`
      SELECT chinese_translation 
      FROM word_translations 
      WHERE LOWER(word_text) = ${lowerWord}
      LIMIT 1;
    `;

    if (result.length > 0) {
      return NextResponse.json({
        word: word,
        translation: result[0].chinese_translation,
        success: true
      });
    } else {
      return NextResponse.json({
        word: word,
        translation: null,
        success: false,
        message: '暂无翻译'
      });
    }
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: '翻译服务出错' },
      { status: 500 }
    );
  }
}