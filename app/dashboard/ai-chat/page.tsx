'use client';

import { useState, useRef, useEffect } from 'react';
import { lusitana } from '@/app/ui/fonts';

// 消息类型定义
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: '你是人工智能助手.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送消息到大模型
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // 添加用户消息
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // 调用API
      const response = await fetch('/api/volc-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 添加AI回复
      if (data.choices && data.choices.length > 0) {
        setMessages(prev => [...prev, data.choices[0].message]);
      } else {
        throw new Error('API返回格式错误');
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      // 添加错误消息
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: '抱歉，发生了错误，请稍后再试。' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理按键事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className={`${lusitana.className} text-2xl mb-6`}>火山引擎AI助手</h1>
      
      {/* 消息列表 */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4 h-[60vh] overflow-y-auto">
        {messages.filter(m => m.role !== 'system').map((message, index) => (
          <div 
            key={index} 
            className={`mb-4 ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div 
              className={`inline-block p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-left mb-4">
            <div className="inline-block p-3 rounded-lg bg-gray-200">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* 输入框 */}
      <div className="flex">
        <textarea
          className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="输入消息..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          disabled={isLoading}
        />
        <button
          className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600 focus:outline-none disabled:bg-blue-300"
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
        >
          发送
        </button>
      </div>
    </div>
  );
}