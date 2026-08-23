import { useState, useEffect } from "react";
import { BookOpen, Video, FileText, Plus, CheckCircle2, ExternalLink, Library } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MysqlDataService } from "@/services/mysqlDataService";
import { ViewMaterialDialog, MaterialDetail } from "./ViewMaterialDialog";

export interface TeachingMaterialItem {
  id: string;
  title: string;
  type: "MODUL_AJAR" | "VIDEO" | "SLIDE_PPT" | "EBOOK";
  chapter: string;
  source: string;
  selectedForToday: boolean;
}

interface MateriTabProps {
  activeRombel: string;
  activeMapel: string;
}

export function MateriTab({ activeRombel, activeMapel }: MateriTabProps) {
  const [materials, setMaterials] = useState<TeachingMaterialItem[]>([]);

  const [selectedMaterialForView, setSelectedMaterialForView] = useState<MaterialDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  useEffect(() => {
    MysqlDataService.getMaterials().then((dbItems) => {
      if (dbItems) {
        setMaterials(
          dbItems.map((item, idx) => ({
            id: String(item.id || idx),
            title: item.title,
            type: ((item.type || "").toUpperCase().includes("VIDEO")
              ? "VIDEO"
              : (item.type || "").toUpperCase().includes("PPT")
              ? "SLIDE_PPT"
              : (item.type || "").toUpperCase().includes("EBOOK")
              ? "EBOOK"
              : "MODUL_AJAR") as any,
            chapter: item.class_name || "Materi KBM",
            source: item.subject_name || "Media Pembelajaran LMS",
            selectedForToday: true,
          }))
        );
      } else {
        setMaterials([]);
      }
    });
  }, [activeMapel]);

  const handleToggleSelect = (id: string) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, selectedForToday: !m.selectedForToday } : m))
    );
  };

  const handleOpenViewMaterial = (m: TeachingMaterialItem) => {
    setSelectedMaterialForView(m);
    setIsViewOpen(true);
  };

  return (
    <>
      <Card className="border-border shadow-sm bg-card">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Materi Pembelajaran Sesi KBM ({activeMapel})
            </CardTitle>
            <CardDescription className="text-xs">
              Bahan ajar langsung terhubung dengan master <strong>Perangkat Ajar</strong>. Pilih dan buka materi yang digunakan untuk {activeRombel} hari ini.
            </CardDescription>
          </div>

          <Button
            size="sm"
            className="bg-primary text-primary-foreground font-bold text-xs gap-1"
            onClick={() => toast.info("⚡ Membuka repositori master Perangkat Ajar...")}
          >
            <Plus className="h-4 w-4" /> Ambil dari Perangkat Ajar
          </Button>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {materials.map((m) => (
              <div
                key={m.id}
                className={`p-4 rounded-xl border transition-all ${
                  m.selectedForToday
                    ? "border-primary/50 bg-primary/5 dark:bg-primary/10 shadow-xs"
                    : "border-border bg-card hover:bg-muted/30"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {m.type === "MODUL_AJAR" && <FileText className="h-5 w-5 text-emerald-600 shrink-0" />}
                    {m.type === "VIDEO" && <Video className="h-5 w-5 text-blue-600 shrink-0" />}
                    {m.type === "SLIDE_PPT" && <BookOpen className="h-5 w-5 text-amber-600 shrink-0" />}
                    {m.type === "EBOOK" && <Library className="h-5 w-5 text-purple-600 shrink-0" />}

                    <div>
                      <h4 className="font-bold text-xs text-foreground line-clamp-1">{m.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{m.source} · {m.chapter}</p>
                    </div>
                  </div>

                  <Badge variant={m.selectedForToday ? "default" : "outline"} className="text-[10px] font-bold shrink-0 gap-1">
                    {m.selectedForToday ? <><CheckCircle2 className="h-3 w-3" /> DIGUNAKAN HARI INI</> : "TIDAK AKTIF"}
                  </Badge>
                </div>

                <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-[11px] font-bold text-primary gap-1"
                    onClick={() => handleOpenViewMaterial(m)}
                  >
                    <ExternalLink className="h-3 w-3" /> Buka Materi & Preview
                  </Button>

                  <Button
                    size="sm"
                    variant={m.selectedForToday ? "secondary" : "outline"}
                    className="h-7 px-2.5 text-[11px] font-bold gap-1"
                    onClick={() => handleToggleSelect(m.id)}
                  >
                    {m.selectedForToday ? "Lepas dari Sesi KBM" : <><CheckCircle2 className="h-3 w-3" /> Gunakan Hari Ini</>}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ViewMaterialDialog
        isOpen={isViewOpen}
        onOpenChange={setIsViewOpen}
        material={selectedMaterialForView}
        activeRombel={activeRombel}
        activeMapel={activeMapel}
      />
    </>
  );
}
