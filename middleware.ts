import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
 
// 基于 authConfig 创建中间件
export default NextAuth(authConfig).auth;
 // 中间件配置
export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  // 匹配所有需要拦截的路由（排除 API、静态资源、图片等）
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
  runtime: 'nodejs',// 指定运行时环境
};


// 核心作用：
// 拦截符合 matcher 规则的所有请求（几乎所有页面请求）
// 在请求到达页面之前执行代码一中的 authorized 回调，验证用户权限
// 实现自动重定向（未登录用户访问受保护页面 → 登录页；已登录用户访问登录页 → dashboard）

// 整体运作流程
// 用户访问页面：
// 当用户访问任何页面时，代码middleware.ts中间件会先拦截请求。
// 权限验证：
// 中间件调用代码一中的 authorized 回调，判断用户是否登录以及是否有权访问目标页面：
// 未登录用户访问 /dashboard → 被重定向到 /login
// 已登录用户访问 /login → 被重定向到 /dashboard
// 未登录用户访问公开页面（如首页）→ 允许访问
// 已登录用户访问 /dashboard → 允许访问

// 登录流程：
// 用户在 /login 页面输入账号密码，调用代码二中的 signIn 方法
// signIn 触发 Credentials provider 的 authorize 函数：
// 验证邮箱密码格式 → 查询数据库用户 → 比对密码
// 验证成功 → 生成会话（session）→ 重定向到 /dashboard
// 验证失败 → 停留在登录页并提示错误

// 登出流程：
// 用户点击登出按钮，调用 signOut 方法 → 清除会话 → 重定向到登录页
// 总结
// 这三段代码协同工作，实现了一个完整的认证系统：

// 代码一提供基础配置和权限规则
// 代码二实现具体的登录验证逻辑（数据库查询、密码比对）
// 代码三通过中间件在全局拦截请求，强制执行权限规则