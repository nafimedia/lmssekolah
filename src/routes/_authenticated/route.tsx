import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { useIdleTimer } from "@/hooks/useIdleTimer";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const user = MysqlAuthService.getActiveUser();
    if (!user) {
      throw redirect({ to: "/auth" });
    }
    return { user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  // Activate Auto-Logout Idle Timer (120 Menit / 2 Jam)
  useIdleTimer(120 * 60 * 1000);

  return <Outlet />;
}