import { NextRequest,NextResponse } from "next/server";
import { appointmentSchema } from "@/lib/validation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAvailableSlots } from "@/lib/availability";
import { localDateTimeToUtc } from "@/lib/time";
import { createAppointmentEvent,getCalendarConnection } from "@/lib/google-calendar";
export const runtime="nodejs";
export async function POST(request:NextRequest) {
 const parsed=appointmentSchema.safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({error:"Verifique os campos do formulário.",details:parsed.error.flatten()},{status:400});
 const input=parsed.data;
 try {
  const slots=await getAvailableSlots(input.date,input.serviceId);
  if(!slots.some(slot=>slot.time===input.time))return NextResponse.json({error:"Este horário já não está disponível. Atualize a disponibilidade e escolha outro horário."},{status:409});
  const start=localDateTimeToUtc(input.date,input.time);const db=createSupabaseAdminClient();
  const {data,error}=await db.rpc("create_public_appointment",{
   p_name:input.name,p_phone:input.phone,p_email:input.email||null,p_registration:input.registration||null,
   p_make:input.make||null,p_model:input.model||null,p_year:input.year||null,
   p_service_id:input.serviceId,p_start_at:start.toISOString(),p_notes:input.notes||null
  });
  if(error) {
   const message=error.message||"";
   if(message.includes("SLOT_UNAVAILABLE"))return NextResponse.json({error:"Este horário acabou de ser reservado. Escolha outro."},{status:409});
   if(message.includes("DATE_IN_PAST"))return NextResponse.json({error:"Não é possível solicitar uma marcação no passado."},{status:400});
   if(message.includes("SERVICE_UNAVAILABLE"))return NextResponse.json({error:"Este serviço não está disponível para marcação."},{status:400});
   throw error;
  }
  const appointment=data as any;const appointmentId=appointment?.id;
  if(!appointmentId)throw new Error("A base de dados não devolveu o identificador da marcação.");
  await db.from("appointments").update({privacy_accepted_at:new Date().toISOString(),privacy_policy_version:"2026-10-30"}).eq("id",appointmentId);
  const {data:detail}=await db.from("appointments").select("id,start_at,end_at,status,notes,customers(name,phone),services(name),vehicles(registration,make,model)").eq("id",appointmentId).single();
  let syncStatus="not_configured";let message="A marcação foi guardada. O Google Calendar ainda não está ligado.";
  try {
   const connection=await getCalendarConnection();
   if(connection&&detail) {
    const customer=Array.isArray(detail.customers)?detail.customers[0]:detail.customers;
    const service=Array.isArray(detail.services)?detail.services[0]:detail.services;
    const vehicle=Array.isArray(detail.vehicles)?detail.vehicles[0]:detail.vehicles;
    const created=await createAppointmentEvent({
     id:detail.id,startAt:detail.start_at,endAt:detail.end_at,status:detail.status,notes:detail.notes,
     customerName:customer?.name||input.name,phone:customer?.phone||input.phone,serviceName:service?.name||"Serviço automóvel",
     registration:vehicle?.registration,make:vehicle?.make,model:vehicle?.model
    });
    if(created.eventId) {
     await db.from("appointments").update({google_event_id:created.eventId,google_sync_status:"synced",google_sync_error:null}).eq("id",appointmentId);
     syncStatus="synced";message="O pedido foi registado e adicionado ao Google Calendar.";
    } else {
     syncStatus="failed";message="O pedido foi guardado, mas não foi possível criar o evento no calendário.";
     await db.from("appointments").update({google_sync_status:"failed",google_sync_error:"A API Google não devolveu o identificador do evento."}).eq("id",appointmentId);
    }
   }
  } catch(syncError) {
   console.error("google_calendar_create",syncError);
   syncStatus="failed";message="O pedido foi guardado. A sincronização com o Google Calendar precisa de ser repetida pela oficina.";
   await db.from("appointments").update({google_sync_status:"failed",google_sync_error:"Falha ao criar evento no Google Calendar."}).eq("id",appointmentId);
  }
  return NextResponse.json({ok:true,appointmentId,status:"pending",googleSyncStatus:syncStatus,message},{status:201});
 } catch(error) {
  console.error("appointment_create",error);
  return NextResponse.json({error:"Não foi possível registar a marcação. Tente novamente ou contacte a oficina."},{status:503});
 }
}