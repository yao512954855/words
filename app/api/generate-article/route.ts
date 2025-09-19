import { NextRequest, NextResponse } from 'next/server';
import { callVolcEngine, ChatMessage } from '@/app/lib/volc-engine';

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    const { style, difficulty, wordCount, filteredWords } = body;
    
    // 验证请求参数
    if (!style || !difficulty || !wordCount || !filteredWords) {
      return NextResponse.json(
        { error: '请求参数错误: 缺少必要参数' },
        { status: 400 }
      );
    }
    
    // 构建提示词
    const prompt = `
      请生成一篇${getStyleInChinese(style)}风格的英语阅读文章，难度为${getDifficultyInChinese(difficulty)}，
      字数大约${wordCount}字。文章中必须包含以下单词：${filteredWords.join(', ')}。
      
      请按照以下格式返回：
      1. 英文文章（包含标题）
      2. 中文翻译（包含标题）
      3. 文章中出现的所有单词及其音标
      
      返回格式为JSON：
      {
        "english": "英文文章内容",
        "chinese": "中文翻译",
        "words": [
          {"word": "单词1", "phonetic": "音标1"},
          {"word": "单词2", "phonetic": "音标2"}
        ]
      }
    `;
    
    console.log('使用筛选的单词生成文章:', filteredWords);
    
    // 调用火山引擎API
    const messages: ChatMessage[] = [{ role: 'user', content: prompt }];
    const response = await callVolcEngine(messages, {
      temperature: 0.7,
      max_tokens: 2000
    });
    
    // 解析返回的内容
    const content = response.choices[0]?.message?.content || '';
    
    // 尝试从内容中提取JSON
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                      content.match(/{[\s\S]*}/);
    
    if (jsonMatch) {
      try {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const result = JSON.parse(jsonStr);
        return NextResponse.json(result);
      } catch (e) {
        console.error('解析JSON失败:', e);
        return NextResponse.json(
          { error: '无法解析生成的文章' },
          { status: 500 }
        );
      }
    }
    
    // 如果没有找到JSON格式，返回一个基本结构
    return NextResponse.json({
      english: '无法生成文章，请重试。',
      chinese: '无法生成文章，请重试。',
      words: []
    });
  } catch (error: any) {
    console.error('生成文章失败:', error);
    return NextResponse.json(
      { error: `生成文章失败: ${error.message}` },
      { status: 500 }
    );
  }
}

function getStyleInChinese(style: string): string {
  const styleMap: Record<string, string> = {
    'informative': '信息类',
    'narrative': '叙事类',
    'descriptive': '描述类',
    'persuasive': '说服类',
    'story': '故事类'
  };
  return styleMap[style] || '信息类';
}

function getDifficultyInChinese(difficulty: string): string {
  const difficultyMap: Record<string, string> = {
    'beginner': '初级',
    'intermediate': '中级',
    'advanced': '高级'
  };
  return difficultyMap[difficulty] || '中级';
}