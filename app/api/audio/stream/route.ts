import { NextRequest, NextResponse } from 'next/server';
import { readFile, access } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text');
    
    if (!text) {
      return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
    }

    // 生成文件名（与主API保持一致）
    const fileName = `${Buffer.from(text).toString('base64').replace(/[/+=]/g, '_')}.mp3`;
    const audioPath = join(process.cwd(), 'public', 'audio', fileName);

    // 检查文件是否存在
    try {
      await access(audioPath);
    } catch {
      return NextResponse.json({ error: 'Audio file not found' }, { status: 404 });
    }

    // 读取音频文件
    const audioBuffer = await readFile(audioPath);
    
    // 设置正确的响应头以支持移动端播放
    const headers = new Headers();
    headers.set('Content-Type', 'audio/mpeg');
    headers.set('Content-Length', audioBuffer.length.toString());
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=31536000'); // 缓存1年
    headers.set('Content-Disposition', 'inline'); // 确保内联播放而不是下载
    
    // 支持Range请求（对移动端很重要）
    const range = request.headers.get('range');
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : audioBuffer.length - 1;
      const chunksize = (end - start) + 1;
      const chunk = audioBuffer.slice(start, end + 1);
      
      headers.set('Content-Range', `bytes ${start}-${end}/${audioBuffer.length}`);
      headers.set('Content-Length', chunksize.toString());
      
      return new NextResponse(chunk, {
        status: 206, // Partial Content
        headers
      });
    }
    
    // 返回完整音频文件
    return new NextResponse(audioBuffer, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Audio streaming error:', error);
    return NextResponse.json({ 
      error: 'Failed to stream audio',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}