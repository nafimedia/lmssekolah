import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { useIdleTimer } from "@/hooks/useIdleTimer";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    try {
      const user = await MysqlAuthService.getValidSession();
      if (!user) {
        throw redirect({ to: "/auth" });
      }
      return { user };
    } catch (err: any) {
      if (err?.isRedirect || err?.to || err?.statusCode || err?.name === "Redirect" || String(err).includes("Redirect")) {
        throw err;
      }
      throw redirect({ to: "/auth" });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  // Activate Auto-Logout Idle Timer (120 Menit / 2 Jam)
  useIdleTimer(120 * 60 * 1000);

  return <Outlet />;
}