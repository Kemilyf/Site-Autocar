import "./admin.css";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/auth";
import { AdminDashboard } from "@/components/admin-dashboard";
export const dynamic="force-dynamic";
export default async function AdminPage() {
 const context=await getAdminContext();if(!context)redirect("/admin/login");
 const {db,profile}=context;
 const [{data:appointments},{data:estimates},{data:services},{data:hours},{data:connection}]=await Promise.all([
  db.from("appointments").select("id,start_at,end_at,status,notes,google_event_id,google_sync_status,google_sync_error,customers(name,phone),services(name),vehicles(registration,make,model)").order("start_at",{ascending:false}).limit(40),
  db.from("estimates").select("id,created_at,status,estimated_total,workshop_quote,problem_description,customers(name,phone),services(name),vehicles(registration,make,model)").order("created_at",{ascending:false}).limit(40),
  db.from("services").select("id,name,price_mode,base_price,duration_minutes,active,price_includes_vat,vat_rate").order("name"),
  db.from("business_hours").select("*").order("day_of_week"),
  db.from("google_calendar_connections").select("calendar_id,connected_email,connected_at").eq("id",1).maybeSingle()
 ]);
 return <AdminDashboard adminName={profile.name} appointments={(appointments||[]) as any[]} estimates={(estimates||[]) as any[]} services={services||[]} hours={hours||[]} googleConnected={Boolean(connection)} calendarId={connection?.calendar_id||null}/>;
}