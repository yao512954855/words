/**
 * 火山引擎大模型API调用服务
 */

// 火山引擎API配置
const VOLC_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const VOLC_MODEL = 'ep-20250313151420-wk4f2';

// 从环境变量获取API密钥
const getApiKey = () => {
  const apiKey = process.env.VOLC_API_KEY;
  if (!apiKey) {
    throw new Error('未配置火山引擎API密钥(VOLC_API_KEY)');
  }
  return apiKey;
};

// 消息类型定义
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// 请求参数类型
export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
}

// 响应类型
export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * 调用火山引擎大模型API
 * @param messages 对话消息列表
 * @param options 可选参数
 * @returns 大模型响应
 */
export async function callVolcEngine(
  messages: ChatMessage[],
  options: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
  } = {}
): Promise<ChatCompletionResponse> {
  try {
    const apiKey = getApiKey();
    
    const requestBody: ChatCompletionRequest = {
      model: VOLC_MODEL,
      messages,
      ...options
    };
    
    console.log('调用火山引擎API，请求参数:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(VOLC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('火山引擎API调用失败:', response.status, errorText);
      throw new Error(`火山引擎API调用失败: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('火山引擎API响应:', JSON.stringify(data, null, 2));
    
    return data as ChatCompletionResponse;
  } catch (error) {
    console.error('调用火山引擎API出错:', error);
    throw error;
  }
}