import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";
export const dynamic="force-dynamic";
export default async function AdminLoginPage() {
  const admin=await getAdminContext();
  if(admin) redirect("/admin");
  return <main className="admin-auth-shell"><div className="admin-auth-card"><a href="/" className="back-link">← Voltar ao website</a><img src="/logo-autocar.svg" alt="Auto Car Serviços Viseu" className="admin-logo"/><div className="eyebrow dark"><span/> ÁREA RESERVADA</div><h1>Acesso da oficina</h1><p>Entre com as credenciais do administrador para gerir marcações, serviços e horários.</p><LoginForm/></div></main>;
}