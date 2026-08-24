import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, GraduationCap, LucideIcon, Sparkles } from "lucide-react";

interface StudentHeaderBannerProps {
  title: string;
  subtitle: string;
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
  studentClass = "Kelas VIII A",
  studentNisn,
  statusText = "Siswa Aktif MTsN 2 Cilacap",
  statusVariant = "success",
  actionButtons,
}: StudentHeaderBannerProps) {
  const getStatusBadgeStyle = () => {
    switch (statusVariant) {
      case "success":
        return "bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-2xs";
      case "info":
        return "bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-2xs";
      case "warning":
        return "bg-amber-500 hover:bg-amber-600 text-white font-extrabold shadow-2xs";
      default:
        return "bg-muted text-muted-foreground font-bold border border-border";
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-border/70">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Icon className={`h-6 w-6 ${iconColorClass}`} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            {title}
          </h1>
          <Badge className="bg-emerald-600 text-white font-extrabold text-xs px-2.5 py-0.5 shadow-2xs gap-1">
            <GraduationCap className="h-3.5 w-3.5" /> {studentClass}
          </Badge>
          {studentNisn && (
            <Badge variant="outline" className="font-mono font-bold text-xs border-border">
              NISN: {studentNisn}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground font-medium pl-0.5">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
        {statusText && (
          <Badge className={`text-xs px-3 py-1 font-bold flex items-center gap-1.5 ${getStatusBadgeStyle()}`}>
            <Sparkles className="h-3.5 w-3.5" /> {statusText}
          </Badge>
        )}
        {actionButtons}
      </div>
    </div>
  );
}
