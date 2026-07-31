import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require a session cookie at the edge.
// Full auth + ownership validation still happens inside each route handler.
// The webhook is intentionally excluded — NOWPayments calls it without a session.
const SESSION_REQUIRED = [
  "/api/collections/",
  "/api/subscriptions/checkout",
  "/api/subscriptions/status",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsSession = SESSION_REQUIRED.some((p) => pathname.startsWith(p));

  if (needsSession && !req.cookies.has("agency-session")) {
    return new NextResponse("unauthenticated", { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
