import { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Video,
  FileText,
  Plus,
  Check,
  Eye,
  EyeOff,
  Library,
  Upload,
  Music,
  Image as ImageIcon,
  Globe,
  Lock,
  Unlock,
  FileEdit,
  CheckCircle2,
  ListOrdered,
  Users,
  ArrowLeft,
  ArrowRight,
  FolderPlus,
  FolderCheck,
  Edit3,
  Trash2,
  Layers,
  BookMarked,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { MysqlDataService, LearningTopicRow } from "@/services/mysqlDataService";
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
  topic_id?: string | null;
}

interface MateriTabProps {
  activeRombel: string;
  activeMapel: string;
}

export function MateriTab({ activeRombel, activeMapel }: MateriTabProps) {
  const [topics, setTopics] = useState<LearningTopicRow[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<LearningTopicRow | null>(null);
  const [materials, setMaterials] = useState<TeachingMaterialItem[]>([]);
  const [selectedMaterialForView, setSelectedMaterialForView] = useState<MaterialDetail | null>(null);

  // Dialogs
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isElibraryOpen, setIsElibraryOpen] = useState(false);

  // Topic Dialog (Tambah / Edit Bab)
  const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<LearningTopicRow | null>(null);
  const [topicTitle, setTopicTitle] = useState("");
  const [topicDescription, setTopicDescription] = useState("");
  const [topicOrder, setTopicOrder] = useState(1);
  const [isSavingTopic, setIsSavingTopic] = useState(false);

  // Load Topics & Materials
  const loadData = useCallback(async () => {
    try {
      const [allTopics, dbItems, allCompletions] = await Promise.all([
        MysqlDataService.getLearningTopics({ subject_name: activeMapel, class_name: activeRombel }),
        MysqlDataService.getMaterials(),
        MysqlDataService.getMaterialCompletions().catch(() => []),
      ]);

      // Filter topics matching activeMapel
      const cleanActiveMapel = activeMapel.toLowerCase().trim();
      const filteredTopics = (allTopics || []).filter((t) => {
        const itemSubject = (t.subject_name || "").toLowerCase().trim();
        if (!itemSubject) return true;
        return itemSubject.includes(cleanActiveMapel) || cleanActiveMapel.includes(itemSubject);
      });
      setTopics(filteredTopics);

      if (dbItems && dbItems.length > 0) {
        const filteredMaterials = dbItems.filter((item) => {
          const itemSubject = (item.subject_name || "").toLowerCase().trim();
          if (!itemSubject) return true;
          return itemSubject.includes(cleanActiveMapel) || cleanActiveMapel.includes(itemSubject);
        });

        const sourceItems = filteredMaterials.length > 0 ? filteredMaterials : dbItems;

        const formatted: TeachingMaterialItem[] = sourceItems.map((item, idx) => {
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
            chapter: item.chapter || item.class_name || "Materi KBM",
            source: item.subject_name || activeMapel || "Media Pembelajaran LMS",
            file_url: item.file_url,
            uploaded_by: item.uploaded_by,
            selectedForToday: isUnlocked,
            status: isUnlocked ? "Aktif" : "Terkunci",
            sequence_order: Number(item.sequence_order) || idx + 1,
            access_mode: (item.access_mode as any) || "GURU_KONTROL",
            content_text: item.content_text,
            completionCount: doneCount,
            topic_id: item.topic_id || null,
          };
        });

        formatted.sort((a, b) => (a.sequence_order || 1) - (b.sequence_order || 1));
        setMaterials(formatted);
      } else {
        setMaterials([]);
      }
    } catch (err) {
      console.warn("Error fetching data in MateriTab:", err);
      setMaterials([]);
    }
  }, [activeMapel, activeRombel]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Create / Edit Topic
  const handleOpenAddTopic = () => {
    setEditingTopic(null);
    setTopicTitle(`Bab ${topics.length + 1}: `);
    setTopicDescription("");
    setTopicOrder(topics.length + 1);
    setIsTopicDialogOpen(true);
  };

  const handleOpenEditTopic = (topic: LearningTopicRow, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTopic(topic);
    setTopicTitle(topic.title);
    setTopicDescription(topic.description || "");
    setTopicOrder(topic.sequence_order || 1);
    setIsTopicDialogOpen(true);
  };

  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim()) {
      toast.error("Judul Bab / Topik wajib diisi!");
      return;
    }

    setIsSavingTopic(true);
    const activeUser = MysqlAuthService.getActiveUser();
    const currentTeacherName = activeUser?.full_name || "Guru Pengampu";

    const topicPayload: LearningTopicRow = {
      id: editingTopic ? editingTopic.id : "top_" + Date.now(),
      subject_name: activeMapel,
      class_name: activeRombel || "Semua Kelas",
      title: topicTitle.trim(),
      description: topicDescription.trim() || null,
      sequence_order: Number(topicOrder) || 1,
      status: editingTopic?.status || "Aktif",
      teacher_name: currentTeacherName,
    };

    try {
      const ok = await MysqlDataService.saveLearningTopic(topicPayload);
      if (ok) {
        toast.success(editingTopic ? `Bab "${topicTitle}" berhasil diperbarui!` : `Bab baru "${topicTitle}" berhasil ditambahkan!`);
        setIsTopicDialogOpen(false);
        await loadData();
        // If editing current selected topic, update state
        if (selectedTopic && selectedTopic.id === topicPayload.id) {
          setSelectedTopic(topicPayload);
        }
      } else {
        toast.error("Gagal menyimpan Bab / Topik ke database.");
      }
    } catch (err) {
      console.warn("Save topic error:", err);
      toast.error("Terjadi kesalahan saat menyimpan Bab.");
    } finally {
      setIsSavingTopic(false);
    }
  };

  const handleDeleteTopic = async (topicId: string, topicTitleName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Hapus Bab "${topicTitleName}"? Bahan ajar di dalamnya tidak akan terhapus, tetapi statusnya menjadi materi umum.`)) {
      return;
    }

    try {
      const ok = await MysqlDataService.deleteLearningTopic(topicId);
      if (ok) {
        toast.success(`Bab "${topicTitleName}" berhasil dihapus.`);
        if (selectedTopic && selectedTopic.id === topicId) {
          setSelectedTopic(null);
        }
        await loadData();
      } else {
        toast.error("Gagal menghapus Bab dari database.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat menghapus Bab.");
    }
  };

  // Toggle Show / Hide akses Bab (Tingkat Bab seperti di Moodle)
  const handleToggleTopicStatus = async (topic: LearningTopicRow, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextStatus = topic.status === "Terkunci" ? "Aktif" : "Terkunci";
    setTopics((prev) =>
      prev.map((t) => (t.id === topic.id ? { ...t, status: nextStatus } : t))
    );
    if (selectedTopic && selectedTopic.id === topic.id) {
      setSelectedTopic((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }

    try {
      const ok = await MysqlDataService.updateLearningTopicStatus(topic.id, nextStatus);
      if (ok) {
        if (nextStatus === "Aktif") {
          toast.success(`🔓 Bab "${topic.title}" sekarang DIBUKA untuk siswa.`);
        } else {
          toast.success(`🔒 Bab "${topic.title}" DISEMBUNYIKAN (Hide) dari siswa.`);
        }
      } else {
        toast.error("Gagal memperbarui status akses Bab.");
      }
    } catch (err) {
      toast.error("Terjadi kendala saat mengubah status Bab.");
    }
  };

  // Upload Material to Selected Topic
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
        topic_id: selectedTopic ? selectedTopic.id : data.topic_id || null,
        chapter: selectedTopic ? selectedTopic.title : data.chapter || null,
      } as any);

      if (res === false) {
        toast.error("Gagal mengunggah Bahan Ajar ke database.");
        return;
      }

      toast.success(`Bahan Ajar "${data.title}" berhasil disimpan di ${selectedTopic?.title || "Bahan Ajar"}!`);
      await loadData();
    } catch (err) {
      console.warn("Save material DB warning:", err);
      toast.error("Gagal mengunggah Bahan Ajar ke database.");
    }
  };

  // E-Library Book linking
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
        topic_id: selectedTopic ? selectedTopic.id : null,
        chapter: selectedTopic ? selectedTopic.title : null,
      } as any);

      if (res === false) {
        toast.error("Gagal menautkan buku dari E-Library.");
        return;
      }

      toast.success(`Berhasil menautkan "${book.title}" dari E-Library!`);
      await loadData();
    } catch (err) {
      console.warn("Save elibrary material error:", err);
      toast.error("Gagal menautkan buku dari E-Library.");
    }
  };

  // Toggle Show/Hide Material Access (Preserves revision requirement #4)
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
        toast.success(`🔓 Akses materi "${m.title}" dibuka untuk siswa!`);
      } else {
        toast.success(`🔒 Akses materi "${m.title}" dikunci dari siswa.`);
      }
    } catch (e) {
      console.warn("Gagal update status materi:", e);
    }
  };

  const handleOpenViewMaterial = (m: TeachingMaterialItem) => {
    setSelectedMaterialForView(m);
    setIsViewOpen(true);
  };

  // Materials under current selected topic (or unassigned materials)
  const currentTopicMaterials = selectedTopic
    ? selectedTopic.id === "unassigned"
      ? materials.filter((m) => !m.topic_id)
      : materials.filter((m) => m.topic_id === selectedTopic.id)
    : [];

  const unassignedMaterials = materials.filter((m) => !m.topic_id);

  return (
    <>
      <Card className="border-border shadow-xs bg-card overflow-hidden">
        {/* ========================================================= */}
        {/* LEVEL 1: DAFTAR BAB / TOPIK PEMBELAJARAN                  */}
        {/* ========================================================= */}
        {!selectedTopic ? (
          <>
            <div className="p-3 sm:p-4 border-b border-border flex items-center justify-between gap-2 bg-muted/15">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
                  <Layers className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs sm:text-sm font-bold truncate text-foreground">
                      Bab & Topik Pembelajaran
                    </h3>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-mono font-semibold">
                      {topics.length} Bab
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
                  title="Jelajahi E-Library"
                >
                  <Library className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  <span className="hidden sm:inline">E-Library</span>
                </Button>
                <Button
                  size="sm"
                  className="h-8 px-2.5 text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                  onClick={handleOpenAddTopic}
                  title="Tambah Bab / Topik Baru"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                  <span>+ Tambah Bab</span>
                </Button>
              </div>
            </div>

            <CardContent className="p-3 sm:p-4 space-y-3">
              {topics.length === 0 && unassignedMaterials.length === 0 ? (
                <div className="p-6 sm:p-10 text-center border border-dashed border-border rounded-xl space-y-3 bg-muted/5">
                  <FolderPlus className="h-10 w-10 text-emerald-500/50 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-foreground">Belum Ada Bab / Topik Pembelajaran</h4>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Susun materi belajar Anda secara terstruktur per Bab/Topik untuk memudahkan proses KBM mata pelajaran <strong>{activeMapel}</strong>.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 shadow-xs"
                      onClick={handleOpenAddTopic}
                    >
                      <Plus className="h-3.5 w-3.5" /> Buat Bab Pertama
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Kartu Deretan Bab/Topik */}
                  {topics.map((t, idx) => {
                    const topicMats = materials.filter((m) => m.topic_id === t.id);
                    const openMats = topicMats.filter((m) => m.selectedForToday);

                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTopic(t)}
                        className={`group relative p-3.5 rounded-xl border transition-all shadow-xs cursor-pointer flex flex-col justify-between ${
                          t.status === "Terkunci"
                            ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60"
                            : "border-border bg-card hover:border-emerald-500/50 hover:bg-emerald-50/15 dark:hover:bg-emerald-950/15"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50/50 dark:bg-emerald-950/50">
                                Bab #{t.sequence_order || idx + 1}
                              </Badge>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                                {topicMats.length} Bahan Ajar
                              </Badge>
                              {t.status === "Terkunci" ? (
                                <Badge variant="outline" className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[9px] px-1.5 py-0 flex items-center gap-0.5">
                                  <EyeOff className="h-2.5 w-2.5" /> Bab Tersembunyi (Hide)
                                </Badge>
                              ) : (
                                <Badge className="bg-emerald-600 text-white text-[9px] px-1.5 py-0 flex items-center gap-0.5">
                                  <Eye className="h-2.5 w-2.5" /> Bab Terbuka
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button
                                size="sm"
                                variant="outline"
                                className={`h-6 px-1.5 text-[10px] font-semibold gap-1 rounded-md transition-all ${
                                  t.status === "Terkunci"
                                    ? "border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15 bg-amber-50/50 dark:bg-amber-950/50"
                                    : "border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15 bg-emerald-50/50 dark:bg-emerald-950/50"
                                }`}
                                onClick={(e) => handleToggleTopicStatus(t, e)}
                                title={t.status === "Terkunci" ? "Buka akses Bab ini untuk siswa" : "Sembunyikan Bab ini dari siswa (seperti di Moodle)"}
                              >
                                {t.status === "Terkunci" ? (
                                  <>
                                    <EyeOff className="h-2.5 w-2.5 text-amber-600" /> Hide
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-2.5 w-2.5 text-emerald-600" /> Show
                                  </>
                                )}
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={(e) => handleOpenEditTopic(t, e)}
                                title="Edit Bab"
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={(e) => handleDeleteTopic(t.id, t.title, e)}
                                title="Hapus Bab"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <h4 className="font-bold text-sm text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                            {t.title}
                          </h4>

                          {t.description ? (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {t.description}
                            </p>
                          ) : (
                            <p className="text-[11px] text-muted-foreground/70 italic mt-1">
                              Klik untuk masuk dan mengelola bahan ajar pada bab ini.
                            </p>
                          )}
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between gap-2">
                          <span className="text-[10px] font-medium text-muted-foreground">
                            {topicMats.length === 0 ? "Belum ada materi" : `${topicMats.length} materi terdaftar`}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                            Masuk ke Bab <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Jika ada materi lama yang belum memiliki topic_id, tampilkan wadah Materi Umum */}
                  {unassignedMaterials.length > 0 && (
                    <div
                      onClick={() =>
                        setSelectedTopic({
                          id: "unassigned",
                          title: "Materi Umum / Belum Terkategori",
                          subject_name: activeMapel,
                          class_name: activeRombel,
                          description: "Kumpulan bahan ajar yang belum dikelompokkan ke dalam bab tertentu.",
                          sequence_order: 99,
                        })
                      }
                      className="group p-3.5 rounded-xl border border-dashed border-amber-500/40 bg-amber-50/15 dark:bg-amber-950/15 hover:border-amber-500 hover:bg-amber-50/30 transition-all shadow-xs cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 border-amber-500/40 text-amber-800 dark:text-amber-300 font-bold">
                            Materi Umum
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                            {unassignedMaterials.length} Bahan Ajar
                          </Badge>
                        </div>
                        <h4 className="font-bold text-sm text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          Materi Belum Terkategori
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          Terdapat {unassignedMaterials.length} bahan ajar lama. Klik untuk melihat dan mengelola aksesnya.
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300">
                          Perlu penataan bab
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                          Buka Materi <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </>
        ) : (
          /* ========================================================= */
          /* LEVEL 2: WORKSPACE DI DALAM BAB YANG DIKLIK               */
          /* ========================================================= */
          <>
            {/* Header Di Dalam Bab (Breadcrumb & Action Buttons) */}
            <div className="p-3 sm:p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-muted/15">
              <div className="flex items-center gap-2 min-w-0">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground shrink-0"
                  onClick={() => setSelectedTopic(null)}
                  title="Kembali ke Daftar Bab"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Daftar Bab</span>
                </Button>

                <div className="h-4 w-[1px] bg-border shrink-0" />

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-xs sm:text-sm font-bold truncate text-foreground">
                      {selectedTopic.title}
                    </h3>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-mono font-semibold">
                      {currentTopicMaterials.length} Materi
                    </Badge>
                    {selectedTopic.id !== "unassigned" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className={`h-5.5 px-2 text-[10px] font-semibold gap-1 rounded-md ${
                          selectedTopic.status === "Terkunci"
                            ? "border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 bg-amber-50/50 dark:bg-amber-950/50"
                            : "border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 bg-emerald-50/50 dark:bg-emerald-950/50"
                        }`}
                        onClick={() => handleToggleTopicStatus(selectedTopic)}
                        title={selectedTopic.status === "Terkunci" ? "Buka akses Bab ini untuk siswa" : "Sembunyikan Bab ini dari siswa (seperti di Moodle)"}
                      >
                        {selectedTopic.status === "Terkunci" ? (
                          <>
                            <EyeOff className="h-3 w-3 text-amber-600" /> Bab Tersembunyi (Hide)
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3 text-emerald-600" /> Bab Terbuka (Show)
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {activeMapel} · {activeRombel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
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
                  className="h-8 px-2.5 text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                  onClick={() => setIsUploadOpen(true)}
                  title="Unggah Bahan Ajar ke Bab ini"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>+ Unggah Materi</span>
                </Button>
              </div>
            </div>

            {/* Banner Deskripsi Bab jika ada */}
            {selectedTopic.description && (
              <div className="px-3 sm:px-4 py-2 bg-emerald-500/5 border-b border-border text-xs text-muted-foreground flex items-center gap-2">
                <BookMarked className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{selectedTopic.description}</span>
              </div>
            )}

            <CardContent className="p-3 sm:p-4 space-y-3">
              {currentTopicMaterials.length === 0 ? (
                <div className="p-6 sm:p-8 text-center border border-dashed border-border rounded-xl space-y-3 bg-muted/5">
                  <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">
                      Belum ada bahan ajar di dalam {selectedTopic.title}.
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Silakan unggah berkas modul, slide, rangkuman teks, atau tautkan buku dari E-Library.
                    </p>
                  </div>
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
                  {currentTopicMaterials.map((m) => (
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
                                {m.access_mode === "SISWA_MANDIRI" ? "📚 Progres Mandiri" : "🏫 Kendali Guru"}
                              </Badge>
                              {m.access_mode === "SISWA_MANDIRI" && (
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-emerald-400 text-emerald-600 flex items-center gap-0.5">
                                  <CheckCircle2 className="h-2.5 w-2.5" />
                                  {m.completionCount || 0} Selesai
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-bold text-xs text-foreground truncate mt-0.5">{m.title}</h4>
                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">{m.source} · {selectedTopic.title}</p>
                          </div>
                        </div>

                        {/* Status Terbuka / Terkunci (Requirement #4) */}
                        <Badge
                          variant={m.selectedForToday ? "default" : "outline"}
                          className={`text-[10px] font-semibold shrink-0 px-2 py-0.5 ${
                            m.selectedForToday
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {m.selectedForToday ? "🔓 Terbuka" : "🔒 Terkunci"}
                        </Badge>
                      </div>

                      {/* Tombol Aksi: Buka & Kunci/Buka Akses (Requirement #4) */}
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
                              <Unlock className="h-3 w-3" /> Buka Akses
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </>
        )}
      </Card>

      {/* Dialog Tambah / Edit Bab */}
      <Dialog open={isTopicDialogOpen} onOpenChange={setIsTopicDialogOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-emerald-600" />
              {editingTopic ? "Edit Bab / Topik Pembelajaran" : "Tambah Bab / Topik Baru"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveTopic} className="space-y-3 py-2">
            <div>
              <Label htmlFor="topic-title" className="text-xs font-semibold">
                Judul Bab / Topik <span className="text-destructive">*</span>
              </Label>
              <Input
                id="topic-title"
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                placeholder="Contoh: Bab 1 - Bilangan Bulat dan Pecahan"
                className="mt-1 text-xs"
                required
              />
            </div>

            <div>
              <Label htmlFor="topic-order" className="text-xs font-semibold">
                Nomor Urut Bab
              </Label>
              <Input
                id="topic-order"
                type="number"
                min={1}
                value={topicOrder}
                onChange={(e) => setTopicOrder(Number(e.target.value) || 1)}
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="topic-desc" className="text-xs font-semibold">
                Deskripsi / Capaian Bab (Opsional)
              </Label>
              <Textarea
                id="topic-desc"
                value={topicDescription}
                onChange={(e) => setTopicDescription(e.target.value)}
                placeholder="Penjelasan ringkas materi dan tujuan yang dipelajari pada bab ini..."
                rows={3}
                className="mt-1 text-xs resize-none"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsTopicDialogOpen(false)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                disabled={isSavingTopic}
              >
                {isSavingTopic ? "Menyimpan..." : editingTopic ? "Simpan Perubahan" : "Buat Bab"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Preview Materi */}
      <ViewMaterialDialog
        isOpen={isViewOpen}
        onOpenChange={setIsViewOpen}
        material={selectedMaterialForView}
        activeRombel={activeRombel}
        activeMapel={activeMapel}
      />

      {/* Dialog Upload Bahan Ajar */}
      <UploadModulDialog
        isOpen={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        defaultMapel={activeMapel}
        defaultTopicId={selectedTopic?.id !== "unassigned" ? selectedTopic?.id : undefined}
        defaultChapter={selectedTopic ? selectedTopic.title : undefined}
        onUpload={handleUploadModul}
      />

      {/* Dialog E-Library Picker */}
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
