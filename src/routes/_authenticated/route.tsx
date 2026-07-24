import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    const demoUserStr = typeof window !== "undefined" ? localStorage.getItem("lms_demo_user") : null;
    if (!data.user && !demoUserStr) {
      throw redirect({ to: "/auth" });
    }
    const demoUser = demoUserStr ? JSON.parse(demoUserStr) : null;
    return { user: data.user || demoUser };
  },
  component: () => <Outlet />,
});