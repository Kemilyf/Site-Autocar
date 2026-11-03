import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAppointmentEvent,deleteAppointmentEvent,updateAppointmentEvent } from "@/lib/google-calendar";
export const runtime="nodejs";
export async function POST(_request:Request,{params}:{params:Promise<{id:string}>}) {
 try {
  const {db}=await requireAdmin();const {id}=await params;
  const {data:a,error}=await db.from("appointments").select("*,customers(name,phone),services(name),vehicles(registration,make,model)").eq("id",id).single();
  if(error||!a)return NextResponse.json({error:"Marcação não encontrada."},{status:404});
  try {
   if(["cancelled","rejected"].includes(a.status)) {
    if(a.google_event_id){const removed=await deleteAppointmentEvent(a.google_event_id);if(!removed)throw new Error("Google Calendar não está ligado.");}
   } else {
    const customer=Array.isArray(a.customers)?a.customers[0]:a.customers;const service=Array.isArray(a.services)?a.services[0]:a.services;const vehicle=Array.isArray(a.vehicles)?a.vehicles[0]:a.vehicles;
    const payload={id:a.id,startAt:a.start_at,endAt:a.end_at,status:a.status,notes:a.notes,customerName:customer?.name||"Cliente",phone:customer?.phone||"",serviceName:service?.name||"Serviço automóvel",registration:vehicle?.registration,make:vehicle?.make,model:vehicle?.model};
    if(a.google_event_id){const updated=await updateAppointmentEvent(a.google_event_id,a.status,payload);if(!updated)throw new Error("Google Calendar não está ligado.");}
    else {const created=await createAppointmentEvent(payload);if(!created.eventId)throw new Error("Não foi possível criar o evento.");await db.from("appointments").update({google_event_id:created.eventId}).eq("id",id);}
   }
   await db.from("appointments").update({google_sync_status:"synced",google_sync_error:null}).eq("id",id);
   return NextResponse.json({ok:true});
  } catch(syncError) {
   await db.from("appointments").update({google_sync_status:"failed",google_sync_error:"Falha na sincronização. Tente novamente."}).eq("id",id);
   throw syncError;
  }
 } catch(error) {
  if(error instanceof Error&&error.message==="UNAUTHORIZED")return NextResponse.json({error:"Não autorizado."},{status:401});
  console.error("admin_appointment_resync",error);return NextResponse.json({error:"Não foi possível sincronizar com o Google Calendar."},{status:502});
 }
}