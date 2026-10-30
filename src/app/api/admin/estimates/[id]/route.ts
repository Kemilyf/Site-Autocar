import { NextRequest,NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
export const runtime="nodejs";
const schema=z.object({
  status:z.enum(["under_review","sent","accepted","rejected","cancelled"]),
  workshopQuote:z.number().min(0).max(100000).nullable().optional(),
  note:z.string().max(1000).optional()
});
export async function PATCH(request:NextRequest,{params}:{params:Promise<{id:string}>}) {
  try {
    const {db,profile}=await requireAdmin();const {id}=await params;
    const parsed=schema.safeParse(await request.json().catch(()=>null));
    if(!parsed.success) return NextResponse.json({error:"Dados do orçamento inválidos."},{status:400});
    const {data:before,error:readError}=await db.from("estimates").select("id,status").eq("id",id).single();
    if(readError||!before) return NextResponse.json({error:"Pedido não encontrado."},{status:404});
    if(parsed.data.status==="sent"&&parsed.data.workshopQuote===undefined) return NextResponse.json({error:"Informe o valor proposto pela oficina antes de marcar como enviado."},{status:400});
    const update:any={status:parsed.data.status};
    if(parsed.data.workshopQuote!==undefined) update.workshop_quote=parsed.data.workshopQuote;
    const {error}=await db.from("estimates").update(update).eq("id",id);
    if(error) throw error;
    await db.from("estimate_history").insert({estimate_id:id,old_status:before.status,new_status:parsed.data.status,changed_by:profile.id,note:parsed.data.note||null});
    return NextResponse.json({ok:true});
  } catch(error) {
    if(error instanceof Error&&error.message==="UNAUTHORIZED") return NextResponse.json({error:"Não autorizado."},{status:401});
    console.error("admin_estimate_update",error);
    return NextResponse.json({error:"Não foi possível atualizar o pedido."},{status:500});
  }
}