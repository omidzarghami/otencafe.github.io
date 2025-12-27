import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // بررسی authentication برای routes مربوط به admin
  if (pathname.startsWith("/admin/dashboard")) {
    const token = request.cookies.get("admin_token");
    
    if (token?.value !== "authenticated") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*"],
};

