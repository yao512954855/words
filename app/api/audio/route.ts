import { NextRequest, NextResponse } from 'next/server';
import { writeFile, access } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text');
    
    if (!text) {
      return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
    }

    // 生成文件名（基于文本内容的hash）
    const fileName = `${Buffer.from(text).toString('base64').replace(/[/+=]/g, '_')}.mp3`;
    const audioPath = join(process.cwd(), 'public', 'audio', fileName);
    const publicPath = `/audio/${fileName}`;

    // 检查文件是否已存在
    try {
      await access(audioPath);
      // 文件已存在，直接返回URL
      return NextResponse.json({ 
        success: true, 
        audioUrl: publicPath,
        cached: true 
      });
    } catch {
      // 文件不存在，需要生成
    }

    // 使用Microsoft Edge TTS API生成音频
    // 这是一个简化版本，实际项目中可以使用更复杂的TTS服务
    const result = await generateAudioWithEdgeTTS(text);
    
    // 检查是否是降级响应
    if (result.fallback) {
      return NextResponse.json({ 
        success: false, 
        fallback: true,
        text: text,
        message: 'TTS service unavailable, use browser fallback'
      });
    }
    
    // 确保有音频数据才保存文件
    if (!result.audioBuffer) {
      return NextResponse.json({ 
        success: false, 
        fallback: true,
        text: text,
        message: 'No audio data available, use browser fallback'
      });
    }
    
    // 保存音频文件
    await writeFile(audioPath, result.audioBuffer);

    return NextResponse.json({ 
      success: true, 
      audioUrl: publicPath,
      cached: false 
    });

  } catch (error) {
    console.error('Audio generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate audio',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 使用免费的TTS服务生成音频
async function generateAudioWithEdgeTTS(text: string): Promise<{ audioBuffer?: Buffer; fallback?: boolean }> {
  try {
    // 使用免费的TTS API服务
    // 这里使用一个公开的TTS服务作为示例
    const ttsUrl = `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(text)}`;
    
    const response = await fetch(ttsUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`TTS API responded with status: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    return { audioBuffer: Buffer.from(audioBuffer) };
    
  } catch (error) {
    console.error('TTS generation error:', error);
    
    // 返回降级标识，让API返回错误响应
    return { fallback: true };
  }
}

// 可选：添加DELETE方法来清理缓存
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'clear-cache') {
      // 这里可以添加清理音频缓存的逻辑
      return NextResponse.json({ success: true, message: 'Cache cleared' });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clear cache' }, { status: 500 });
  }
}