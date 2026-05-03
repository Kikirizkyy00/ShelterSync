import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const { tokens } = await oauth2Client.getToken(code);

  const response = NextResponse.redirect(new URL("/", req.url));
  response.cookies.set("google_access_token", tokens.access_token ?? "", {
    httpOnly: true,
    path: "/",
  });

  return response;
}
