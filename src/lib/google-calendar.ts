import { google,calendar_v3 } from "googleapis";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { fromZonedTime } from "date-fns-tz";
import { TIME_ZONE } from "@/lib/time";
import { createCipheriv,createDecipheriv,randomBytes } from "node:crypto";
const CONNECTION_ID=1;const APP_MARKER="auto-car-viseu";
function oauthClient() {
 const {GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,GOOGLE_REDIRECT_URI}=process.env;
 if(!GOOGLE_CLIENT_ID||!GOOGLE_CLIENT_SECRET||!GOOGLE_REDIRECT_URI)throw new Error("Credenciais OAuth Google em falta.");
 return new google.auth.OAuth2(GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,GOOGLE_REDIRECT_URI);
}
function encryptionKey() {
 const raw=process.env.TOKEN_ENCRYPTION_KEY||"";
 if(!/^[a-fA-F0-9]{64}$/.test(raw))throw new Error("TOKEN_ENCRYPTION_KEY deve conter 64 caracteres hexadecimais.");
 return Buffer.from(raw,"hex");
}
export function encryptToken(value:string) {
 const iv=randomBytes(12);const cipher=createCipheriv("aes-256-gcm",encryptionKey(),iv);
 const encrypted=Buffer.concat([cipher.update(value,"utf8"),cipher.final()]);
 return [iv.toString("hex"),cipher.getAuthTag().toString("hex"),encrypted.toString("hex")].join(".");
}
function decryptToken(value:string) {
 const [ivHex,tagHex,dataHex]=value.split(".");
 if(!ivHex||!tagHex||!dataHex)throw new Error("Token Google cifrado inválido.");
 const decipher=createDecipheriv("aes-256-gcm",encryptionKey(),Buffer.from(ivHex,"hex"));
 decipher.setAuthTag(Buffer.from(tagHex,"hex"));
 return Buffer.concat([decipher.update(Buffer.from(dataHex,"hex")),decipher.final()]).toString("utf8");
}
export function googleOAuth(){return oauthClient();}
export async function getCalendarConnection() {
 const db=createSupabaseAdminClient();
 const {data,error}=await db.from("google_calendar_connections").select("*").eq("id",CONNECTION_ID).maybeSingle();
 if(error)throw error;return data;
}
export async function getCalendarClient() {
 const connection=await getCalendarConnection();if(!connection)return null;
 const auth=oauthClient();auth.setCredentials({refresh_token:decryptToken(connection.encrypted_refresh_token)});
 return {calendar:google.calendar({version:"v3",auth}),calendarId:connection.calendar_id};
}
export type BusyInterval={start:Date;end:Date};
export async function getExternalBusyIntervals(timeMin:Date,timeMax:Date):Promise<BusyInterval[]> {
 const connected=await getCalendarClient();if(!connected)return [];
 const {data}=await connected.calendar.events.list({calendarId:connected.calendarId,timeMin:timeMin.toISOString(),timeMax:timeMax.toISOString(),singleEvents:true,orderBy:"startTime",maxResults:2500});
 return (data.items||[]).flatMap(event=>{
  if(event.status==="cancelled"||event.transparency==="transparent"||event.extendedProperties?.private?.app===APP_MARKER)return [];
  const start=event.start?.dateTime?new Date(event.start.dateTime):event.start?.date?fromZonedTime(event.start.date+"T00:00:00",TIME_ZONE):null;
  const end=event.end?.dateTime?new Date(event.end.dateTime):event.end?.date?fromZonedTime(event.end.date+"T00:00:00",TIME_ZONE):null;
  if(!start||!end||!Number.isFinite(start.getTime())||!Number.isFinite(end.getTime()))return [];
  return [{start,end}];
 });
}
export async function createAppointmentEvent(input:{
 id:string;startAt:string;endAt:string;status:string;notes?:string|null;customerName:string;phone:string;
 serviceName:string;registration?:string|null;make?:string|null;model?:string|null;
}) {
 const connected=await getCalendarClient();if(!connected)return {configured:false as const,eventId:null};
 const titleStatus=input.status==="confirmed"?"CONFIRMADO":"PENDENTE";
 const description=[
  "Marcação #"+input.id,"Cliente: "+input.customerName,"Telefone: "+input.phone,
  "Serviço: "+input.serviceName,input.registration?"Matrícula: "+input.registration:"",
  input.make||input.model?"Viatura: "+[input.make,input.model].filter(Boolean).join(" "):"",
  input.notes?"Observações: "+input.notes:""
 ].filter(Boolean).join("\n");
 const response=await connected.calendar.events.insert({
  calendarId:connected.calendarId,sendUpdates:"none",
  requestBody:{
   summary:"["+titleStatus+"] "+input.serviceName+" — "+input.customerName,description,
   start:{dateTime:input.startAt,timeZone:TIME_ZONE},end:{dateTime:input.endAt,timeZone:TIME_ZONE},
   reminders:{useDefault:true},
   extendedProperties:{private:{app:APP_MARKER,appointmentId:input.id}}
  }
 });
 return {configured:true as const,eventId:response.data.id||null};
}
export async function updateAppointmentEvent(eventId:string,status:string,input:{
 id:string;startAt:string;endAt:string;notes?:string|null;customerName:string;phone:string;serviceName:string;registration?:string|null;
}) {
 const connected=await getCalendarClient();if(!connected)return false;
 const titleStatus=status==="confirmed"?"CONFIRMADO":status.toUpperCase();
 await connected.calendar.events.patch({
  calendarId:connected.calendarId,eventId,sendUpdates:"none",
  requestBody:{
   summary:"["+titleStatus+"] "+input.serviceName+" — "+input.customerName,
   description:["Marcação #"+input.id,"Cliente: "+input.customerName,"Telefone: "+input.phone,"Serviço: "+input.serviceName,input.registration?"Matrícula: "+input.registration:"",input.notes?"Observações: "+input.notes:""].filter(Boolean).join("\n"),
   start:{dateTime:input.startAt,timeZone:TIME_ZONE},end:{dateTime:input.endAt,timeZone:TIME_ZONE}
  }
 });
 return true;
}
export async function deleteAppointmentEvent(eventId:string) {
 const connected=await getCalendarClient();if(!connected)return false;
 await connected.calendar.events.delete({calendarId:connected.calendarId,eventId,sendUpdates:"none"});return true;
}
export function googleCalendarConfigured() {
 return Boolean(process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET&&process.env.GOOGLE_REDIRECT_URI&&process.env.TOKEN_ENCRYPTION_KEY);
}
export type GoogleCalendarClient={calendar:calendar_v3.Calendar;calendarId:string};