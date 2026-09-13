import { useState, useEffect, useCallback } from "react";
import { BookOpen, Video, FileText, Plus, Check, Eye, Library, Upload, Music, Image as ImageIcon, Globe, Lock, Unlock, FileEdit, CheckCircle2, ListOrdered, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MysqlDataService } from "@/services/mysqlDataService";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { ViewMaterialDialog, MaterialDetail } from "./ViewMaterialDialog";
import { UploadModulDialog, UploadModulPayload } from "@/components/dashboard/modules/modulajar/components/UploadModulDialog";
import { PickElibraryDialog, ElibraryBookItem } from "./PickElibraryDialog";

export interface TeachingMaterialItem {
  id: string;
  title: string;
  type: "MODUL_AJAR" | "VIDEO" | "SLIDE_PPT" | "EBOOK" | "AUDIO" | "GAMBAR" | "URL" | "TEKS";
  chapter: string;
  source: string;
  file_url?: string;
  uploaded_by?: string;
  selectedForToday: boolean;
  status?: string;
  sequence_order?: number;
  access_mode?: "GURU_KONTROL" | "SISWA_MANDIRI" | string;
  content_text?: string;
  completionCount?: number;
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
      const [dbItems, allCompletions] = await Promise.all([
        MysqlDataService.getMaterials(),
        MysqlDataService.getMaterialCompletions().catch(() => []),
      ]);

      if (dbItems && dbItems.length > 0) {
        const cleanActiveMapel = activeMapel.toLowerCase().trim();
        const filtered = dbItems.filter((item) => {
          const itemSubject = (item.subject_name || "").toLowerCase().trim();
          if (!itemSubject) return true;
          return itemSubject.includes(cleanActiveMapel) || cleanActiveMapel.includes(itemSubject);
        });

        const sourceItems = filtered.length > 0 ? filtered : dbItems;

        const formatted = sourceItems.map((item, idx) => {
          const rawType = (item.type || "").toUpperCase();
          let parsedType: "MODUL_AJAR" | "VIDEO" | "SLIDE_PPT" | "EBOOK" | "AUDIO" | "GAMBAR" | "URL" | "TEKS" = "MODUL_AJAR";

          if (rawType.includes("AUDIO") || item.filename?.endsWith(".mp3") || item.file_url?.endsWith(".mp3")) {
            parsedType = "AUDIO";
          } else if (rawType.includes("TEKS")) {
            parsedType = "TEKS";
          } else if (rawType.includes("GAMBAR") || item.file_url?.match(/\.(png|jpg|jpeg|webp)$/i)) {
            parsedType = "GAMBAR";
          } else if (rawType.includes("URL") || item.file_url?.startsWith("http")) {
            parsedType = "URL";
          } else if (rawType.includes("VIDEO")) {
            parsedType = "VIDEO";
          } else if (rawType.includes("PPT")) {
            parsedType = "SLIDE_PPT";
          } else if (rawType.includes("EBOOK")) {
            parsedType = "EBOOK";
          }

          const rawStatus = (item.status || "Aktif").trim();
          const isUnlocked = rawStatus.toLowerCase() !== "terkunci" && rawStatus.toLowerCase() !== "sembunyi";
          const doneCount = (allCompletions || []).filter((c: any) => String(c.material_id) === String(item.id)).length;

          return {
            id: String(item.id || idx),
            title: item.title,
            type: parsedType,
            chapter: item.class_name || "Materi KBM",
            source: item.subject_name || activeMapel || "Media Pembelajaran LMS",
            file_url: item.file_url,
            uploaded_by: item.uploaded_by,
            selectedForToday: isUnlocked,
            status: isUnlocked ? "Aktif" : "Terkunci",
            sequence_order: Number(item.sequence_order) || idx + 1,
            access_mode: (item.access_mode as any) || "GURU_KONTROL",
            content_text: item.content_text,
            completionCount: doneCount,
          };
        });

        formatted.sort((a, b) => (a.sequence_order || 1) - (b.sequence_order || 1));
        setMaterials(formatted);
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

  const handleUploadModul = async (data: UploadModulPayload) => {
    if (!data.title.trim()) {
      toast.error("Judul Bahan Ajar wajib diisi!");
      return;
    }

    const isUrl = data.jenisBahan === "URL";
    const isVideo = data.jenisBahan === "VIDEO";
    const isTeks = data.jenisBahan === "TEKS";
    const newId = "mat_" + Date.now();
    let ext = "pdf";
    if (data.file?.name?.includes(".")) {
      ext = data.file.name.split(".").pop() || "pdf";
    } else if (data.jenisBahan === "AUDIO") {
      ext = "mp3";
    } else if (data.jenisBahan === "GAMBAR") {
      ext = "png";
    } else if (data.jenisBahan === "VIDEO") {
      ext = "mp4";
    }

    const fileUrlToSave =
      isUrl || (isVideo && data.externalUrl)
        ? (data.externalUrl || "")
        : isTeks
        ? ""
        : (data.dataUrl || `/uploads/${newId}.${ext}`);

    const activeUser = MysqlAuthService.getActiveUser();
    const currentTeacherName = activeUser?.full_name || "Guru Pengampu";

    try {
      const res = await MysqlDataService.saveMaterial({
        id: newId,
        title: data.title.trim(),
        subject_name: data.mapel || activeMapel,
        class_name: activeRombel || data.jenjang,
        type: data.jenisBahan,
        status: "Aktif",
        uploaded_by: currentTeacherName,
        teacher_name: currentTeacherName,
        file_url: fileUrlToSave,
        filename: data.file?.name || (isUrl ? "Tautan Pembelajaran" : isTeks ? "Catatan Rangkuman KBM" : `${data.title}.${ext}`),
        size: isUrl ? "Link Web" : isTeks ? `${data.content_text?.length || 0} Karakter` : data.file ? `${(data.file.size / 1024).toFixed(0)} KB` : "1.2 MB",
        sequence_order: data.sequence_order || 1,
        access_mode: data.access_mode || "GURU_KONTROL",
        content_text: data.content_text || null,
      } as any);

      if (res === false) {
        toast.error("Gagal mengunggah Bahan Ajar ke database.");
        return;
      }

      toast.success(`Bahan Ajar "${data.title}" berhasil disimpan (Urutan #${data.sequence_order || 1})!`);
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

  const handleToggleSelect = async (m: TeachingMaterialItem) => {
    const nextStatus = m.selectedForToday ? "Terkunci" : "Aktif";
    setMaterials((prev) =>
      prev.map((item) =>
        item.id === m.id
          ? { ...item, selectedForToday: !item.selectedForToday, status: nextStatus }
          : item
      )
    );

    try {
      await MysqlDataService.updateMaterialStatus(m.id, nextStatus);
      if (nextStatus === "Aktif") {
        toast.success(`🔓 Akses materi "${m.title}" berhasil dibuka untuk siswa!`);
      } else {
        toast.success(`🔒 Akses materi "${m.title}" dikunci / disembunyikan dari siswa.`);
      }
    } catch (e) {
      console.warn("Gagal update status materi:", e);
    }
  };

  const handleOpenViewMaterial = (m: TeachingMaterialItem) => {
    setSelectedMaterialForView(m);
    setIsViewOpen(true);
  };

  return (
    <>
      <Card className="border-border shadow-xs bg-card overflow-hidden">
        {/* Header Bersih & Ringkas (Clean UI Mobile-First) */}
        <div className="p-3 sm:p-4 border-b border-border flex items-center justify-between gap-2 bg-muted/15">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-sm font-bold truncate text-foreground">
                  Bahan Ajar KBM
                </h3>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-mono font-semibold">
                  {materials.length}
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground truncate hidden sm:block">
                {activeMapel} · {activeRombel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2.5 text-xs font-semibold gap-1.5 border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-950/50"
              onClick={() => setIsElibraryOpen(true)}
              title="Ambil dari E-Library"
            >
              <Library className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span className="hidden sm:inline">E-Library</span>
            </Button>
            <Button
              size="sm"
              className="h-8 px-2.5 text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => setIsUploadOpen(true)}
              title="Unggah Bahan Ajar"
            >
              <Upload className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">+ Unggah</span>
              <span className="sm:hidden">Unggah</span>
            </Button>
          </div>
        </div>

        <CardContent className="p-3 sm:p-4 space-y-3">
          {materials.length === 0 ? (
            <div className="p-6 sm:p-8 text-center border border-dashed border-border rounded-xl space-y-3">
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
                  <Library className="h-3.5 w-3.5 text-purple-600" /> E-Library
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5"
                  onClick={() => setIsUploadOpen(true)}
                >
                  <Upload className="h-3.5 w-3.5" /> Unggah Sekarang
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {materials.map((m) => (
              <div
                key={m.id}
                className={`p-3 rounded-xl border transition-all ${
                  m.selectedForToday
                    ? "border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-xs"
                    : "border-border bg-card hover:bg-muted/30"
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                      {m.type === "MODUL_AJAR" && <FileText className="h-4 w-4 text-emerald-600" />}
                      {m.type === "VIDEO" && <Video className="h-4 w-4 text-blue-600" />}
                      {m.type === "TEKS" && <FileEdit className="h-4 w-4 text-purple-600" />}
                      {m.type === "SLIDE_PPT" && <BookOpen className="h-4 w-4 text-amber-600" />}
                      {m.type === "EBOOK" && <Library className="h-4 w-4 text-purple-600" />}
                      {m.type === "AUDIO" && <Music className="h-4 w-4 text-amber-600" />}
                      {m.type === "GAMBAR" && <ImageIcon className="h-4 w-4 text-purple-600" />}
                      {m.type === "URL" && <Globe className="h-4 w-4 text-sky-600" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className="text-[9px] font-mono px-1.5 py-0 border-emerald-500/40 text-emerald-700 dark:text-emerald-300">
                          #{m.sequence_order || 1}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={`text-[9px] px-1.5 py-0 font-medium ${
                            m.access_mode === "SISWA_MANDIRI"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                          }`}
                        >
                          {m.access_mode === "SISWA_MANDIRI" ? "🏡 Mandiri (PR)" : "🏫 Tatap Muka"}
                        </Badge>
                        {m.access_mode === "SISWA_MANDIRI" && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-emerald-400 text-emerald-600 flex items-center gap-0.5">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            {m.completionCount || 0} Selesai
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-bold text-xs text-foreground truncate mt-0.5">{m.title}</h4>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{m.source} · {m.chapter}</p>
                    </div>
                  </div>

                  <Badge
                    variant={m.selectedForToday ? "default" : "outline"}
                    className={`text-[10px] font-semibold shrink-0 px-2 py-0.5 ${
                      m.selectedForToday
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                    }`}
                  >
                    {m.selectedForToday ? "🔓 Terbuka" : "🔒 Terkunci (Hidden)"}
                  </Badge>
                </div>

                <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2.5 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/5 gap-1.5"
                    onClick={() => handleOpenViewMaterial(m)}
                  >
                    <Eye className="h-3.5 w-3.5" /> Buka
                  </Button>

                  <Button
                    size="sm"
                    variant={m.selectedForToday ? "outline" : "default"}
                    className={`h-7 px-2.5 text-xs font-semibold gap-1.5 ${
                      m.selectedForToday
                        ? "border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                    }`}
                    onClick={() => handleToggleSelect(m)}
                    title={m.selectedForToday ? "Kunci materi agar siswa fokus ke materi sebelumnya" : "Buka materi ini untuk diakses siswa"}
                  >
                    {m.selectedForToday ? (
                      <>
                        <Lock className="h-3 w-3" /> Kunci Akses
                      </>
                    ) : (
                      <>
                        <Unlock className="h-3 w-3" /> Buka Siswa
                      </>
                    )}
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
