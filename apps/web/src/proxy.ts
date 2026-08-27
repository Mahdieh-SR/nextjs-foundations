import { type NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  // biome-ignore lint/suspicious/noConsole: request logging is what this proxy is for
  console.log(`[Proxy] ${request.method} ${request.nextUrl.pathname}`);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', crypto.randomUUID());
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set(
    'X-Request-Id',
    requestHeaders.get('x-request-id') || ''
  );

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
