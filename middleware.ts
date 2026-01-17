import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const adminToken = req.cookies.get("admin_token")?.value;
  const sellerToken = req.cookies.get("seller_token")?.value;
  const pathname = req.nextUrl.pathname;

  // ==================== ADMIN ROUTES ====================
  const adminRoutes = [
    "/dashboard",
    "/categories",
    "/product-types",
    "/product-subtypes",
    "/products",
    "/admin"
  ];

  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  if (isAdminRoute) {
    // Not logged in as admin → redirect to admin login
    if (!adminToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // Logged in as admin → allow access
    return NextResponse.next();
  }

  // ==================== SELLER ROUTES ====================
  const isAuthPage = pathname.startsWith("/auth");
  const isSellerPage = pathname.startsWith("/seller");

  if (isSellerPage) {
    // Not logged in as seller → redirect to seller login
    if (!sellerToken) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    // Logged in as seller → allow access
    return NextResponse.next();
  }

  if (isAuthPage) {
    // Already logged in as seller → redirect to onboarding
    if (sellerToken) {
      return NextResponse.redirect(new URL("/seller/onboarding", req.url));
    }
    // Not logged in → allow access to auth pages
    return NextResponse.next();
  }

  // ==================== OTHER ROUTES ====================
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Admin routes
    "/dashboard/:path*",
    "/categories/:path*",
    "/product-types/:path*",
    "/product-subtypes/:path*",
    "/products/:path*",
    "/admin/:path*",
    
    // Seller routes
    "/seller/:path*",
    "/auth/:path*",
  ],
};