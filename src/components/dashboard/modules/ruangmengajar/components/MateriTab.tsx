import { useState, useEffect, useCallback } from "react";
import { BookOpen, Video, FileText, Plus, CheckCircle2, ExternalLink, Library, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MysqlDataService } from "@/services/mysqlDataService";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { ViewMaterialDialog, MaterialDetail } from "./ViewMaterialDialog";
import { UploadModulDialog } from "@/components/dashboard/modules/modulajar/components/UploadModulDialog";
import { PickElibraryDialog, ElibraryBookItem } from "./PickElibraryDialog";

export interface TeachingMaterialItem {
  id: string;
  title: string;
  type: "MODUL_AJAR" | "VIDEO" | "SLIDE_PPT" | "EBOOK";
  chapter: string;
  source: string;
  file_url?: string;
  uploaded_by?: string;
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
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isElibraryOpen, setIsElibraryOpen] = useState(false);

  const loadMaterials = useCallback(async () => {
    try {
      const dbItems = await MysqlDataService.getMaterials();
      if (dbItems && dbItems.length > 0) {
        const cleanActiveMapel = activeMapel.toLowerCase().trim();
        const filtered = dbItems.filter((item) => {
          const itemSubject = (item.subject_name || "").toLowerCase().trim();
          if (!itemSubject) return true;
          return itemSubject.includes(cleanActiveMapel) || cleanActiveMapel.includes(itemSubject);
        });

        const sourceItems = filtered.length > 0 ? filtered : dbItems;

        setMaterials(
          sourceItems.map((item, idx) => ({
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
            source: item.subject_name || activeMapel || "Media Pembelajaran LMS",
            file_url: item.file_url,
            uploaded_by: item.uploaded_by,
            selectedForToday: true,
          }))
        );
      } else {
        setMaterials([]);
      }
    } catch (err) {
      console.warn("Error fetching materials in MateriTab:", err);
      setMaterials([]);
    }
  }, [activeMapel]);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  const handleUploadModul = async (data: { title: string; mapel: string; jenjang: string; file: File | null; dataUrl: string }) => {
    if (!data.title.trim()) {
      toast.error("Judul Bahan Ajar wajib diisi!");
      return;
    }

    const newId = "mat_" + Date.now();
    const fileUrlToSave = data.dataUrl || ("/uploads/" + newId + ".pdf");

    const activeUser = MysqlAuthService.getActiveUser();
    const currentTeacherName = activeUser?.full_name || "Guru Pengampu";

    try {
      const res = await MysqlDataService.saveMaterial({
        id: newId,
        title: data.title.trim(),
        subject_name: data.mapel || activeMapel,
        class_name: activeRombel || data.jenjang,
        type: "Modul Ajar",
        status: "Aktif",
        uploaded_by: currentTeacherName,
        teacher_name: currentTeacherName,
        file_url: fileUrlToSave || ("/uploads/" + newId + ".pdf"),
        filename: data.file?.name || `${data.title}.pdf`,
        size: data.file ? `${(data.file.size / 1024).toFixed(0)} KB` : "1.2 MB",
      } as any);

      if (res === false) {
        toast.error("Gagal mengunggah Bahan Ajar ke database.");
        return;
      }

      toast.success(`Bahan Ajar "${data.title}" berhasil diunggah dan siap digunakan di ${activeRombel}!`);
      await loadMaterials();
    } catch (err) {
      console.warn("Save material DB warning:", err);
      toast.error("Gagal mengunggah Bahan Ajar ke database.");
    }
  };

  const handleSelectElibraryBook = async (book: ElibraryBookItem) => {
    const newId = "mat_elib_" + Date.now();
    const activeUser = MysqlAuthService.getActiveUser();
    const currentTeacherName = activeUser?.full_name || "Guru Pengampu";

    let materialType: "Modul Ajar" | "Video Pembelajaran" | "Slide PPT" | "E-Book" = "E-Book";
    if (book.type === "video") materialType = "Video Pembelajaran";
    else if (book.type === "audio") materialType = "Modul Ajar";
    else if (book.title.toLowerCase().includes("ppt") || book.title.toLowerCase().includes("slide")) materialType = "Slide PPT";
    else materialType = "E-Book";

    const targetUrl = book.url || book.video_url || book.audio_url || "";

    try {
      const res = await MysqlDataService.saveMaterial({
        id: newId,
        title: book.title,
        subject_name: activeMapel || book.tag || "Umum",
        class_name: activeRombel || "Semua Kelas",
        type: materialType,
        status: "Aktif",
        uploaded_by: `${currentTeacherName} (via E-Library)`,
        teacher_name: currentTeacherName,
        file_url: targetUrl,
        filename: `${book.title}.${book.type === "video" ? "mp4" : book.type === "audio" ? "mp3" : "pdf"}`,
        size: book.size || "1.0 MB",
      } as any);

      if (res === false) {
        toast.error("Gagal menautkan buku dari E-Library.");
        return;
      }

      toast.success(`Berhasil menautkan "${book.title}" dari E-Library ke Bahan Ajar KBM!`);
      await loadMaterials();
    } catch (err) {
      console.warn("Save elibrary material error:", err);
      toast.error("Gagal menautkan buku dari E-Library.");
    }
  };

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
      <Card className="border-border shadow-xs bg-card">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Materi Pembelajaran Sesi KBM ({activeMapel})
            </CardTitle>
            <CardDescription className="text-xs">
              Bahan ajar dan buku paket yang aktif untuk sesi mengajar {activeRombel}. Pilih dan buka materi yang digunakan hari ini.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-950/50 font-semibold text-xs gap-1.5 shadow-xs"
              onClick={() => setIsElibraryOpen(true)}
            >
              <Library className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Ambil dari E-Library
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 shadow-xs"
              onClick={() => setIsUploadOpen(true)}
            >
              <Upload className="h-4 w-4" /> + Unggah Bahan Ajar
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          {materials.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border rounded-xl space-y-3">
              <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs text-muted-foreground">
                Belum ada bahan ajar yang terdaftar untuk mata pelajaran <strong>{activeMapel}</strong>.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-950/50 font-semibold text-xs gap-1.5"
                  onClick={() => setIsElibraryOpen(true)}
                >
                  <Library className="h-3.5 w-3.5 text-purple-600" /> Ambil dari E-Library
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5"
                  onClick={() => setIsUploadOpen(true)}
                >
                  <Upload className="h-3.5 w-3.5" /> Unggah Bahan Ajar Sekarang
                </Button>
              </div>
            </div>
          ) : (
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

                  <Badge variant={m.selectedForToday ? "default" : "outline"} className="text-[10px] font-semibold shrink-0 gap-1">
                    {m.selectedForToday ? <><CheckCircle2 className="h-3 w-3" /> DIGUNAKAN HARI INI</> : "TIDAK AKTIF"}
                  </Badge>
                </div>

                <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-[11px] font-semibold text-primary gap-1"
                    onClick={() => handleOpenViewMaterial(m)}
                  >
                    <ExternalLink className="h-3 w-3" /> Buka Materi & Preview
                  </Button>

                  <Button
                    size="sm"
                    variant={m.selectedForToday ? "secondary" : "outline"}
                    className="h-7 px-2.5 text-[11px] font-semibold gap-1"
                    onClick={() => handleToggleSelect(m.id)}
                  >
                    {m.selectedForToday ? "Lepas dari Sesi KBM" : <><CheckCircle2 className="h-3 w-3" /> Gunakan Hari Ini</>}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>

      <ViewMaterialDialog
        isOpen={isViewOpen}
        onOpenChange={setIsViewOpen}
        material={selectedMaterialForView}
        activeRombel={activeRombel}
        activeMapel={activeMapel}
      />

      <UploadModulDialog
        isOpen={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        defaultMapel={activeMapel}
        onUpload={handleUploadModul}
      />

      <PickElibraryDialog
        isOpen={isElibraryOpen}
        onOpenChange={setIsElibraryOpen}
        activeRombel={activeRombel}
        activeMapel={activeMapel}
        onSelectBook={handleSelectElibraryBook}
      />
    </>
  );
}
