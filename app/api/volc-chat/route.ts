import { NextRequest, NextResponse } from 'next/server';
import { callVolcEngine, ChatMessage } from '@/app/lib/volc-engine';

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    const { messages } = body;
    
    // 验证请求参数
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: '请求参数错误: 缺少有效的messages数组' },
        { status: 400 }
      );
    }
    
    // 调用火山引擎API
    const response = await callVolcEngine(messages as ChatMessage[], {
      temperature: body.temperature || 0.7,
      max_tokens: body.max_tokens || 1000
    });
    
    // 返回结果
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('处理火山引擎API请求出错:', error);
    return NextResponse.json(
      { error: `处理请求失败: ${error.message}` },
      { status: 500 }
    );
  }
}