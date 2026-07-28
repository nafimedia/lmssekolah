import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { toast } from "sonner";

// Default idle timeout 120 menit (7,200,000 ms)
const IDLE_TIMEOUT_MS = 120 * 60 * 1000;

export function useIdleTimer(timeoutMs: number = IDLE_TIMEOUT_MS) {
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      handleIdleLogout();
    }, timeoutMs);
  };

  const handleIdleLogout = () => {
    const activeUser = MysqlAuthService.getActiveUser();
    if (activeUser) {
      MysqlAuthService.logout();
      toast.error("Sesi Anda telah berakhir karena tidak ada aktivitas selama 120 menit. Silakan masuk kembali.");
      navigate({ to: "/auth", replace: true });
    }
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    // Set initial timer
    resetTimer();

    const handleUserActivity = () => {
      resetTimer();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [timeoutMs]);
}
