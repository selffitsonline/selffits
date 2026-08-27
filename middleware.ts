import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Exclude auth entry pages from protection to prevent redirect loops
  if (
    pathname === "/admin/login" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/verify-email"
  ) {
    return NextResponse.next();
  }

  const secureCookie = req.url.startsWith("https://") || process.env.NODE_ENV === "production";

  // Check NextAuth v5 and NextAuth v4 cookie names for Vercel HTTPS deployment
  let token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: secureCookie ? "__Secure-authjs.session-token" : "authjs.session-token",
    secureCookie,
  });

  if (!token) {
    token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: secureCookie ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      secureCookie,
    });
  }

  if (!token) {
    token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedUserRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/profile");

  if (isAdminRoute) {
    if (!token) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (token.role !== "ADMIN" && token.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (isProtectedUserRoute) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/settings/:path*", "/profile/:path*"],
};
