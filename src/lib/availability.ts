import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { addServiceDuration, dayOfWeek, formatLocalTime, localDateTimeToUtc, localDayStart, nextLocalDayStart } from "@/lib/time";
import { getExternalBusyIntervals } from "@/lib/google-calendar";

export async function getAvailableSlots(date: string, serviceId: string) {
  const db = createSupabaseAdminClient();
  const weekday = dayOfWeek(date);
  const [{ data: service, error: serviceError }, { data: hours, error: hoursError }, { data: settings }] = await Promise.all([
    db.from("services").select("id,name,duration_minutes,active").eq("id",serviceId).eq("active",true).maybeSingle(),
    db.from("business_hours").select("*").eq("day_of_week",weekday).maybeSingle(),
    db.from("business_settings").select("capacity,timezone").eq("id",1).maybeSingle()
  ]);
  if (serviceError || hoursError) throw new Error("Não foi possível consultar a disponibilidade.");
  if (!service || !hours?.is_open || !hours.open_time || !hours.close_time) return [];
  const dayStart = localDayStart(date);
  const dayEnd = nextLocalDayStart(date);
  const [{ data: booked, error: bookedError }, { data: blocks, error: blocksError }, externalBusy] = await Promise.all([
    db.from("appointments").select("start_at,end_at,status").in("status",["pending","confirmed","in_progress"]).lt("start_at",dayEnd.toISOString()).gt("end_at",dayStart.toISOString()),
    db.from("calendar_blocks").select("start_at,end_at").lt("start_at",dayEnd.toISOString()).gt("end_at",dayStart.toISOString()),
    getExternalBusyIntervals(dayStart,dayEnd)
  ]);
  if (bookedError || blocksError) throw new Error("Erro ao consultar os horários da oficina.");
  const capacity = settings?.capacity || 1;
  const step = 30;
  const duration = service.duration_minutes;
  const slots: { time: string; endTime: string }[] = [];
  const [openH,openM] = String(hours.open_time).slice(0,5).split(":").map(Number);
  const [closeH,closeM] = String(hours.close_time).slice(0,5).split(":").map(Number);
  const openMinutes = openH*60+openM;
  const closeMinutes = closeH*60+closeM;
  const breakStart = hours.break_start ? String(hours.break_start).slice(0,5) : null;
  const breakEnd = hours.break_end ? String(hours.break_end).slice(0,5) : null;
  const breakStartMin = breakStart ? Number(breakStart.slice(0,2))*60+Number(breakStart.slice(3,5)) : -1;
  const breakEndMin = breakEnd ? Number(breakEnd.slice(0,2))*60+Number(breakEnd.slice(3,5)) : -1;
  for (let minute=openMinutes; minute+duration<=closeMinutes; minute+=step) {
    const h=String(Math.floor(minute/60)).padStart(2,"0");
    const m=String(minute%60).padStart(2,"0");
    const endMinute=minute+duration;
    if (breakStartMin>=0 && minute<breakEndMin && endMinute>breakStartMin) continue;
    const time=`${h}:${m}`;
    const start=localDateTimeToUtc(date,time);
    if (start<=new Date()) continue;
    const end=addServiceDuration(start,duration);
    const dbOverlap=(booked||[]).filter((a:any)=>new Date(a.start_at)<end && new Date(a.end_at)>start).length;
    const blockOverlap=(blocks||[]).some((b:any)=>new Date(b.start_at)<end && new Date(b.end_at)>start);
    const googleOverlap=externalBusy.some(b=>b.start<end && b.end>start);
    if (dbOverlap>=capacity || blockOverlap || googleOverlap) continue;
    slots.push({time:formatLocalTime(start),endTime:formatLocalTime(end)});
  }
  return slots;
}