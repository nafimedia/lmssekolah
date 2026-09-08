import { useState, useEffect } from "react";
import { Smartphone, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already running in standalone PWA mode
    if (
      (typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches) ||
      (typeof window !== "undefined" && (window.navigator as any).standalone)
    ) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed it in this session
    const dismissed = sessionStorage.getItem("lms_pwa_dismissed");
    if (dismissed === "true") return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setIsVisible(false);
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success("🎉 Aplikasi LMS MTsN 2 Cilacap berhasil terpasang di perangkat Anda!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("lms_pwa_dismissed", "true");
  };

  if (!isVisible || isInstalled) return null;

  return (
    <div className="mb-4 p-3 sm:p-4 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-50 via-card to-emerald-50/50 dark:from-emerald-950/40 dark:via-card dark:to-emerald-950/20 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Smartphone className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-1.5">
            Pasang Aplikasi LMS MTsN 2 di HP
            <span className="text-[10px] bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-extrabold uppercase">
              PWA
            </span>
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Akses langsung dari layar utama ponsel Anda tanpa perlu membuka browser secara manual.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <Button
          type="button"
          size="sm"
          onClick={handleInstallClick}
          className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs"
        >
          <Download className="h-3.5 w-3.5" /> Pasang Sekarang
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          title="Tutup banner"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
