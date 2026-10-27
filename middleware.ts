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

  // Check NextAuth v5 and NextAuth v4 cookie names across all supported secret keys
  const secrets = Array.from(
    new Set([process.env.AUTH_SECRET, process.env.NEXTAUTH_SECRET].filter(Boolean) as string[])
  );

  let token = null;
  for (const secret of secrets) {
    if (token) break;
    token = await getToken({
      req,
      secret,
      cookieName: secureCookie ? "__Secure-authjs.session-token" : "authjs.session-token",
      salt: secureCookie ? "__Secure-authjs.session-token" : "authjs.session-token",
      secureCookie,
    });

    if (!token) {
      token = await getToken({
        req,
        secret,
        cookieName: secureCookie ? "__Secure-next-auth.session-token" : "next-auth.session-token",
        secureCookie,
      });
    }

    if (!token) {
      token = await getToken({
        req,
        secret,
      });
    }
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const isCoachRoute = pathname.startsWith("/coach");
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
      if (token.role === "COACH") {
        return NextResponse.redirect(new URL("/coach/dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (isCoachRoute) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }

    if (token.isBlocked) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("error", "BlockedAccount");
      return NextResponse.redirect(loginUrl);
    }

    if (token.role !== "COACH" && token.role !== "ADMIN" && token.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (isProtectedUserRoute) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (token.isBlocked) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("error", "BlockedAccount");
      return NextResponse.redirect(loginUrl);
    }

    // Mandatory Unverified Student Restriction
    if (token.role === "STUDENT" && Boolean((token as { emailVerified?: boolean }).emailVerified) === false) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("error", "EMAIL_NOT_VERIFIED");
      return NextResponse.redirect(loginUrl);
    }

    // Automatic Role Routing: Redirect Admin users from student dashboard to Admin Dashboard
    if ((token.role === "ADMIN" || token.role === "SUPER_ADMIN") && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // Automatic Role Routing: Redirect Coach users from student dashboard to Coach Dashboard
    if (token.role === "COACH" && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/coach/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/coach/:path*", "/dashboard/:path*", "/settings/:path*", "/profile/:path*"],
};
