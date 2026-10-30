"use client";
import type { FormEvent } from "react";
import { useState } from "react";
import { Calculator,CheckCircle2,LoaderCircle,ArrowRight } from "lucide-react";
type Service={id:string;name:string;price_mode:string;base_price:number|null;duration_minutes:number};
type Result={mode:"quote"|"estimate";subtotal:number;vat:number|null;total:number|null;vatRate:number;priceIncludesVat:boolean;message:string;estimateId:string;serviceName:string};
export function EstimateForm({services}:{services:Service[]}) {
 const [serviceId,setServiceId]=useState(services[0]?.id||"");const [result,setResult]=useState<Result|null>(null);const [error,setError]=useState("");const [loading,setLoading]=useState(false);
 async function submit(event:FormEvent<HTMLFormElement>) {
  event.preventDefault();setResult(null);setError("");const form=new FormData(event.currentTarget);
  if(!form.get("privacy")){setError("É necessário confirmar que leu a informação de privacidade.");return;}
  setLoading(true);
  try {
   const response=await fetch("/api/estimates",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
    name:form.get("name"),phone:form.get("phone"),email:form.get("email"),registration:form.get("registration"),
    make:form.get("make"),model:form.get("model"),year:form.get("year")||null,serviceId,problem:form.get("problem"),privacyAccepted:true
   })});
   const data=await response.json();if(!response.ok)throw new Error(data.error||"Não foi possível calcular a estimativa.");setResult(data);
  } catch(e){setError(e instanceof Error?e.message:"Ocorreu um erro.");}finally{setLoading(false);}
 }
 const service=services.find(s=>s.id===serviceId);
 return <form className="form-panel estimate-form" onSubmit={submit}>
  <div className="form-title"><Calculator/><div><h3>Simular orçamento</h3><p>Obtenha uma estimativa ou solicite análise da oficina.</p></div></div>
  <label>Serviço<select required value={serviceId} onChange={e=>{setServiceId(e.target.value);setResult(null);}}><option value="">Selecione</option>{services.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
  {service&&<div className="estimate-mode">{service.price_mode==="quote"||service.base_price===null?"Este serviço necessita de avaliação ou orçamento personalizado.":"Preço base configurado pela oficina: "+Number(service.base_price).toLocaleString("pt-PT",{style:"currency",currency:"EUR"})}</div>}
  <div className="form-divider">Dados de contacto</div><label>Nome completo<input name="name" minLength={2} maxLength={120} required placeholder="O seu nome"/></label>
  <div className="form-row"><label>Telemóvel<input name="phone" type="tel" minLength={7} maxLength={30} required placeholder="+351 9..."/></label><label>E-mail (opcional)<input name="email" type="email" placeholder="nome@email.com"/></label></div>
  <div className="form-divider">Dados da viatura</div><div className="form-row"><label>Matrícula<input name="registration" placeholder="AA-00-AA"/></label><label>Marca<input name="make" placeholder="Marca"/></label></div>
  <div className="form-row"><label>Modelo<input name="model" placeholder="Modelo"/></label><label>Ano<input name="year" type="number" min="1950" max={new Date().getFullYear()+1} placeholder="Ano"/></label></div>
  <label>Descreva o serviço ou problema<textarea name="problem" rows={3} maxLength={2000} placeholder="Explique o que pretende ou os sintomas da viatura."/></label>
  <label className="consent"><input type="checkbox" name="privacy" required/><span>Li a <a href="/privacidade" target="_blank" rel="noreferrer">informação de privacidade</a> e autorizo a utilização dos dados para responder ao pedido.</span></label>
  {error&&<p className="form-error" role="alert">{error}</p>}
  {result&&<div className="estimate-result"><div className="result-label"><CheckCircle2 size={18}/> {result.mode==="estimate"?"Estimativa calculada":"Pedido recebido"}</div><b>{result.total===null?"Sob análise da oficina":result.total.toLocaleString("pt-PT",{style:"currency",currency:"EUR"})}</b>{result.total!==null&&<small>{result.priceIncludesVat?"Valor apresentado inclui IVA":"Valor apresentado inclui IVA estimado"} ({result.vatRate}%).</small>}<p>{result.message}</p><small>Referência: {result.estimateId.slice(0,8)}</small></div>}
  <button className="button button-full" disabled={loading||!services.length}>{loading?<><LoaderCircle className="spin"/> A calcular...</>:<>Obter estimativa / solicitar orçamento <ArrowRight size={17}/></>}</button>
  <p className="form-footnote">A estimativa é indicativa e pode ser alterada após inspeção ou diagnóstico da viatura.</p>
 </form>;
}