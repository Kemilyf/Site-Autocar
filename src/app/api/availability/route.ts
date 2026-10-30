import { NextRequest,NextResponse } from "next/server";
import { z } from "zod";
import { getAvailableSlots } from "@/lib/availability";
export const runtime="nodejs";
const schema=z.object({date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),serviceId:z.string().uuid()});
export async function GET(request:NextRequest) {
  const parsed=schema.safeParse({date:request.nextUrl.searchParams.get("date"),serviceId:request.nextUrl.searchParams.get("serviceId")});
  if(!parsed.success) return NextResponse.json({error:"Data ou serviço inválido."},{status:400});
  try { return NextResponse.json({slots:await getAvailableSlots(parsed.data.date,parsed.data.serviceId)}); }
  catch(error) {
    console.error("availability_get",error);
    return NextResponse.json({error:"Não foi possível consultar a agenda. Tente novamente mais tarde."},{status:503});
  }
}