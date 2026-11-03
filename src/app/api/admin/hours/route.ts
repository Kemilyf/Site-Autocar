import { NextRequest,NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
export const runtime="nodejs";
const timeField=z.union([z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),z.literal("")]).optional().nullable();
const rowSchema=z.object({dayOfWeek:z.number().int().min(0).max(6),isOpen:z.boolean(),openTime:timeField,closeTime:timeField,breakStart:timeField,breakEnd:timeField});
export async function GET() {
  try {const {db}=await requireAdmin();const {data,error}=await db.from("business_hours").select("*").order("day_of_week");if(error)throw error;return NextResponse.json({hours:data||[]});}
  catch(error){if(error instanceof Error&&error.message==="UNAUTHORIZED")return NextResponse.json({error:"Não autorizado."},{status:401});return NextResponse.json({error:"Não foi possível carregar os horários."},{status:500});}
}
export async function PUT(request:NextRequest) {
  try {
    const {db}=await requireAdmin();
    const parsed=z.array(rowSchema).length(7).safeParse(await request.json().catch(()=>null));
    if(!parsed.success)return NextResponse.json({error:"É necessário configurar os sete dias da semana."},{status:400});
    for(const row of parsed.data) if(row.isOpen&&(!row.openTime||!row.closeTime||row.closeTime<=row.openTime)) return NextResponse.json({error:"Verifique a abertura e o fecho de cada dia ativo."},{status:400});
    const rows=parsed.data.map(row=>({day_of_week:row.dayOfWeek,is_open:row.isOpen,open_time:row.isOpen?row.openTime:null,close_time:row.isOpen?row.closeTime:null,break_start:row.isOpen?(row.breakStart||null):null,break_end:row.isOpen?(row.breakEnd||null):null}));
    const {error}=await db.from("business_hours").upsert(rows,{onConflict:"day_of_week"});
    if(error)throw error;return NextResponse.json({ok:true});
  } catch(error){if(error instanceof Error&&error.message==="UNAUTHORIZED")return NextResponse.json({error:"Não autorizado."},{status:401});console.error("admin_hours_save",error);return NextResponse.json({error:"Não foi possível guardar o horário."},{status:500});}
}