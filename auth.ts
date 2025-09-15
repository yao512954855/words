import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';// 账号密码认证方式
import { authConfig } from './auth.config';
import { z } from 'zod';// 数据验证
import type { User } from '@/app/lib/definitions';// 用户类型定义
import bcrypt from 'bcryptjs';// 密码加密/比对库
import postgres from 'postgres';

 
const sql = postgres(process.env.POSTGRES_URL!);
 
async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
    return user[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
 
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,// 继承代码auth.config.ts中的基础配置
  providers: [
    // 添加 "账号密码" 认证方式
    Credentials({
      async authorize(credentials) {
        // 验证输入的邮箱和密码格式
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);
 
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);// 查询数据库中的用户 
          if (!user) return null;// 用户不存在，认证失败
           // 比对输入密码与数据库中存储的加密密码
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;// 密码匹配，返回用户信息（认证成功）
        }
        console.log('Invalid credentials');
 
        return null;// 格式验证失败或密码不匹配，认证失败
      },
    }),
  ],
});


// 引入 Credentials provider，支持账号密码登录
// 实现用户查询（从 PostgreSQL 数据库）和密码验证（使用 bcrypt）
// 导出 auth（获取当前用户信息）、signIn（登录方法）、signOut（登出方法）供页面调用