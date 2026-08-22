import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw, LogIn, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  requestId: string;
  isUnauthenticated: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    requestId: "",
    isUnauthenticated: false,
  };

  public static getDerivedStateFromError(error: any): State {
    // 1. DO NOT catch TanStack Router redirects! Let TanStack Router navigate smoothly.
    if (
      error &&
      (error.isRedirect ||
        error.to ||
        error.href ||
        error?.statusCode === 307 ||
        error?.statusCode === 302 ||
        error?.name === "Redirect" ||
        (typeof error === "object" && "to" in error) ||
        String(error).includes("Redirect") ||
        String(error?.message).includes("Redirect"))
    ) {
      return {
        hasError: false,
        error: null,
        requestId: "",
        isUnauthenticated: false,
      };
    }

    // 2. Check if error is unauthenticated / session expired
    const errStr = String(error?.message || error || "");
    const isUnauth =
      errStr.includes("401") ||
      errStr.includes("Unauthenticated") ||
      errStr.includes("Sesi Anda telah berakhir");

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let id = "";
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return {
      hasError: true,
      error,
      requestId: `ERR-${id}`,
      isUnauthenticated: isUnauth,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errStr = String(error?.message || error);
    if (!errStr.includes("Redirect") && !(error as any)?.isRedirect) {
      console.error("[ErrorBoundary caught an error]:", error, errorInfo);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, requestId: "", isUnauthenticated: false });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Specialized UI for Session Expired / Unauthenticated Access
      if (this.state.isUnauthenticated) {
        return (
          <div className="min-h-[60vh] w-full flex flex-col items-center justify-center p-6 text-center bg-background">
            <div className="max-w-md w-full p-8 rounded-2xl border border-border bg-card shadow-lg space-y-5">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 grid place-items-center font-bold">
                <ShieldAlert className="h-8 w-8" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">Sesi Login Telah Berakhir</h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Sesi masuk Anda telah berakhir demi keamanan data. Silakan login kembali ke akun Anda untuk melanjutkan.
                </p>
              </div>

              <div className="pt-2">
                <Button className="w-full text-xs font-bold gap-2 bg-primary text-primary-foreground py-2.5" onClick={() => (window.location.href = "/auth")}>
                  <LogIn className="h-4 w-4" /> Login Kembali Sekarang
                </Button>
              </div>
            </div>
          </div>
        );
      }

      // Generic System Error UI
      return (
        <div className="min-h-[60vh] w-full flex flex-col items-center justify-center p-6 text-center bg-background">
          <div className="max-w-md w-full p-8 rounded-2xl border border-border bg-card shadow-lg space-y-5">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-destructive/15 text-destructive grid place-items-center font-bold">
              <AlertCircle className="h-8 w-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground">Terjadi Kesalahan Sistem</h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Aplikasi mengalami kendala teknis saat memproses halaman ini. Mohon maaf atas ketidaknyamanan Anda.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs font-mono text-muted-foreground flex items-center justify-between">
              <span>Kode Referensi Error:</span>
              <span className="font-bold text-foreground">{this.state.requestId}</span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button variant="outline" className="flex-1 text-xs font-bold gap-2" onClick={() => (window.location.href = "/auth")}>
                <LogIn className="h-4 w-4" /> Halaman Login
              </Button>
              <Button className="flex-1 text-xs font-bold gap-2 bg-primary text-primary-foreground" onClick={this.handleRetry}>
                <RefreshCw className="h-4 w-4" /> Coba Lagi
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
