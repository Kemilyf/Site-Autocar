"use client";
import type { FormEvent } from "react";
import { useEffect,useMemo,useState } from "react";
import { CalendarDays,CheckCircle2,Clock,LoaderCircle,Send } from "lucide-react";
type Service={id:string;name:string;duration_minutes?:number};type Slot={time:string;endTime:string};
export function BookingForm({services}:{services:Service[]}) {
 const [serviceId,setServiceId]=useState(services[0]?.id||"");const [date,setDate]=useState("");const [slots,setSlots]=useState<Slot[]>([]);const [time,setTime]=useState("");const [loadingSlots,setLoadingSlots]=useState(false);const [submitting,setSubmitting]=useState(false);const [error,setError]=useState("");const [success,setSuccess]=useState("");const [minimumDate,setMinimumDate]=useState("");
 useEffect(()=>{setMinimumDate(new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Lisbon",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date()));},[]);
 useEffect(()=>{
  if(!date||!serviceId){setSlots([]);setTime("");return;}
  const controller=new AbortController();setLoadingSlots(true);setTime("");setError("");
  fetch(`/api/availability?date=${encodeURIComponent(date)}&serviceId=${encodeURIComponent(serviceId)}`,{signal:controller.signal})
   .then(async r=>{const data=await r.json();if(!r.ok)throw new Error(data.error||"Não foi possível consultar os horários.");return data;})
   .then(data=>setSlots(data.slots||[])).catch(e=>{if(e.name!=="AbortError")setError(e.message);}).finally(()=>setLoadingSlots(false));
  return ()=>controller.abort();
 },[date,serviceId]);
 const selectedService=useMemo(()=>services.find(s=>s.id===serviceId),[services,serviceId]);
 async function submit(event:FormEvent<HTMLFormElement>) {
  event.preventDefault();setError("");setSuccess("");
  if(!serviceId||!date||!time){setError("Selecione um serviço, uma data e um horário disponível.");return;}
  const formElement=event.currentTarget;const form=new FormData(formElement);
  if(!form.get("privacy")){setError("É necessário confirmar que leu a informação de privacidade.");return;}
  setSubmitting(true);
  try {
   const response=await fetch("/api/appointments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
    name:form.get("name"),phone:form.get("phone"),email:form.get("email"),registration:form.get("registration"),
    make:form.get("make"),model:form.get("model"),year:form.get("year")||null,serviceId,date,time,notes:form.get("notes"),privacyAccepted:true
   })});
   const data=await response.json();if(!response.ok)throw new Error(data.error||"Não foi possível enviar a marcação.");
   setSuccess(`Pedido recebido (#${String(data.appointmentId).slice(0,8)}). ${data.message}`);
   formElement.reset();setDate("");setTime("");setSlots([]);
  } catch(e){setError(e instanceof Error?e.message:"Ocorreu um erro.");}finally{setSubmitting(false);}
 }
 return <form className="form-panel" onSubmit={submit}>
  <div className="form-title"><CalendarDays/><div><h3>Solicitar marcação</h3><p>O pedido fica pendente até confirmação da oficina.</p></div></div>
  <label>Serviço pretendido<select required value={serviceId} onChange={e=>setServiceId(e.target.value)}><option value="">Selecione um serviço</option>{services.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
  <div className="form-row"><label>Data pretendida<input type="date" min={minimumDate} value={date} onChange={e=>setDate(e.target.value)} required/></label><label>Horário<select value={time} onChange={e=>setTime(e.target.value)} disabled={!date||loadingSlots||slots.length===0} required><option value="">{loadingSlots?"A consultar...":slots.length?"Escolha um horário":"Sem horários"}</option>{slots.map(s=><option key={s.time} value={s.time}>{s.time} – {s.endTime}</option>)}</select></label></div>
  {date&&<div className="availability-hint">{loadingSlots?<><LoaderCircle className="spin" size={16}/> A consultar disponibilidade...</>:slots.length?<><Clock size={16}/> {slots.length} horário(s) disponível(eis).</>:<>Não existem horários disponíveis. Confirme se a oficina já configurou o horário de funcionamento.</>}</div>}
  {selectedService&&<div className="duration-info">Duração estimada: {selectedService.duration_minutes||60} minutos.</div>}
  <div className="form-divider">Os seus dados</div><label>Nome completo<input name="name" minLength={2} maxLength={120} autoComplete="name" placeholder="O seu nome" required/></label>
  <div className="form-row"><label>Telemóvel<input name="phone" type="tel" minLength={7} maxLength={30} autoComplete="tel" placeholder="+351 9..." required/></label><label>E-mail (opcional)<input name="email" type="email" autoComplete="email" placeholder="nome@email.com"/></label></div>
  <div className="form-divider">Dados da viatura (opcional)</div><div className="form-row"><label>Matrícula<input name="registration" maxLength={20} placeholder="AA-00-AA"/></label><label>Marca<input name="make" placeholder="Ex.: Peugeot"/></label></div>
  <div className="form-row"><label>Modelo<input name="model" placeholder="Ex.: 208"/></label><label>Ano<input name="year" type="number" min="1950" max={new Date().getFullYear()+1} placeholder="Ex.: 2020"/></label></div>
  <label>Observações<textarea name="notes" rows={3} maxLength={2000} placeholder="Descreva brevemente o que a viatura precisa."/></label>
  <label className="consent"><input type="checkbox" name="privacy" required/><span>Li a <a href="/privacidade" target="_blank" rel="noreferrer">informação de privacidade</a> e autorizo a utilização dos dados para responder a este pedido.</span></label>
  {error&&<p className="form-error" role="alert">{error}</p>}{success&&<p className="form-success" role="status"><CheckCircle2 size={18}/>{success}</p>}
  <button className="button button-full" disabled={submitting||!services.length}>{submitting?<><LoaderCircle className="spin"/> A enviar...</>:<>Enviar pedido de marcação <Send size={17}/></>}</button><p className="form-footnote">O envio não confirma imediatamente a marcação. A oficina irá validar a disponibilidade.</p>
 </form>;
}