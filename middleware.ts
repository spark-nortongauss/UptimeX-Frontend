import createMiddleware from 'next-intl/middleware';
import {NextRequest, NextResponse} from 'next/server';
import {locales} from '@/config';

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for root path to show landing page
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Step 1: Use the incoming request (example)
  const defaultLocale = request.headers.get('dashcode-locale') || 'en';
 
  // Step 2: Create and call the next-intl middleware (example)
  const handleI18nRouting = createMiddleware({
    locales,
    defaultLocale
    
  });
  const response = handleI18nRouting(request);
 
  // Step 3: Alter the response (example)
  response.headers.set('dashcode-locale', defaultLocale);

 
  return response;
}
 
export const config = {
  // Match only internationalized pathnames, exclude root
  matcher: ['/(ar|en)/:path*']
};