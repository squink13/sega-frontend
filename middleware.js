import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const validIds = [
  114017, 5426640, 10137131, 7119659, 14041375, 10659233, 6017901, 2200982, 11706972, 9362168, 1429071, 17467899,
  7640581, 12090610, 14806365, 11371245, 12058601,
];

const adminIds = [12058601];

export default withAuth(
  function middleware(req) {
    console.log("middleware req: ", req.nextauth.token?.osu_id);
    if (req.nextUrl.pathname === "/draft" && !validIds.includes(req.nextauth.token?.osu_id)) {
      return new NextResponse("You are not authorized to access this page.", { status: 403 });
    }
    if (req.nextUrl.pathname === "/admin" && !adminIds.includes(req.nextauth.token?.osu_id)) {
      return new NextResponse("You are not authorized to access this page.", { status: 403 });
    }
  },
  {
    callbacks: {
      authorized: (params) => {
        let { token } = params;
        return !!token;
      },
    },
  }
);

export const config = { matcher: ["/register", "/draft", "/admin"] };
