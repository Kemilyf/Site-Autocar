import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function getAdminContext() {
  const authClient = await createSupabaseServerClient();
  const { data: { user }, error } = await authClient.auth.getUser();
  if (error || !user) return null;

  const adminClient = createSupabaseAdminClient();
  const { data: profile } = await adminClient
    .from("admin_users").select("id,name,email,active")
    .eq("auth_user_id", user.id).eq("active", true).maybeSingle();

  if (!profile) return null;
  return { user, profile, db: adminClient };
}

export async function requireAdmin() {
  const context = await getAdminContext();
  if (!context) throw new Error("UNAUTHORIZED");
  return context;
}