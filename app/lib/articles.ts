'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import postgres from 'postgres';
import { auth } from '@/auth';

const sql = postgres(process.env.POSTGRES_URL!);

// 保存生成的文章到数据库
export async function saveArticle(article: {
  title: string;
  english: string;
  chinese: string;
  words: { word: string; phonetic: string }[];
  style: string;
  difficulty: string;
  version?: string;
  grade?: string;
  theclass?: string;
  theunit?: string;
}) {
  try {
    // 获取当前用户信息
    const session = await auth();
    const userId = session?.user?.email || 'anonymous';
    
    // 1. 保存文章基本信息
    const [articleResult] = await sql`
      INSERT INTO articles (
        user_id, 
        title, 
        english_content, 
        chinese_content, 
        style, 
        difficulty,
        version,
        grade,
        theclass,
        theunit,
        created_at
      ) 
      VALUES (
        ${userId}, 
        ${article.title || '未命名文章'}, 
        ${article.english}, 
        ${article.chinese}, 
        ${article.style}, 
        ${article.difficulty},
        ${article.version || null},
        ${article.grade || null},
        ${article.theclass || null},
        ${article.theunit || null},
        NOW()
      )
      RETURNING id
    `;
    
    const articleId = articleResult.id;
    
    // 2. 保存文章中的单词
    if (article.words && article.words.length > 0) {
      for (const wordItem of article.words) {
        await sql`
          INSERT INTO article_words (
            article_id, 
            word, 
            phonetic
          ) 
          VALUES (
            ${articleId}, 
            ${wordItem.word}, 
            ${wordItem.phonetic || null}
          )
        `;
      }
    }
    
    return { success: true, articleId };
  } catch (error) {
    console.error('保存文章失败:', error);
    return { success: false, error: '保存文章失败' };
  }
}

// 获取用户的文章列表
export async function getUserArticles(userId: string, limit = 50, offset = 0) {
  try {
    const articles = await sql`
      SELECT 
        id, 
        title, 
        style, 
        difficulty, 
        version,
        grade,
        theclass,
        theunit,
        created_at
      FROM articles
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    return articles;
  } catch (error) {
    console.error('获取文章列表失败:', error);
    return [];
  }
}

// 获取文章详情
export async function getArticleById(articleId: string, userId: string) {
  try {
    
    // 1. 获取文章基本信息
    const [article] = await sql`
      SELECT 
        id, 
        title, 
        english_content as english, 
        chinese_content as chinese, 
        style, 
        difficulty,
        version,
        grade,
        theclass,
        theunit,
        created_at
      FROM articles
      WHERE id = ${articleId} AND user_id = ${userId}
    `;
    
    if (!article) {
      return null;
    }
    
    // 2. 获取文章中的单词
    const words = await sql`
      SELECT 
        word, 
        phonetic
      FROM article_words
      WHERE article_id = ${articleId}
      ORDER BY id ASC
    `;
    
    return {
      ...article,
      words
    };
  } catch (error) {
    console.error('获取文章详情失败:', error);
    return null;
  }
}