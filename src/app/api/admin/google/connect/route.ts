import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { requireAdmin } from "@/lib/auth";
import { googleOAuth } from "@/lib/google-calendar";
export const runtime="nodejs";
export async function GET() {
  try {
    await requireAdmin();
    const state=randomBytes(24).toString("hex");
    const cookieStore=await cookies();
    cookieStore.set("google_oauth_state",state,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:600});
    const oauth=googleOAuth();
    const url=oauth.generateAuthUrl({
      access_type:"offline",prompt:"consent",state,
      scope:["https://www.googleapis.com/auth/calendar.events"]
    });
    return NextResponse.redirect(url);
  } catch(error) {
    if(error instanceof Error&&error.message==="UNAUTHORIZED") return NextResponse.json({error:"Não autorizado."},{status:401});
    console.error("google_connect",error);
    return NextResponse.json({error:"Não foi possível iniciar a ligação ao Google. Verifique as credenciais OAuth."},{status:500});
  }
}