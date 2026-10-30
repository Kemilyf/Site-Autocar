import { NextRequest,NextResponse } from "next/server";
import { serviceAdminSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/auth";
export const runtime="nodejs";
export async function PATCH(request:NextRequest,{params}:{params:Promise<{id:string}>}) {
  try {
    const {db}=await requireAdmin();const {id}=await params;
    const parsed=serviceAdminSchema.safeParse(await request.json().catch(()=>null));
    if(!parsed.success) return NextResponse.json({error:"Dados do serviço inválidos."},{status:400});
    const {priceMode,basePrice,durationMinutes,active,vatRate,priceIncludesVat}=parsed.data;
    const {data,error}=await db.from("services").update({
      price_mode:priceMode,base_price:priceMode==="quote"?null:basePrice,
      duration_minutes:durationMinutes,active,vat_rate:vatRate,price_includes_vat:priceIncludesVat
    }).eq("id",id).select("id,name,price_mode,base_price,duration_minutes,active,vat_rate,price_includes_vat").single();
    if(error) throw error;
    return NextResponse.json({service:data});
  } catch(error) {
    if(error instanceof Error&&error.message==="UNAUTHORIZED") return NextResponse.json({error:"Não autorizado."},{status:401});
    console.error("admin_service_update",error);
    return NextResponse.json({error:"Não foi possível atualizar o serviço."},{status:500});
  }
}