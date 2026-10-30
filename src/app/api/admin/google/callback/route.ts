import { NextRequest,NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminContext } from "@/lib/auth";
import { encryptToken,googleOAuth } from "@/lib/google-calendar";
export const runtime="nodejs";
export async function GET(request:NextRequest) {
 const cookieStore=await cookies();const expected=cookieStore.get("google_oauth_state")?.value;
 const received=request.nextUrl.searchParams.get("state");const code=request.nextUrl.searchParams.get("code");
 cookieStore.delete("google_oauth_state");
 if(!expected||!received||expected!==received||!code)return NextResponse.redirect(new URL("/admin?google=error",request.url));
 try {
  const admin=await getAdminContext();if(!admin)return NextResponse.redirect(new URL("/admin/login",request.url));
  const oauth=googleOAuth();const {tokens}=await oauth.getToken(code);
  if(!tokens.refresh_token)throw new Error("O Google não devolveu refresh token. Desligue a aplicação nas permissões Google e tente ligar novamente.");
  const db=createSupabaseAdminClient();
  const {error}=await db.from("google_calendar_connections").upsert({id:1,calendar_id:process.env.GOOGLE_CALENDAR_ID||"primary",encrypted_refresh_token:encryptToken(tokens.refresh_token),connected_at:new Date().toISOString()},{onConflict:"id"});
  if(error)throw error;
  return NextResponse.redirect(new URL("/admin?google=connected",request.url));
 } catch(error) {
  console.error("google_callback",error);return NextResponse.redirect(new URL("/admin?google=error",request.url));
 }
}