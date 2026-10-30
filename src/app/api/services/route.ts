import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
export const runtime = "nodejs";
export async function GET() {
  try {
    const db=createSupabaseAdminClient();
    const {data,error}=await db.from("services").select("id,name,slug,description,category,duration_minutes,price_mode,base_price,price_includes_vat,vat_rate").eq("active",true).order("name");
    if(error) throw error;
    return NextResponse.json({services:data||[]});
  } catch(error) {
    console.error("services_get",error);
    return NextResponse.json({error:"Não foi possível carregar os serviços."},{status:503});
  }
}