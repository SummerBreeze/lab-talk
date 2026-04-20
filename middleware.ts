import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('session')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/register');
  const isApiAuth = request.nextUrl.pathname.startsWith('/api/auth');

  // 如果是 API 认证路由，直接放行
  if (isApiAuth) {
    return NextResponse.next();
  }

  // 验证 session 是否有效
  let isValidSession = false;
  if (sessionToken) {
    try {
      await jwtVerify(sessionToken, secret);
      isValidSession = true;
    } catch (error) {
      // Session 无效，清除 cookie
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      if (!isAuthPage && request.nextUrl.pathname !== '/') {
        return response;
      }
    }
  }

  // 如果没有有效 session 且不是认证页面，重定向到登录
  if (!isValidSession && !isAuthPage && request.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 如果有有效 session 且在认证页面，重定向到 dashboard
  if (isValidSession && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)',
  ],
};
