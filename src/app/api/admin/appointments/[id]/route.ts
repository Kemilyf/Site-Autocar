import { NextRequest,NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAppointmentEvent,deleteAppointmentEvent,updateAppointmentEvent } from "@/lib/google-calendar";
export const runtime="nodejs";
const schema=z.object({status:z.enum(["confirmed","rejected","cancelled","in_progress","completed"]),note:z.string().max(1000).optional()});
export async function PATCH(request:NextRequest,{params}:{params:Promise<{id:string}>}) {
 try {
  const {db,profile}=await requireAdmin();const {id}=await params;
  const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Estado inválido."},{status:400});
  const {data:before,error:readError}=await db.from("appointments").select("*,customers(name,phone),services(name),vehicles(registration,make,model)").eq("id",id).single();
  if(readError||!before)return NextResponse.json({error:"Marcação não encontrada."},{status:404});
  if(["cancelled","rejected","completed"].includes(before.status))return NextResponse.json({error:"Esta marcação já está encerrada."},{status:409});
  const {status,note}=parsed.data;const {error:updateError}=await db.from("appointments").update({status}).eq("id",id);if(updateError)throw updateError;
  await db.from("appointment_history").insert({appointment_id:id,old_status:before.status,new_status:status,changed_by:profile.id,note:note||null});
  const customer=Array.isArray(before.customers)?before.customers[0]:before.customers;
  const service=Array.isArray(before.services)?before.services[0]:before.services;
  const vehicle=Array.isArray(before.vehicles)?before.vehicles[0]:before.vehicles;
  let syncStatus=before.google_sync_status;let syncError:string|null=null;
  try {
   if(status==="cancelled"||status==="rejected") {
    if(before.google_event_id) {
     const removed=await deleteAppointmentEvent(before.google_event_id);
     if(!removed)syncStatus="not_configured";else syncStatus="synced";
    } else syncStatus="not_configured";
   } else {
    const payload={id:before.id,startAt:before.start_at,endAt:before.end_at,notes:before.notes,customerName:customer?.name||"Cliente",phone:customer?.phone||"",serviceName:service?.name||"Serviço automóvel",registration:vehicle?.registration,make:vehicle?.make,model:vehicle?.model};
    if(before.google_event_id) {
     const updated=await updateAppointmentEvent(before.google_event_id,status,payload);
     if(!updated)syncStatus="not_configured";else syncStatus="synced";
    } else {
     const created=await createAppointmentEvent({...payload,status});
     if(created.eventId){await db.from("appointments").update({google_event_id:created.eventId}).eq("id",id);syncStatus="synced";}
     else syncStatus="not_configured";
    }
   }
  } catch(error){console.error("admin_appointment_google_sync",error);syncStatus="failed";syncError="Não foi possível sincronizar a alteração com o Google Calendar.";}
  await db.from("appointments").update({google_sync_status:syncStatus,google_sync_error:syncError}).eq("id",id);
  return NextResponse.json({ok:true,status,googleSyncStatus:syncStatus});
 } catch(error) {
  if(error instanceof Error&&error.message==="UNAUTHORIZED")return NextResponse.json({error:"Não autorizado."},{status:401});
  console.error("admin_appointment_update",error);return NextResponse.json({error:"Não foi possível atualizar a marcação."},{status:500});
 }
}