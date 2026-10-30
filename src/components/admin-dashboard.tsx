"use client";
import type { FormEvent } from "react";
import { useMemo,useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays,Check,Clock,ExternalLink,LogOut,RefreshCw,Settings,ShieldCheck,TriangleAlert,Wrench,X,FileText } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Appointment=any;
type Estimate=any;
type Service={id:string;name:string;price_mode:string;base_price:number|null;duration_minutes:number;active:boolean;price_includes_vat:boolean;vat_rate:number};
type Hour={day_of_week:number;is_open:boolean;open_time:string|null;close_time:string|null;break_start:string|null;break_end:string|null};
const DAYS=["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
const emptyHours=()=>DAYS.map((_,day_of_week)=>({day_of_week,is_open:false,open_time:"",close_time:"",break_start:"",break_end:""}));
function timeValue(value:string|null|undefined){return value?value.slice(0,5):"";}
function dateLabel(value:string){return new Intl.DateTimeFormat("pt-PT",{dateStyle:"medium",timeStyle:"short",timeZone:"Europe/Lisbon"}).format(new Date(value));}
export function AdminDashboard({adminName,appointments,estimates,services,hours,googleConnected,calendarId}:{adminName:string;appointments:Appointment[];estimates:Estimate[];services:Service[];hours:Hour[];googleConnected:boolean;calendarId:string|null}) {
 const router=useRouter();
 const [rows,setRows]=useState(()=>DAYS.map((_,day)=>{const h=hours.find(x=>x.day_of_week===day);return h?{day_of_week:day,is_open:h.is_open,open_time:timeValue(h.open_time),close_time:timeValue(h.close_time),break_start:timeValue(h.break_start),break_end:timeValue(h.break_end)}:emptyHours()[day];}));
 const [serviceRows,setServiceRows]=useState(services.map(s=>({...s,base_price:s.base_price===null?null:Number(s.base_price),vat_rate:Number(s.vat_rate)})));
 const [quoteValues,setQuoteValues]=useState<Record<string,string>>({});
 const [busyId,setBusyId]=useState("");const [notice,setNotice]=useState("");const [error,setError]=useState("");
 const [hoursSaving,setHoursSaving]=useState(false);const [serviceSaving,setServiceSaving]=useState("");
 const pending=appointments.filter(a=>a.status==="pending").length;
 const pendingEstimates=estimates.filter(e=>["received","under_review"].includes(e.status)).length;
 const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Lisbon",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
 const todayCount=appointments.filter(a=>new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Lisbon",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(a.start_at))===today).length;
 const sorted=useMemo(()=>[...appointments].sort((a,b)=>new Date(a.start_at).getTime()-new Date(b.start_at).getTime()),[appointments]);
 async function updateAppointment(id:string,status:string) {
  setBusyId(id);setNotice("");setError("");
  try {
   const response=await fetch("/api/admin/appointments/"+id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});
   const data=await response.json();if(!response.ok)throw new Error(data.error||"Não foi possível atualizar.");
   setNotice(data.googleSyncStatus==="failed"?"Estado atualizado, mas a sincronização Google falhou. Pode tentar novamente na coluna Google.":"Marcação atualizada com sucesso.");router.refresh();
  }catch(e){setError(e instanceof Error?e.message:"Erro ao atualizar.");}finally{setBusyId("");}
 }
 async function retrySync(id:string) {
  setBusyId(id);setNotice("");setError("");
  try {
   const response=await fetch("/api/admin/appointments/"+id+"/sync",{method:"POST"});
   const data=await response.json();if(!response.ok)throw new Error(data.error||"Não foi possível sincronizar.");
   setNotice("Marcação sincronizada com o Google Calendar.");router.refresh();
  }catch(e){setError(e instanceof Error?e.message:"Erro na sincronização.");}finally{setBusyId("");}
 }
 async function updateEstimate(estimate:Estimate,status:string) {
  setBusyId(estimate.id);setNotice("");setError("");
  const amountText=quoteValues[estimate.id]??(estimate.workshop_quote===null?"":String(estimate.workshop_quote));
  if(status==="sent"&&(amountText.trim()===""||!Number.isFinite(Number(amountText))||Number(amountText)<0)){setError("Informe um valor válido antes de marcar o orçamento como enviado.");setBusyId("");return;}
  try {
   const response=await fetch("/api/admin/estimates/"+estimate.id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status,workshopQuote:amountText.trim()===""?undefined:Number(amountText)})});
   const data=await response.json();if(!response.ok)throw new Error(data.error||"Não foi possível atualizar o orçamento.");
   setNotice("Pedido de orçamento atualizado.");router.refresh();
  }catch(e){setError(e instanceof Error?e.message:"Erro ao atualizar orçamento.");}finally{setBusyId("");}
 }
 async function saveHours(e:FormEvent) {
  e.preventDefault();setHoursSaving(true);setNotice("");setError("");
  try {
   const response=await fetch("/api/admin/hours",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(rows)});
   const data=await response.json();if(!response.ok)throw new Error(data.error||"Não foi possível guardar.");
   setNotice("Horário de funcionamento guardado.");router.refresh();
  }catch(e){setError(e instanceof Error?e.message:"Erro ao guardar.");}finally{setHoursSaving(false);}
 }
 async function saveService(service:Service) {
  setServiceSaving(service.id);setNotice("");setError("");
  try {
   const response=await fetch("/api/admin/services/"+service.id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({
    priceMode:service.price_mode,basePrice:service.base_price,durationMinutes:Number(service.duration_minutes),active:service.active,
    vatRate:Number(service.vat_rate),priceIncludesVat:service.price_includes_vat
   })});
   const data=await response.json();if(!response.ok)throw new Error(data.error||"Não foi possível guardar o serviço.");
   setNotice("Serviço "+service.name+" atualizado.");router.refresh();
  }catch(e){setError(e instanceof Error?e.message:"Erro ao guardar serviço.");}finally{setServiceSaving("");}
 }
 async function logout(){await createSupabaseBrowserClient().auth.signOut();router.replace("/admin/login");router.refresh();}
 return <main className="admin-shell">
  <aside className="admin-sidebar"><a href="/" className="admin-brand"><img src="/logo-autocar.svg" alt="Auto Car"/></a><div className="sidebar-label">GESTÃO DA OFICINA</div><a href="#resumo" className="sidebar-link active"><CalendarDays/> Visão geral</a><a href="#agenda" className="sidebar-link"><Clock/> Marcações</a><a href="#orcamentos-admin" className="sidebar-link"><FileText/> Orçamentos</a><a href="#servicos-admin" className="sidebar-link"><Wrench/> Serviços e preços</a><a href="#horarios" className="sidebar-link"><Settings/> Horários</a><div className="sidebar-bottom"><span>{adminName}</span><button onClick={logout}><LogOut size={17}/> Terminar sessão</button></div></aside>
  <section className="admin-main"><header className="admin-topbar"><div><span className="admin-kicker">AUTO CAR SERVIÇOS · VISEU</span><h1>Gestão da oficina</h1></div><a className="button button-small" href="/">Ver website <ExternalLink size={15}/></a></header>
   <div className="admin-content">
    {(notice||error)&&<div className={error?"admin-alert error":"admin-alert"}>{error||notice}<button onClick={()=>{setError("");setNotice("");}}><X size={16}/></button></div>}
    <div className="stats-grid" id="resumo"><div className="stat-card"><span>Marcações pendentes</span><b>{pending}</b><small>Aguardam confirmação</small></div><div className="stat-card"><span>Orçamentos por tratar</span><b>{pendingEstimates}</b><small>Recebidos ou em análise</small></div><div className="stat-card"><span>Marcações hoje</span><b>{todayCount}</b><small>Fuso Europe/Lisbon</small></div><div className="stat-card"><span>Agenda Google</span><b className="stat-status">{googleConnected?"Ligada":"Por ligar"}</b><small>{googleConnected?"Calendário: "+calendarId:"Autorização pendente"}</small></div></div>

    <section className="admin-section" id="agenda"><div className="admin-section-head"><div><span className="admin-kicker">ATENDIMENTO</span><h2>Marcações recentes</h2></div><span className="muted">{appointments.length} registo(s) carregados.</span></div>
     {sorted.length===0?<div className="empty-state"><CalendarDays size={30}/><b>Ainda não existem marcações.</b><p>Os pedidos do website serão apresentados aqui.</p></div>:<div className="table-wrap"><table className="admin-table"><thead><tr><th>Data e hora</th><th>Cliente / viatura</th><th>Serviço</th><th>Estado</th><th>Google</th><th>Ações</th></tr></thead><tbody>{sorted.map(a=>{
      const customer=Array.isArray(a.customers)?a.customers[0]:a.customers;const service=Array.isArray(a.services)?a.services[0]:a.services;const vehicle=Array.isArray(a.vehicles)?a.vehicles[0]:a.vehicles;
      return <tr key={a.id}><td><b>{dateLabel(a.start_at)}</b><small>Fim: {dateLabel(a.end_at)}</small></td><td>{customer?.name||"Cliente"}<small>{customer?.phone||"—"} {vehicle?.registration?"· "+vehicle.registration:""}</small></td><td>{service?.name||"Serviço"}</td><td><span className={"status-pill "+a.status}>{({pending:"Pendente",confirmed:"Confirmado",rejected:"Recusado",cancelled:"Cancelado",in_progress:"Em atendimento",completed:"Concluído"} as any)[a.status]||a.status}</span></td><td><span className={"sync-pill "+a.google_sync_status}>{a.google_sync_status==="synced"?"Sincronizado":a.google_sync_status==="failed"?"Falhou":a.google_sync_status==="not_configured"?"Não ligado":"Pendente"}</span>{googleConnected&&a.google_sync_status!=="synced"&&!["cancelled","rejected"].includes(a.status)&&<button className="sync-retry" disabled={busyId===a.id} onClick={()=>retrySync(a.id)}><RefreshCw size={12}/> Sincronizar</button>}</td><td><div className="row-actions">{a.status==="pending"&&<><button className="icon-action approve" title="Confirmar" disabled={busyId===a.id} onClick={()=>updateAppointment(a.id,"confirmed")}><Check size={16}/></button><button className="icon-action reject" title="Recusar" disabled={busyId===a.id} onClick={()=>updateAppointment(a.id,"rejected")}><X size={16}/></button></>}{a.status==="confirmed"&&<button className="icon-action reject" title="Cancelar" disabled={busyId===a.id} onClick={()=>updateAppointment(a.id,"cancelled")}><X size={16}/></button>}</div></td></tr>;
     })}</tbody></table></div>}
    </section>

    <section className="admin-section" id="orcamentos-admin"><div className="admin-section-head"><div><span className="admin-kicker">PEDIDOS DE CLIENTES</span><h2>Orçamentos</h2></div><span className="muted">{estimates.length} pedido(s) carregados.</span></div>
     {estimates.length===0?<div className="empty-state"><FileText size={28}/><b>Ainda não existem pedidos de orçamento.</b><p>Os pedidos do simulador serão apresentados aqui.</p></div>:<div className="estimate-admin-list">{estimates.map(e=>{
      const customer=Array.isArray(e.customers)?e.customers[0]:e.customers;const service=Array.isArray(e.services)?e.services[0]:e.services;const vehicle=Array.isArray(e.vehicles)?e.vehicles[0]:e.vehicles;
      return <div className="estimate-admin-row" key={e.id}><div className="estimate-admin-info"><b>{service?.name||"Serviço"}</b><small>{customer?.name||"Cliente"} · {customer?.phone||"—"} {vehicle?.registration?"· "+vehicle.registration:""}</small><small>{dateLabel(e.created_at)} · {e.problem_description||"Sem observações"}</small><small>Estimativa: {e.estimated_total===null?"Sob consulta":Number(e.estimated_total).toLocaleString("pt-PT",{style:"currency",currency:"EUR"})}</small><span className="status-pill">{({received:"Recebido",under_review:"Em análise",sent:"Enviado",accepted:"Aceite",rejected:"Recusado",cancelled:"Cancelado"} as any)[e.status]||e.status}</span></div><div className="estimate-admin-actions"><label>Valor proposto (€)<input type="number" min="0" step="0.01" value={quoteValues[e.id]??(e.workshop_quote===null?"":String(e.workshop_quote))} onChange={ev=>setQuoteValues(current=>({...current,[e.id]:ev.target.value}))} placeholder="A definir"/></label><div><button className="admin-mini-button" disabled={busyId===e.id} onClick={()=>updateEstimate(e,"under_review")}>Em análise</button><button className="admin-mini-button primary" disabled={busyId===e.id} onClick={()=>updateEstimate(e,"sent")}>Marcar enviado</button><button className="admin-mini-button" disabled={busyId===e.id} onClick={()=>updateEstimate(e,"accepted")}>Aceite</button><button className="admin-mini-button danger" disabled={busyId===e.id} onClick={()=>updateEstimate(e,"rejected")}>Recusar</button></div></div></div>;
     })}</div>}
    </section>

    <section className="admin-section" id="servicos-admin"><div className="admin-section-head"><div><span className="admin-kicker">CATÁLOGO</span><h2>Serviços e preços</h2></div><span className="muted">Os preços só ficam públicos depois de guardados.</span></div>
     <div className="service-admin-list">{serviceRows.map(service=><div className="service-admin-row" key={service.id}><div className="service-admin-name"><b>{service.name}</b><small>Duração (minutos)</small><input type="number" min="15" max="720" value={service.duration_minutes} onChange={e=>setServiceRows(current=>current.map(s=>s.id===service.id?{...s,duration_minutes:Number(e.target.value)}:s))}/></div><label>Modelo de preço<select value={service.price_mode} onChange={e=>setServiceRows(current=>current.map(s=>s.id===service.id?{...s,price_mode:e.target.value,base_price:e.target.value==="quote"?null:s.base_price}:s))}><option value="quote">Sob orçamento</option><option value="estimate">Estimativa</option><option value="fixed">Preço fixo</option></select></label><label>Preço base (€)<input type="number" min="0" step="0.01" disabled={service.price_mode==="quote"} value={service.base_price??""} placeholder="A definir" onChange={e=>setServiceRows(current=>current.map(s=>s.id===service.id?{...s,base_price:e.target.value===""?null:Number(e.target.value)}:s))}/></label><label>IVA (%)<input type="number" min="0" max="100" step="0.01" value={service.vat_rate} onChange={e=>setServiceRows(current=>current.map(s=>s.id===service.id?{...s,vat_rate:Number(e.target.value)}:s))}/></label><label className="active-toggle"><input type="checkbox" checked={service.price_includes_vat} onChange={e=>setServiceRows(current=>current.map(s=>s.id===service.id?{...s,price_includes_vat:e.target.checked}:s))}/> IVA incluído</label><label className="active-toggle"><input type="checkbox" checked={service.active} onChange={e=>setServiceRows(current=>current.map(s=>s.id===service.id?{...s,active:e.target.checked}:s))}/> Ativo</label><button className="button button-small" disabled={serviceSaving===service.id} onClick={()=>saveService(service)}>{serviceSaving===service.id?"A guardar...":"Guardar"}</button></div>)}</div>
     <p className="admin-hint"><TriangleAlert size={15}/> Configure apenas preços e taxas validados pela oficina e pelo contabilista. Os serviços iniciais não têm preço comercial.</p>
    </section>

    <section className="admin-section" id="horarios"><div className="admin-section-head"><div><span className="admin-kicker">DISPONIBILIDADE</span><h2>Horário de funcionamento</h2></div><span className="muted">Fuso horário: Europe/Lisbon</span></div>
     <form onSubmit={saveHours}><div className="hours-table">{rows.map((row,index)=><div className="hours-row" key={row.day_of_week}><b>{DAYS[index]}</b><label className="active-toggle"><input type="checkbox" checked={row.is_open} onChange={e=>setRows(current=>current.map((r,i)=>i===index?{...r,is_open:e.target.checked}:r))}/> Aberto</label><input aria-label={"Abertura "+DAYS[index]} type="time" disabled={!row.is_open} value={row.open_time} onChange={e=>setRows(current=>current.map((r,i)=>i===index?{...r,open_time:e.target.value}:r))}/><span>até</span><input aria-label={"Fecho "+DAYS[index]} type="time" disabled={!row.is_open} value={row.close_time} onChange={e=>setRows(current=>current.map((r,i)=>i===index?{...r,close_time:e.target.value}:r))}/><input aria-label={"Início de pausa "+DAYS[index]} type="time" disabled={!row.is_open} value={row.break_start} onChange={e=>setRows(current=>current.map((r,i)=>i===index?{...r,break_start:e.target.value}:r))}/><input aria-label={"Fim de pausa "+DAYS[index]} type="time" disabled={!row.is_open} value={row.break_end} onChange={e=>setRows(current=>current.map((r,i)=>i===index?{...r,break_end:e.target.value}:r))}/></div>)}</div><p className="admin-hint">Os dois últimos campos representam início e fim da pausa. Deixe ambos vazios se não existir pausa.</p><button className="button" disabled={hoursSaving}>{hoursSaving?"A guardar...":"Guardar horário"}</button></form>
    </section>
    <section className="admin-section google-admin"><div><span className="admin-kicker">INTEGRAÇÃO</span><h2>Google Calendar</h2><p>{googleConnected?"A conta Google está ligada. Eventos externos ocupados bloqueiam a disponibilidade e os pedidos do website são sincronizados.":"Ligue a conta Google que contém o calendário da oficina. As marcações continuam guardadas na aplicação mesmo antes de ligar o Google."}</p></div><a className="button" href="/api/admin/google/connect">{googleConnected?"Reautorizar Google Calendar":"Ligar Google Calendar"} <ExternalLink size={16}/></a></section>
   </div>
  </section>
 </main>;
}