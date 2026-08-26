import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error("Root Route Error Caught:", error);
  const router = useRouter();

  const errStr = String(error?.message || error || "");
  const isRedirectOrAuthErr =
    (error as any)?.isRedirect ||
    (error as any)?.to ||
    (error as any)?.statusCode === 307 ||
    (error as any)?.statusCode === 302 ||
    errStr.includes("Redirect") ||
    errStr.includes("401") ||
    errStr.includes("Unauthenticated") ||
    errStr.includes("Sesi");

  useEffect(() => {
    if (isRedirectOrAuthErr && typeof window !== "undefined") {
      window.location.href = "/auth";
    }
  }, [isRedirectOrAuthErr]);

  if (isRedirectOrAuthErr) {
    return null;
  }

  const isChunkError =
    error?.message?.includes("Failed to fetch dynamically imported module") ||
    error?.message?.includes("Importing a module script failed") ||
    String(error).includes("routes--");

  useEffect(() => {
    if (isChunkError && typeof window !== "undefined") {
      const hasReloaded = sessionStorage.getItem("lms_chunk_reloaded");
      if (!hasReloaded) {
        sessionStorage.setItem("lms_chunk_reloaded", "true");
        window.location.reload();
      }
    }
  }, [isChunkError]);

  const handleRetry = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("lms_chunk_reloaded");
      window.location.reload();
    } else {
      router.invalidate();
      reset();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {isChunkError ? "Pembaruan Aplikasi Tersedia" : "Halaman Gagal Dimuat"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isChunkError
            ? "Versi terbaru LMS MTsN 2 Cilacap telah diperbarui. Silakan muat ulang halaman untuk menggunakan versi terbaru."
            : "Terjadi kendala saat memuat halaman. Silakan muat ulang halaman atau kembali ke beranda."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={handleRetry}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Muat Ulang Halaman (Try Again)
          </button>
          <a
            href="/auth"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Halaman Login
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "LMS MTs — Dashboard" },
      { name: "description", content: "Learning Management System MTs Negeri 2 Cilacap" },
      { name: "author", content: "MTs Negeri 2 Cilacap" },
      { property: "og:title", content: "LMS MTs — Dashboard" },
      { property: "og:description", content: "Learning Management System MTs Negeri 2 Cilacap" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "LMS MTs — Dashboard" },
      { name: "twitter:description", content: "Learning Management System MTs Negeri 2 Cilacap" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/400009d2-a0c2-4ff4-a4fc-e092d97ad72f/id-preview-1f3a6f0b--95bff19f-785d-4852-8073-ec3b3bd580ce.lovable.app-1784005379084.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/400009d2-a0c2-4ff4-a4fc-e092d97ad72f/id-preview-1f3a6f0b--95bff19f-785d-4852-8073-ec3b3bd580ce.lovable.app-1784005379084.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if (typeof window !== "undefined" && !window.process) { window.process = { env: {} }; }`,
          }}
        />
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { Toaster } from "@/components/ui/sonner";

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    const handleChunkError = (e: ErrorEvent | PromiseRejectionEvent) => {
      const msg = "reason" in e ? (e.reason?.message || String(e.reason)) : e.message;
      if (msg && (msg.includes("Failed to fetch dynamically imported module") || msg.includes("Importing a module script failed"))) {
        const reloaded = sessionStorage.getItem("lms_chunk_reloaded");
        if (!reloaded) {
          sessionStorage.setItem("lms_chunk_reloaded", "true");
          window.location.reload();
        }
      }
    };

    window.addEventListener("error", handleChunkError);
    window.addEventListener("unhandledrejection", handleChunkError);
    return () => {
      window.removeEventListener("error", handleChunkError);
      window.removeEventListener("unhandledrejection", handleChunkError);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
