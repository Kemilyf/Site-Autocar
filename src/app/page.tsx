import Image from "next/image";
import Link from "next/link";
import { Wrench,CarFront,ShieldCheck,Settings,Phone,MapPin,Clock,ArrowUpRight,Instagram } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { BookingForm } from "@/components/booking-form";
import { EstimateForm } from "@/components/estimate-form";

export const dynamic="force-dynamic";
async function getServices() {
  try {
    const db=createSupabaseAdminClient();
    const {data}=await db.from("services").select("id,name,description,category,duration_minutes,price_mode,base_price").eq("active",true).order("name");
    return data||[];
  } catch { return []; }
}
const features=[
  {icon:Wrench,title:"Mecânica geral",desc:"Manutenção e reparação de componentes mecânicos."},
  {icon:Settings,title:"Diagnóstico eletrónico",desc:"Identificação de avarias e leitura de sistemas eletrónicos."},
  {icon:ShieldCheck,title:"Travões e suspensão",desc:"Atenção aos sistemas essenciais à segurança."},
  {icon:CarFront,title:"Pneus, baterias e revisões",desc:"Cuidados para manter a viatura pronta para a estrada."}
];
export default async function HomePage() {
  const services=await getServices();
  return <main>
    <div className="topline"><div className="container topbar-inner"><span>Viseu, Portugal</span><a href="tel:+351926388985"><Phone size={14}/> +351 926 388 985</a><a href="https://www.instagram.com/auto_car_viseu/" target="_blank" rel="noreferrer"><Instagram size={15}/> @auto_car_viseu</a></div></div>
    <header className="site-header"><div className="container nav-wrap">
      <Link href="#inicio" className="brand" aria-label="Auto Car Serviços Viseu"><Image src="/logo-autocar.svg" alt="Auto Car Serviços Viseu" width={150} height={96} priority/></Link>
      <nav className="desktop-nav"><a href="#servicos">Serviços</a><a href="#sobre">A oficina</a><a href="#orcamento">Orçamento</a><a href="#marcacao">Marcação</a><a href="#contactos">Contactos</a></nav>
      <a className="button button-small" href="#marcacao">Marcar serviço <ArrowUpRight size={16}/></a>
    </div></header>

    <section className="hero" id="inicio"><div className="hero-photo"/><div className="container hero-content">
      <div className="eyebrow"><span/> AUTO CAR SERVIÇOS · VISEU</div>
      <h1>O seu carro<br/><em>em boas mãos.</em></h1>
      <p>Manutenção e reparação automóvel com profissionalismo, transparência e atenção ao que realmente importa: a sua segurança.</p>
      <div className="hero-actions"><a className="button" href="#marcacao">Solicitar marcação <ArrowUpRight size={18}/></a><a className="button button-ghost" href="#orcamento">Simular orçamento</a></div>
      <div className="hero-foot"><ShieldCheck size={20}/> Confiança em cada quilómetro.</div>
    </div><div className="hero-index">VISEU · PORTUGAL</div></section>

    <section className="service-band" id="servicos"><div className="container"><div className="section-heading"><div><div className="eyebrow dark"><span/> O QUE FAZEMOS</div><h2>Cuidados completos<br/><em>para a sua viatura.</em></h2></div><p>Do diagnóstico à manutenção, conte com uma oficina próxima e um atendimento claro.</p></div>
      <div className="service-grid">{(services.length?services:features.map((f,i)=>({id:String(i),name:f.title,description:f.desc,price_mode:"quote"}))).map((s:any,i:number)=>{
        const icon=features[i%features.length].icon;
        const Icon=icon;
        return <article className="service-card" key={s.id}><div className="service-icon"><Icon size={24}/></div><div><div className="service-number">0{i+1}</div><h3>{s.name}</h3><p>{s.description||"Serviço automóvel realizado mediante avaliação da viatura."}</p><span className="service-price">{s.price_mode==="quote"||s.base_price===null?"Sob orçamento":`A partir de ${Number(s.base_price).toLocaleString("pt-PT",{style:"currency",currency:"EUR"})}`}</span></div></article>
      })}</div>
    </div></section>

    <section className="about-section" id="sobre"><div className="container about-layout"><div className="about-image"><Image src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1200&q=85" alt="Mecânico a trabalhar numa viatura" width={900} height={700}/><div className="image-stamp">AUTO CAR<br/><small>SERVIÇOS VISEU</small></div></div><div className="about-copy"><div className="eyebrow dark"><span/> A SUA OFICINA</div><h2>Compromisso consigo.<br/><em>Cuidado com o seu carro.</em></h2><p>Acreditamos que um bom serviço começa por ouvir. Queremos que saiba o que a sua viatura precisa, compreenda as opções e tenha acompanhamento em cada etapa.</p><div className="benefit-list"><div><ShieldCheck/><span><b>Transparência</b><small>Explicamos o serviço e os passos antes de avançar.</small></span></div><div><Wrench/><span><b>Atenção técnica</b><small>Manutenção e reparação com foco na segurança.</small></span></div><div><CarFront/><span><b>Atendimento próximo</b><small>Fale connosco por telefone, WhatsApp ou website.</small></span></div></div><a className="text-link" href="#contactos">Entre em contacto <ArrowUpRight size={17}/></a></div></div></section>

    <section className="estimate-section" id="orcamento"><div className="container estimate-layout"><div className="estimate-intro"><div className="eyebrow"><span/> PREÇO COM MAIS CLAREZA</div><h2>Faça uma<br/><em>estimativa.</em></h2><p>Escolha o serviço e informe os dados da viatura. Quando existir um preço configurado pela oficina, o sistema apresenta uma estimativa. Os serviços que dependem de diagnóstico seguem para análise.</p><div className="estimate-note"><ShieldCheck size={20}/> A estimativa não substitui o orçamento final após avaliação.</div></div><EstimateForm services={services}/></div></section>

    <section className="booking-section" id="marcacao"><div className="container booking-layout"><div className="booking-intro"><div className="eyebrow dark"><span/> MARCAÇÃO ONLINE</div><h2>Escolha o dia.<br/><em>Nós tratamos do resto.</em></h2><p>Envie o seu pedido de marcação em poucos passos. A oficina irá analisar a disponibilidade e confirmar o atendimento.</p><div className="booking-points"><span><b>01</b> Escolha o serviço e o horário disponível.</span><span><b>02</b> Informe os seus contactos e a viatura.</span><span><b>03</b> Aguarde a confirmação da oficina.</span></div><a className="phone-link" href="tel:+351926388985"><Phone/> +351 926 388 985</a></div><BookingForm services={services}/></div></section>

    <section className="contact-section" id="contactos"><div className="container"><div className="eyebrow"><span/> FALE CONNOSCO</div><h2>Conte connosco<br/><em>para seguir viagem.</em></h2><div className="contact-grid">
      <a href="tel:+351926388985" className="contact-card"><Phone/><small>TELEFONE</small><b>+351 926 388 985</b><span>Ligar para a oficina</span></a>
      <a href="https://wa.me/351926388985?text=Olá%2C%20entrei%20em%20contacto%20através%20do%20website%20da%20Auto%20Car%20Viseu." target="_blank" rel="noreferrer" className="contact-card"><span className="whatsapp-mark">◉</span><small>WHATSAPP</small><b>Enviar mensagem</b><span>Fale diretamente connosco</span></a>
      <a href="mailto:rogeriohayla03@gmail.com" className="contact-card"><Phone/><small>E-MAIL</small><b>Enviar e-mail</b><span>rogeriohayla03@gmail.com</span></a>
      <div className="contact-card"><MapPin/><small>LOCALIZAÇÃO</small><b>Viseu, Portugal</b><span>Morada completa a confirmar</span></div>
    </div><p className="contact-disclaimer">O horário de funcionamento e a morada completa serão publicados após confirmação pela oficina.</p></div></section>

    <footer><div className="container footer-inner"><Image src="/logo-autocar.svg" alt="Auto Car Serviços Viseu" width={112} height={72}/><span>© {new Date().getFullYear()} Auto Car Serviços Viseu. Todos os direitos reservados.</span><a href="/admin/login">Área reservada</a></div></footer>
  </main>;
}