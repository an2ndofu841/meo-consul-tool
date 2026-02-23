import { redirect } from "next/navigation";

// Middleware handles role-based redirect for "/"
// This page is a fallback
export const dynamic = "force-dynamic";

export default function RootPage() {
  redirect("/login");
}
