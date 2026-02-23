import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/supabase";
import { ADMIN_ROLES, CLIENT_ROLES } from "@/lib/constants";

export interface AppUser {
  id: string;
  auth_uid: string;
  org_id: string;
  client_id: string | null;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
}

export async function getAppUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("auth_uid", user.id)
    .single();

  return data as AppUser | null;
}

export function isAdminRole(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}

export function isClientRole(role: UserRole): boolean {
  return CLIENT_ROLES.includes(role);
}

export function getHomePathForRole(role: UserRole): string {
  if (isAdminRole(role)) return "/admin/dashboard";
  return "/client/dashboard";
}
