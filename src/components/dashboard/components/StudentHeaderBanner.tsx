import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, GraduationCap, LucideIcon, Sparkles } from "lucide-react";

interface StudentHeaderBannerProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColorClass?: string;
  studentClass?: string;
  studentNisn?: string;
  statusText?: string;
  statusVariant?: "success" | "info" | "warning" | "neutral";
  actionButtons?: ReactNode;
}

export function StudentHeaderBanner({
  title,
  subtitle,
  icon: Icon,
  iconColorClass = "text-emerald-600 dark:text-emerald-400",
  studentClass,
  studentNisn,
  statusText = "Siswa Aktif MTsN 2 Cilacap",
  statusVariant = "success",
  actionButtons,
}: StudentHeaderBannerProps) {
  const getStatusBadgeStyle = () => {
    switch (statusVariant) {
      case "success":
        return "bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-2xs";
      case "info":
        return "bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-2xs";
      case "warning":
        return "bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-2xs";
      default:
        return "bg-muted text-muted-foreground font-medium border border-border";
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 sm:pb-4 mb-3 sm:mb-5 border-b border-border/70 font-sans">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColorClass}`} />
          </div>
          <h1 className="text-base sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-1.5">
            {title}
          </h1>
          {studentClass && studentClass.trim() !== "" && (
            <Badge className="bg-emerald-600 text-white font-bold text-[10px] sm:text-xs px-2 py-0.5 shadow-2xs gap-1">
              <GraduationCap className="h-3 w-3" /> {studentClass}
            </Badge>
          )}
          {studentNisn && (
            <Badge variant="outline" className="font-mono font-semibold text-[10px] sm:text-xs border-border py-0 px-1.5">
              NISN: {studentNisn}
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground truncate hidden sm:block">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
        {statusText && (
          <Badge className={`text-[10px] sm:text-xs px-2.5 py-0.5 font-semibold flex items-center gap-1.5 ${getStatusBadgeStyle()}`}>
            <Sparkles className="h-3 w-3" /> {statusText}
          </Badge>
        )}
        {actionButtons}
      </div>
    </div>
  );
}
