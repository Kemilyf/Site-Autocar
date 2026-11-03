import { NextRequest,NextResponse } from "next/server";
import { estimateSchema } from "@/lib/validation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
export const runtime="nodejs";
export async function POST(request:NextRequest) {
  const parsed=estimateSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success) return NextResponse.json({error:"Verifique os campos do formulário."},{status:400});
  const input=parsed.data;
  try {
    const db=createSupabaseAdminClient();
    const {data:service,error:serviceError}=await db.from("services").select("*").eq("id",input.serviceId).eq("active",true).single();
    if(serviceError||!service) return NextResponse.json({error:"Serviço indisponível."},{status:404});
    let customerId:string;
    const {data:existing}=await db.from("customers").select("id").eq("phone",input.phone).order("created_at",{ascending:false}).limit(1).maybeSingle();
    if(existing?.id) {
      customerId=existing.id;
      await db.from("customers").update({name:input.name,email:input.email||null}).eq("id",customerId);
    } else {
      const {data:customer,error}=await db.from("customers").insert({name:input.name,phone:input.phone,email:input.email||null}).select("id").single();
      if(error||!customer) throw error||new Error("Cliente não registado.");
      customerId=customer.id;
    }
    let vehicleId:string|null=null;
    if(input.registration) {
      const {data:vehicle}=await db.from("vehicles").select("id").eq("customer_id",customerId).ilike("registration",input.registration).maybeSingle();
      if(vehicle?.id) vehicleId=vehicle.id;
      else {
        const {data:createdVehicle,error}=await db.from("vehicles").insert({customer_id:customerId,registration:input.registration.toUpperCase(),make:input.make||null,model:input.model||null,year:input.year||null}).select("id").single();
        if(error) throw error;
        vehicleId=createdVehicle?.id||null;
      }
    }
    const {data:components,error:componentsError}=await db.from("service_components").select("name,component_type,quantity,unit_price").eq("service_id",service.id).eq("active",true);
    if(componentsError) throw componentsError;
    const lines=[
      ...(service.base_price!==null?[{description:service.name,quantity:1,unit_price:Number(service.base_price)}]:[]),
      ...(components||[]).map((c:any)=>({description:c.name,quantity:Number(c.quantity),unit_price:Number(c.unit_price)}))
    ];
    const subtotal=lines.reduce((sum,line)=>sum+line.quantity*line.unit_price,0);
    const total=service.price_mode==="quote"||lines.length===0?null:Number((service.price_includes_vat?subtotal:subtotal*(1+Number(service.vat_rate)/100)).toFixed(2));
    const {data:estimate,error:estimateError}=await db.from("estimates").insert({
      customer_id:customerId,vehicle_id:vehicleId,service_id:service.id,problem_description:input.problem||null,
      estimated_total:total,status:"received",privacy_accepted_at:new Date().toISOString(),privacy_policy_version:"2026-10-30",
      notes:total===null?"Solicitação de orçamento sujeita a análise da oficina.":"Estimativa calculada com taxa de IVA de "+service.vat_rate+"%."
    }).select("id,status,estimated_total").single();
    if(estimateError||!estimate) throw estimateError||new Error("Não foi possível guardar o pedido.");
    if(lines.length) {
      const rows=lines.map(line=>({estimate_id:estimate.id,description:line.description,quantity:line.quantity,unit_price:line.unit_price,subtotal:Number((line.quantity*line.unit_price).toFixed(2)),vat_rate:Number(service.vat_rate)}));
      const {error:itemsError}=await db.from("estimate_items").insert(rows);
      if(itemsError) throw itemsError;
    }
    const includesVat=Boolean(service.price_includes_vat);
    const vat=total===null?null:(includesVat?Number((subtotal*Number(service.vat_rate)/(100+Number(service.vat_rate))).toFixed(2)):Number((subtotal*Number(service.vat_rate)/100).toFixed(2)));
    return NextResponse.json({
      ok:true,estimateId:estimate.id,mode:total===null?"quote":"estimate",subtotal:Number(subtotal.toFixed(2)),
      vat,total,vatRate:Number(service.vat_rate),priceIncludesVat:includesVat,serviceName:service.name,
      message:total===null?"Pedido de orçamento recebido. A oficina irá analisar o seu pedido.":"Estimativa calculada. O valor final será confirmado após avaliação da oficina."
    },{status:201});
  } catch(error) {
    console.error("estimate_create",error);
    return NextResponse.json({error:"Não foi possível registar o pedido de orçamento."},{status:503});
  }
}