import React, { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Send,
  BookMarked,
  UserCheck,
  BookOpen,
  Check,
  Megaphone,
  Calendar,
} from "lucide-react";
import { MysqlDataService } from "@/services/mysqlDataService";
import { toast } from "sonner";

export interface NotificationItem {
  id: string;
  category: "wa" | "tahfidz" | "presensi" | "akademik";
  title: string;
  desc: string;
  time: string;
  isRead: boolean;
  targetTab?: string;
  isWaTrigger?: boolean;
}

interface NotificationCenterPopoverProps {
  setActiveTab: (key: string) => void;
  onOpenWaModal?: () => void;
}

export function NotificationCenterPopover({
  setActiveTab,
  onOpenWaModal,
}: NotificationCenterPopoverProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchRealNotifications = async () => {
    setIsLoading(true);
    try {
      const items: NotificationItem[] = [];

      // 1. Fetch Real WA Gateway Logs
      const waLogs = await MysqlDataService.getWaLogs().catch(() => []);
      if (waLogs && waLogs.length > 0) {
        waLogs.slice(0, 3).forEach((w: any) => {
          items.push({
            id: `wa_${w.id || Date.now()}_${Math.random()}`,
            category: "wa",
            title: `📲 WA Alert: ${w.category || "Presensi"}`,
            desc: `Pesan ke ${w.parent_name || "Orang Tua"} (${w.phone || w.student_name}): "${(w.message || "").slice(0, 65)}..."`,
            time: w.created_at ? new Date(w.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "Baru saja",
            isRead: false,
            isWaTrigger: true,
          });
        });
      }

      // 2. Fetch Real Tahfidz Setoran Records
      const hafalanList = await MysqlDataService.getHafalan().catch(() => []);
      if (hafalanList && hafalanList.length > 0) {
        hafalanList.slice(0, 3).forEach((h: any) => {
          items.push({
            id: `hafalan_${h.id || Date.now()}_${Math.random()}`,
            category: "tahfidz",
            title: `📖 Setoran Tahfidz ${h.juz}`,
            desc: `${h.student_name || "Siswa"} menyetorkan ${h.surah} (${h.ayat}) — Status: ${h.status} (Nilai: ${h.nilai}).`,
            time: h.tgl || "Baru saja",
            isRead: false,
            targetTab: "tahfidz",
          });
        });
      }

      // 3. Fetch Real Announcements
      const announcements = await MysqlDataService.getAnnouncements().catch(() => []);
      if (announcements && announcements.length > 0) {
        announcements.slice(0, 2).forEach((a: any) => {
          items.push({
            id: `ann_${a.id || Date.now()}_${Math.random()}`,
            category: "akademik",
            title: `📢 Pengumuman: ${a.title}`,
            desc: (a.content || "").slice(0, 75) + "...",
            time: a.date || "Terbaru",
            isRead: false,
            targetTab: "pengumuman",
          });
        });
      }

      // 4. Fetch Real Agendas / Kalender Event
      const agendas = await MysqlDataService.getAgendas().catch(() => []);
      if (agendas && agendas.length > 0) {
        agendas.slice(0, 2).forEach((ag: any) => {
          items.push({
            id: `agenda_${ag.id || Date.now()}_${Math.random()}`,
            category: "presensi",
            title: `📅 Agenda Kalender: ${ag.title}`,
            desc: `Jadwal pelaksanaan: ${ag.event_date || "Mendatang"} (${ag.time || "WIB"}).`,
            time: ag.event_date || "Kalender",
            isRead: true,
            targetTab: "agenda",
          });
        });
      }

      setNotifications(items);
    } catch (err) {
      console.error("[NotificationCenter Error]:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success("✅ Seluruh notifikasi ditandai telah dibaca.");
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );

    if (item.isWaTrigger && onOpenWaModal) {
      onOpenWaModal();
    } else if (item.targetTab) {
      setActiveTab(item.targetTab);
    }
  };

  const filteredItems = notifications.filter((n) => {
    if (filterCategory === "all") return true;
    return n.category === filterCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "wa":
        return <Send className="h-4 w-4 text-emerald-500 shrink-0" />;
      case "tahfidz":
        return <BookMarked className="h-4 w-4 text-emerald-600 shrink-0" />;
      case "presensi":
        return <UserCheck className="h-4 w-4 text-amber-500 shrink-0" />;
      default:
        return <BookOpen className="h-4 w-4 text-blue-500 shrink-0" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 sm:h-9 sm:w-9"
          title="Pusat Notifikasi Madrasah"
          onClick={fetchRealNotifications}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-extrabold text-white ring-2 ring-background animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 sm:w-96 p-0 shadow-lg border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-primary" /> Notifikasi MTsN 2
            </h4>
            {unreadCount > 0 && (
              <Badge variant="outline" className="text-[10px] font-extrabold bg-red-500/10 text-red-600 border-red-500/30">
                {unreadCount} Real
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="h-7 text-[10px] font-bold text-muted-foreground hover:text-foreground"
            >
              <Check className="h-3 w-3 mr-1 text-emerald-500" /> Tandai Dibaca
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-2 border-b border-border/60 bg-background text-[11px] overflow-x-auto">
          {[
            { id: "all", label: "Semua" },
            { id: "wa", label: "📲 WA Gateway" },
            { id: "tahfidz", label: "📖 Tahfidz" },
            { id: "presensi", label: "⚠️ Presensi & Agenda" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-2.5 py-1 rounded-md font-semibold transition shrink-0 ${
                filterCategory === tab.id
                  ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List Items */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
              Memuat notifikasi data riil database...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Belum ada notifikasi baru dalam kategori ini.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`p-3 text-xs flex items-start gap-3 transition cursor-pointer hover:bg-muted/50 ${
                  !item.isRead ? "bg-emerald-500/5 font-medium" : "opacity-80"
                }`}
              >
                <div className="p-2 rounded-lg bg-background border border-border shadow-2xs shrink-0 mt-0.5">
                  {getCategoryIcon(item.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-foreground truncate">{item.title}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">
                    {item.desc}
                  </p>
                </div>
                {!item.isRead && (
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
