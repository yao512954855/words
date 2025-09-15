import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  // 自定义认证页面
  pages: {
    signIn: '/login',// 指定登录页面路径，未登录用户会被重定向到这里
  },
   // 权限验证回调函数（核心）
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;// 判断用户是否已登录
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');// 判断是否访问 dashboard 页面
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        // 重定向到 dashboard
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      // 未登录用户访问公开页面（如首页），允许访问
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;


// 定义登录页面路由
// 通过 authorized 回调实现权限控制逻辑，决定用户是否有权访问某个页面
// 是整个认证系统的基础配置蓝图