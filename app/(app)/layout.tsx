import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/layout/app-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  return (
    <div className="min-h-screen bg-muted/30">
      <AppNav email={data.user.email ?? null} />
      <main className="container py-6 md:py-8">{children}</main>
    </div>
  );
}
