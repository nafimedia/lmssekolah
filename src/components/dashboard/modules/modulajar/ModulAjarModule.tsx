import { useState, useEffect, useMemo } from "react";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { MysqlDataService, LearningTopicRow } from "@/services/mysqlDataService";
import { filterSubjectsForUser, ALL_SCHOOL_SUBJECTS } from "@/services/teacherSubjectAccess";
import { isSameSubject } from "@/utils/subjectNormalization";
import { isSameClass } from "@/utils/classNormalization";
import { toast } from "sonner";
import {
  FileText,
  Upload,
  Eye,
  Download,
  Trash2,
  ExternalLink,
  Lock,
  CheckCircle2,
  FolderPlus,
  Folder,
  ArrowLeft,
  BookOpen,
  Layers,
  ChevronRight,
  Plus,
  Pencil,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

import { UploadModulDialog, UploadModulPayload } from "./components/UploadModulDialog";
import { PreviewModulDialog } from "./components/PreviewModulDialog";
import { DeleteModulDialog } from "./components/DeleteModulDialog";
import { ManageTopicDialog } from "./components/ManageTopicDialog";

export function ModulAjarModule({ activeRole, userProfile }: { activeRole?: string; userProfile?: any }) {
  const isSiswa = activeRole === "siswa";
  const isGuru = activeRole === "guru" || activeRole === "guru_mapel";
  const isWakaOrAdmin = activeRole === "waka" || activeRole === "admin" || activeRole === "admin_akademik" || activeRole === "kamad";
  const isKamad = activeRole === "kamad";

  const me = MysqlAuthService.getActiveUser();
  const currentTeacherName = me?.full_name || "Guru Pengampu";
  const currentSubject = (me as any)?.subject_specialty || userProfile?.assignedSubject || "";

  // Available subjects based on user role
  const allowedMapels = useMemo(() => {
    return filterSubjectsForUser(ALL_SCHOOL_SUBJECTS, me);
  }, [me]);

  // Active Filters & State
  const [selectedJenjang, setSelectedJenjang] = useState<string>("Kelas VIII");
  const [selectedMapel, setSelectedMapel] = useState<string>(() => {
    if (isGuru && allowedMapels.length > 0) return allowedMapels[0];
    return "semua";
  });
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("semua");
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>("semua");
  const [viewMode, setViewMode] = useState<"semua_materi" | "folder_bab">("semua_materi");

  // Bab / Topik State (Hierarki Kurikulum)
  const [topics, setTopics] = useState<LearningTopicRow[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<LearningTopicRow | null>(null);
  const [isManageTopicOpen, setIsManageTopicOpen] = useState(false);
  const [topicToEdit, setTopicToEdit] = useState<LearningTopicRow | null>(null);
  const [topicToDelete, setTopicToDelete] = useState<LearningTopicRow | null>(null);

  // Dialog States for Materials
  const [previewModul, setPreviewModul] = useState<any | null>(null);
  const [deleteConfirmModul, setDeleteConfirmModul] = useState<{ id: string; title: string } | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Data States
  const [modulList, setModulList] = useState<Array<any>>([]);
  const [completions, setCompletions] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUnassignedSection, setShowUnassignedSection] = useState(false);

  // Fetch Bab / Learning Topics
  const fetchTopics = async () => {
    try {
      const topicData = await MysqlDataService.getLearningTopics();
      setTopics(topicData || []);
    } catch (e) {
      console.warn("fetchTopics error:", e);
      setTopics([]);
    }
  };

  // Fetch Materials / Modul Ajar
  const fetchMaterials = async () => {
    setIsLoading(true);
    try {
      const [items, compList] = await Promise.all([
        MysqlDataService.getMaterials(),
        MysqlDataService.getMaterialCompletions().catch(() => []),
      ]);
      setCompletions(compList || []);
      if (items && items.length > 0) {
        // Hanya ambil materi bahan ajar belajar (bukan dokumen kurikulum prota/promes/silabus/atp/kktp)
        const learningMaterialsOnly = items.filter((m) => {
          const typeLower = (m.type || "").toLowerCase().trim();
          const isTeacherAdmin =
            typeLower.includes("prota") ||
            typeLower.includes("program tahunan") ||
            typeLower.includes("promes") ||
            typeLower.includes("program semester") ||
            typeLower.includes("kktp") ||
            typeLower.includes("atp") ||
            typeLower.includes("silabus") ||
            typeLower.includes("rubrik") ||
            typeLower.includes("kisi");
          return !isTeacherAdmin;
        });

        const dbFormatted = learningMaterialsOnly.map((m) => ({
          id: String(m.id),
          title: m.title,
          mapel: m.subject_name || "Mata Pelajaran",
          jenjang: m.class_name || "Kelas VIII",
          type: m.type || "DOKUMEN",
          teacher: m.uploaded_by || m.teacher_name || "Guru Pengampu",
          size: m.size || "3.5 MB",
          date: m.created_at ? new Date(m.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Terbaru",
          status: (m as any).status || "Menunggu Verifikasi Waka",
          file_url: m.file_url || "",
          file_name: m.filename || `${m.title}.pdf`,
          sequence_order: Number(m.sequence_order) || 1,
          access_mode: m.access_mode || "GURU_KONTROL",
          content_text: m.content_text || "",
          topic_id: m.topic_id || null,
          chapter: m.chapter || null,
        }));

        dbFormatted.sort((a, b) => (a.sequence_order || 1) - (b.sequence_order || 1));
        setModulList(dbFormatted);
      } else {
        setModulList([]);
      }
    } catch (e) {
      console.warn("fetchMaterials error:", e);
      setModulList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
    fetchTopics();
  }, []);

  // Update selectedMapel if user is Guru and allowedMapels loads
  useEffect(() => {
    if (isGuru && allowedMapels.length > 0 && selectedMapel === "semua") {
      setSelectedMapel(allowedMapels[0]);
    }
  }, [isGuru, allowedMapels, selectedMapel]);

  const studentNisn = me?.nis_nip || me?.id || "";
  const completedMaterialIds = useMemo(() => {
    const set = new Set<string>();
    for (const c of completions) {
      if (c.student_nisn === studentNisn || (c.student_name && c.student_name.toLowerCase() === (me?.full_name || "").toLowerCase())) {
        set.add(String(c.material_id));
      }
    }
    return set;
  }, [completions, studentNisn, me]);

  // Filter bahan ajar yang dapat diakses:
  // Guru hanya mengelola bahan ajar miliknya atau mapelnya, Pimpinan melihat semua
  const availableModulList = useMemo(() => {
    if (!isGuru) return modulList;
    return modulList.filter((m) => {
      const uploader = (m.teacher || "").toLowerCase().trim();
      const myName = currentTeacherName.toLowerCase().trim();
      const matchTeacher = !uploader || uploader === "guru pengampu" || uploader === myName || uploader.includes(myName) || myName.includes(uploader);
      const matchMapel = allowedMapels.some((s) => isSameSubject(s, m.mapel));
      return matchTeacher || matchMapel;
    });
  }, [modulList, isGuru, currentTeacherName, allowedMapels]);

  // Filter Bab berdasarkan Jenjang Kelas & Mapel yang dipilih
  const filteredTopics = useMemo(() => {
    return topics
      .filter((t) => {
        const matchJenjang = selectedJenjang === "semua" || isSameClass(t.class_name, selectedJenjang) || (t.class_name && t.class_name.includes(selectedJenjang));
        const matchMapel = selectedMapel === "semua" || isSameSubject(t.subject_name, selectedMapel);
        return matchJenjang && matchMapel;
      })
      .sort((a, b) => (a.sequence_order || 1) - (b.sequence_order || 1));
  }, [topics, selectedJenjang, selectedMapel]);

  // Reset filter bab ketika jenjang atau mapel berubah
  useEffect(() => {
    setSelectedTopicFilter("semua");
  }, [selectedJenjang, selectedMapel]);

  // Seluruh bahan ajar untuk kelas & mapel yang dipilih (Pustaka Bahan Ajar Langsung)
  const currentFilteredMaterials = useMemo(() => {
    return availableModulList
      .filter((m) => {
        const matchJenjang = selectedJenjang === "semua" || isSameClass(m.jenjang, selectedJenjang) || (m.jenjang && m.jenjang.includes(selectedJenjang));
        const matchMapel = selectedMapel === "semua" || isSameSubject(m.mapel, selectedMapel);
        if (!matchJenjang || !matchMapel) return false;

        if (selectedStatusFilter === "verified") {
          if (m.status !== "Terverifikasi Waka") return false;
        } else if (selectedStatusFilter === "pending") {
          if (m.status === "Terverifikasi Waka") return false;
        }

        if (selectedTopicFilter === "semua") return true;
        if (selectedTopicFilter === "none") return !m.topic_id;
        return m.topic_id === selectedTopicFilter || (m.chapter && m.chapter.trim().toLowerCase() === selectedTopicFilter.trim().toLowerCase());
      })
      .sort((a, b) => (a.sequence_order || 1) - (b.sequence_order || 1));
  }, [availableModulList, selectedJenjang, selectedMapel, selectedStatusFilter, selectedTopicFilter]);

  // Materi di dalam Bab yang sedang dibuka (saat selectedTopic aktif)
  const currentTopicMaterials = useMemo(() => {
    if (!selectedTopic) return [];
    return availableModulList
      .filter((m) => m.topic_id === selectedTopic.id || (m.chapter && m.chapter.trim().toLowerCase() === selectedTopic.title.trim().toLowerCase()))
      .filter((m) => {
        if (selectedStatusFilter === "verified") return m.status === "Terverifikasi Waka";
        if (selectedStatusFilter === "pending") return m.status !== "Terverifikasi Waka";
        return true;
      })
      .sort((a, b) => (a.sequence_order || 1) - (b.sequence_order || 1));
  }, [availableModulList, selectedTopic, selectedStatusFilter]);

  // Siswa gating / sequence lock untuk materi di dalam Bab aktif
  const materialsWithLockState = useMemo(() => {
    if (!isSiswa) return currentTopicMaterials;

    const list = [...currentTopicMaterials].sort((a, b) => (a.sequence_order || 1) - (b.sequence_order || 1));
    return list.map((m, idx) => {
      const isCompleted = completedMaterialIds.has(String(m.id));
      const rawStatus = (m.status || "").toLowerCase().trim();
      const isTeacherLocked = rawStatus === "terkunci" || rawStatus === "sembunyi";

      let isUnlocked = true;
      let lockReason = "";

      if (isTeacherLocked) {
        isUnlocked = false;
        lockReason = "Materi ini sedang dibatasi aksesnya oleh Guru Pengampu.";
      } else if (m.access_mode === "SISWA_MANDIRI") {
        if (idx > 0) {
          const prevItem = list[idx - 1];
          const isPrevDone = completedMaterialIds.has(String(prevItem.id));
          if (!isPrevDone) {
            isUnlocked = false;
            lockReason = `Selesaikan Langkah #${prevItem.sequence_order || idx} ("${prevItem.title}") terlebih dahulu untuk membuka materi ini.`;
          }
        }
      }

      return {
        ...m,
        isCompleted,
        isUnlocked,
        lockReason,
      };
    });
  }, [currentTopicMaterials, isSiswa, completedMaterialIds]);

  // Materi legacy atau lepas yang belum dikelompokkan ke dalam Bab
  const unassignedMaterials = useMemo(() => {
    return availableModulList.filter((m) => {
      const matchJenjang = selectedJenjang === "semua" || m.jenjang === selectedJenjang;
      const matchMapel = selectedMapel === "semua" || isSameSubject(m.mapel, selectedMapel);
      if (!matchJenjang || !matchMapel) return false;
      // Cek apakah memiliki topic_id yang valid di tabel topics
      if (!m.topic_id) return true;
      const topicExists = topics.some((t) => t.id === m.topic_id);
      return !topicExists;
    });
  }, [availableModulList, selectedJenjang, selectedMapel, topics]);

  // Handlers untuk Bab (Topic)
  const handleSaveTopic = async (payload: { id?: string; title: string; description: string; sequence_order: number }) => {
    try {
      const topicId = payload.id || `top_${Date.now()}`;
      const activeJenjangForTopic = selectedJenjang === "semua" ? "Kelas VIII" : selectedJenjang;
      const activeMapelForTopic = selectedMapel === "semua" ? (allowedMapels[0] || "Al Qur'an Hadis") : selectedMapel;

      const res = await MysqlDataService.saveLearningTopic({
        id: topicId,
        title: payload.title,
        description: payload.description || null,
        sequence_order: payload.sequence_order || 1,
        subject_name: activeMapelForTopic,
        class_name: activeJenjangForTopic,
        status: "Aktif",
        teacher_name: currentTeacherName || "Guru Pengampu",
      });

      if (res) {
        toast.success(payload.id ? `Bab "${payload.title}" berhasil diperbarui!` : `Bab "${payload.title}" berhasil dibuat!`);
        await fetchTopics();
        setIsManageTopicOpen(false);
        setTopicToEdit(null);
        if (selectedTopic && selectedTopic.id === topicId) {
          setSelectedTopic({
            ...selectedTopic,
            title: payload.title,
            description: payload.description,
            sequence_order: payload.sequence_order,
          });
        }
      } else {
        toast.error("Gagal menyimpan Bab ke database.");
      }
    } catch (e) {
      console.warn("handleSaveTopic error:", e);
      toast.error("Terjadi kesalahan saat menyimpan Bab.");
    }
  };

  const handleDeleteTopic = async (topic: LearningTopicRow) => {
    try {
      const res = await MysqlDataService.deleteLearningTopic(topic.id);
      if (res) {
        toast.success(`Bab "${topic.title}" berhasil dihapus.`);
        if (selectedTopic?.id === topic.id) {
          setSelectedTopic(null);
        }
        await Promise.all([fetchTopics(), fetchMaterials()]);
      } else {
        toast.error("Gagal menghapus Bab.");
      }
    } catch (e) {
      console.warn("handleDeleteTopic error:", e);
      toast.error("Terjadi kesalahan saat menghapus Bab.");
    } finally {
      setTopicToDelete(null);
    }
  };

  // Handlers untuk Materi / Bahan Ajar
  const handleDownloadModulPdf = (m: any) => {
    const fileUrl = m.file_url;
    const fileName = m.file_name || `${m.title}.pdf`;
    const title = m.title;

    if (m.type === "URL" || (fileUrl && (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")))) {
      window.open(fileUrl, "_blank");
      toast.success(`🌐 Membuka tautan pembelajaran "${title}"...`);
      return;
    }

    if (fileUrl && (fileUrl.startsWith("data:") || fileUrl.startsWith("blob:") || fileUrl.startsWith("/uploads"))) {
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`💾 Berkas "${title}" berhasil diunduh!`);
      return;
    }

    toast.error(`Berkas fisik untuk "${title}" belum diunggah oleh guru pengampu.`);
  };

  const handleToggleVerification = async (id: string, currentStatus: string, title: string) => {
    const nextStatus = currentStatus.includes("Terverifikasi") ? "Menunggu Verifikasi Waka" : "Terverifikasi Waka";
    setModulList((prev) => {
      return prev.map((m) => {
        if (m.id === id) {
          if (nextStatus === "Terverifikasi Waka") {
            toast.success(`Modul Ajar "${title}" berhasil disahkan!`);
          } else {
            toast.info(`Status verifikasi "${title}" dibatalkan.`);
          }
          return { ...m, status: nextStatus };
        }
        return m;
      });
    });

    const targetModul = modulList.find((m) => m.id === id);
    if (targetModul) {
      try {
        await MysqlDataService.saveMaterial({
          id: id,
          title: targetModul.title,
          subject_name: targetModul.mapel,
          class_name: targetModul.jenjang,
          type: targetModul.type || "Modul Ajar",
          status: nextStatus,
          uploaded_by: targetModul.teacher,
          filename: targetModul.file_name,
          file_url: targetModul.file_url,
          size: targetModul.size,
          sequence_order: targetModul.sequence_order,
          access_mode: targetModul.access_mode,
          content_text: targetModul.content_text,
          topic_id: targetModul.topic_id || null,
          chapter: targetModul.chapter || null,
        } as any);
      } catch (err) {
        console.warn("Update verification status DB warning:", err);
      }
    }
  };

  const handleDeleteModul = async (id: string, title: string) => {
    setModulList((prev) => prev.filter((m) => m.id !== id));
    try {
      await MysqlDataService.deleteMaterial(id);
      toast.success(`🗑️ Modul Ajar "${title}" berhasil dihapus dari database!`);
      await fetchMaterials();
    } catch (err) {
      console.warn("deleteMaterial DB warning:", err);
    }
  };

  const handleUploadSubmit = async (data: UploadModulPayload) => {
    const isUrl = data.jenisBahan === "URL";
    const isVideo = data.jenisBahan === "VIDEO";
    const isTeks = data.jenisBahan === "TEKS";
    const calcSize = isUrl
      ? "Link Web"
      : isTeks
        ? `${data.content_text?.length || 0} Karakter`
        : data.file
          ? `${(data.file.size / (1024 * 1024)).toFixed(1)} MB`
          : "2.5 MB";
    const fileUrlToSave = isUrl || (isVideo && data.externalUrl) ? (data.externalUrl || "") : isTeks ? "" : (data.dataUrl || "");
    const newId = "mod_" + Date.now();

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

    const assignedTopicId = data.topic_id || (selectedTopic ? selectedTopic.id : null);
    const assignedChapter = data.chapter || (selectedTopic ? selectedTopic.title : null);

    // Jika membuat Bab baru secara langsung saat unggah, simpan juga ke tabel learning_topics
    if (assignedTopicId && assignedChapter) {
      const topicExists = topics.some((t) => t.id === assignedTopicId);
      if (!topicExists) {
        try {
          await MysqlDataService.saveLearningTopic({
            id: assignedTopicId,
            title: assignedChapter,
            subject_name: data.mapel,
            class_name: data.jenjang,
            sequence_order: topics.length + 1,
            status: "Aktif",
            teacher_name: currentTeacherName || "Guru Pengampu",
          });
          await fetchTopics();
        } catch (e) {
          console.warn("Auto save new topic warning:", e);
        }
      }
    }

    try {
      const res = await MysqlDataService.saveMaterial({
        id: newId,
        title: data.title.trim(),
        subject_name: data.mapel,
        class_name: data.jenjang,
        type: data.jenisBahan,
        status: "Menunggu Verifikasi Waka",
        uploaded_by: currentTeacherName || "Guru Pengampu",
        teacher_name: currentTeacherName || "Guru Pengampu",
        file_url: fileUrlToSave || (isUrl || isTeks ? "" : `/uploads/${newId}.${ext}`),
        filename: data.file?.name || (isUrl ? "Tautan Pembelajaran" : isTeks ? "Catatan Rangkuman KBM" : `${data.title}.${ext}`),
        size: calcSize,
        sequence_order: data.sequence_order || 1,
        access_mode: data.access_mode || "GURU_KONTROL",
        content_text: data.content_text || null,
        topic_id: assignedTopicId,
        chapter: assignedChapter,
      } as any);

      if (res === false) {
        toast.error("Gagal mengunggah Bahan Ajar ke database.");
        return;
      }

      toast.success(
        assignedChapter
          ? `Bahan Ajar "${data.title}" berhasil disimpan di "${assignedChapter}"!`
          : `Bahan Ajar "${data.title}" berhasil disimpan ke Pustaka!`
      );
      await fetchMaterials();
    } catch (err) {
      console.warn("Save material DB warning:", err);
      toast.error("Gagal mengunggah Bahan Ajar ke database.");
    }
  };

  const verifiedCount = availableModulList.filter((m) => m.status === "Terverifikasi Waka").length;
  const pendingCount = availableModulList.length - verifiedCount;

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            {isSiswa
              ? "Bahan Ajar & Materi Belajar KBM"
              : isGuru
                ? "Pustaka Bahan Ajar Guru"
                : "Pustaka Bahan Ajar & Modul Kurikulum"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pustaka modul, materi bacaan, video pembelajaran, dan media ajar terpadu.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!isSiswa && !selectedTopic && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-border hover:bg-muted text-foreground text-xs font-semibold gap-1.5 shadow-2xs"
                onClick={() => {
                  setTopicToEdit(null);
                  setIsManageTopicOpen(true);
                }}
              >
                <FolderPlus className="h-3.5 w-3.5 text-muted-foreground" /> + Kelola / Tambah Bab
              </Button>
              <Button
                size="sm"
                className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-2xs px-3 cursor-pointer"
                onClick={() => setIsUploadOpen(true)}
              >
                <Upload className="h-3.5 w-3.5" /> + Unggah Bahan Ajar
              </Button>
            </>
          )}

          {!isSiswa && selectedTopic && (
            <Button
              size="sm"
              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-2xs px-3 cursor-pointer"
              onClick={() => setIsUploadOpen(true)}
            >
              <Upload className="h-3.5 w-3.5" /> + Unggah ke Bab Ini
            </Button>
          )}
        </div>
      </div>

      {/* Metric Quick Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Layers className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Total Bab Terdaftar</p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{filteredTopics.length} Bab</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <FileText className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Total Bahan Ajar</p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{availableModulList.length} Berkas</p>
          </div>
        </div>

        <div
          className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs cursor-pointer hover:border-amber-500/50 transition-colors"
          onClick={() => setSelectedStatusFilter("pending")}
        >
          <div className="h-7 w-7 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Menunggu Verifikasi</p>
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400 leading-tight mt-0.5">{pendingCount} Modul</p>
          </div>
        </div>

        <div
          className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs cursor-pointer hover:border-emerald-500/50 transition-colors"
          onClick={() => setSelectedStatusFilter("verified")}
        >
          <div className="h-7 w-7 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Telah Terverifikasi</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">{verifiedCount} Modul</p>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS: Pilih Tingkat Kelas & Pilih Mata Pelajaran */}
      <div className="p-3 rounded-xl bg-card border border-border flex flex-wrap items-center justify-between gap-3 shadow-2xs text-xs">
        {/* Pilih Tingkat Kelas */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-muted-foreground">Pilih Tingkat Kelas:</span>
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/70">
            {["Kelas VII", "Kelas VIII", "Kelas IX"].map((j) => (
              <Button
                key={j}
                size="sm"
                variant={selectedJenjang === j ? "default" : "ghost"}
                className={`text-xs font-bold h-7 px-3 rounded-lg ${selectedJenjang === j ? "bg-emerald-600 text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                onClick={() => {
                  setSelectedJenjang(j);
                  setSelectedTopic(null); // Reset ke daftar bab saat ganti kelas
                }}
              >
                {j}
              </Button>
            ))}
            {isWakaOrAdmin && (
              <Button
                size="sm"
                variant={selectedJenjang === "semua" ? "default" : "ghost"}
                className={`text-xs font-bold h-7 px-3 rounded-lg ${selectedJenjang === "semua" ? "bg-emerald-600 text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                onClick={() => {
                  setSelectedJenjang("semua");
                  setSelectedTopic(null);
                }}
              >
                Semua Kelas
              </Button>
            )}
          </div>
        </div>

        {/* Pilih Mata Pelajaran */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-muted-foreground">Mata Pelajaran:</span>
          {isGuru && allowedMapels.length === 1 ? (
            <Badge variant="outline" className="h-8 px-3 font-semibold text-xs border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300">
              📖 {allowedMapels[0]}
            </Badge>
          ) : (
            <select
              className="h-8 bg-background text-xs font-semibold text-foreground border border-input rounded-lg px-2.5 cursor-pointer hover:border-primary/50 transition max-w-[220px]"
              value={selectedMapel}
              onChange={(e) => {
                setSelectedMapel(e.target.value);
                setSelectedTopic(null); // Reset ke daftar bab saat ganti mapel
              }}
            >
              {isWakaOrAdmin && <option value="semua">Semua Mata Pelajaran</option>}
              {allowedMapels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          )}

          {isWakaOrAdmin && selectedTopic && (
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-[11px] font-semibold text-muted-foreground">Status:</span>
              <select
                className="h-8 bg-background text-xs font-semibold text-foreground border border-input rounded-lg px-2 cursor-pointer hover:border-primary/50 transition"
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
              >
                <option value="semua">Semua Status</option>
                <option value="pending">⏳ Menunggu Verifikasi</option>
                <option value="verified">✅ Terverifikasi Waka</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAMPILAN LEVEL 2: DETAIL BAB (Klik Bab tertentu untuk lihat bahan ajar)  */}
      {/* ========================================================================= */}
      {selectedTopic ? (
        <div className="space-y-4">
          {/* Breadcrumb Navigation Bar */}
          <div className="p-3.5 rounded-xl bg-card border border-border shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs font-bold text-muted-foreground hover:text-foreground gap-1 px-2 -ml-1"
                  onClick={() => setSelectedTopic(null)}
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Daftar Bab
                </Button>
                <span className="text-muted-foreground text-xs">/</span>
                <Badge variant="outline" className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border-emerald-500/40">
                  Bab #{selectedTopic.sequence_order || 1}
                </Badge>
              </div>

              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Folder className="h-5 w-5 text-emerald-600" />
                {selectedTopic.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                <span>{selectedTopic.class_name}</span>
                <span>•</span>
                <span className="font-semibold text-foreground">{selectedTopic.subject_name}</span>
                {selectedTopic.description && (
                  <>
                    <span>•</span>
                    <span className="italic">{selectedTopic.description}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isSiswa && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-semibold gap-1.5"
                    onClick={() => {
                      setTopicToEdit(selectedTopic);
                      setIsManageTopicOpen(true);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" /> Edit Info Bab
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-2xs px-3"
                    onClick={() => setIsUploadOpen(true)}
                  >
                    <Upload className="h-3.5 w-3.5" /> + Unggah Bahan Ajar
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Daftar Materi di dalam Bab ini */}
          {materialsWithLockState.length === 0 ? (
            <Card className="border-border border-dashed p-10 text-center bg-card">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-bold text-foreground">Belum Ada Bahan Ajar di Bab Ini</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                {isLoading
                  ? "Sedang memuat berkas Bahan Ajar..."
                  : isSiswa
                    ? "Guru pengampu belum mengunggah materi pembelajaran untuk bab ini."
                    : "Bab ini belum memiliki berkas materi. Silakan klik tombol '+ Unggah Bahan Ajar' di atas untuk melengkapi materi pembelajaran."}
              </p>
              {!isSiswa && (
                <div className="mt-4">
                  <Button
                    size="sm"
                    className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
                    onClick={() => setIsUploadOpen(true)}
                  >
                    <Upload className="h-3.5 w-3.5" /> + Unggah Bahan Ajar Pertama
                  </Button>
                </div>
              )}
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {materialsWithLockState.map((m) => {
                const typeStr = (m.type || "").toUpperCase();
                const isAudio = typeStr.includes("AUDIO") || m.file_name?.endsWith(".mp3") || m.file_url?.endsWith(".mp3");
                const isTeks = typeStr.includes("TEKS") || Boolean(m.content_text);
                const isImage = typeStr.includes("GAMBAR") || m.file_url?.match(/\.(png|jpg|jpeg|webp)$/i);
                const isUrl = typeStr.includes("URL") || m.file_url?.startsWith("http");
                const isVideo = typeStr.includes("VIDEO");

                const isLocked = isSiswa && !m.isUnlocked;

                return (
                  <Card
                    key={m.id}
                    className={`border-border transition shadow-xs flex flex-col justify-between ${isLocked
                        ? "opacity-70 bg-muted/40 border-dashed"
                        : m.isCompleted
                          ? "border-emerald-500/40 bg-emerald-50/15 dark:bg-emerald-950/15"
                          : "hover:border-emerald-500/50"
                      }`}
                  >
                    <CardContent className="p-4 flex items-start gap-3">
                      <div
                        className={`h-12 w-12 rounded-xl grid place-items-center shrink-0 font-bold text-xl ${isLocked
                            ? "bg-muted text-muted-foreground"
                            : isAudio
                              ? "bg-amber-500/15 text-amber-600"
                              : isTeks
                                ? "bg-purple-500/15 text-purple-600"
                                : isVideo
                                  ? "bg-blue-500/15 text-blue-600"
                                  : isImage
                                    ? "bg-rose-500/15 text-rose-600"
                                    : isUrl
                                      ? "bg-sky-500/15 text-sky-600"
                                      : "bg-emerald-500/15 text-emerald-600"
                          }`}
                      >
                        {isLocked ? "🔒" : isTeks ? "📝" : isVideo ? "🎥" : isAudio ? "🎵" : isImage ? "🖼️" : isUrl ? "🔗" : "📄"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge variant="outline" className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 border-emerald-500/40">
                              Langkah #{m.sequence_order || 1}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={`text-[9px] px-1.5 py-0 font-medium ${m.access_mode === "SISWA_MANDIRI"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                                }`}
                            >
                              {m.access_mode === "SISWA_MANDIRI" ? "📚 Mandiri" : "🏫 Kendali Guru"}
                            </Badge>
                          </div>

                          {isSiswa ? (
                            m.isCompleted ? (
                              <Badge className="bg-emerald-600 text-white text-[10px] font-bold gap-0.5">
                                <CheckCircle2 className="h-3 w-3" /> Selesai
                              </Badge>
                            ) : isLocked ? (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400 text-[10px] font-bold gap-1">
                                <Lock className="h-3 w-3" /> Terkunci
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-400 text-[10px] font-bold">
                                Siap Dipelajari
                              </Badge>
                            )
                          ) : (
                            <Badge className={m.status === "Terverifikasi Waka" ? "bg-emerald-600 text-white text-[10px] font-bold" : "bg-amber-500 text-white text-[10px] font-bold"}>
                              {m.status === "Terverifikasi Waka" ? "✓ Terverifikasi" : "⏳ Menunggu"}
                            </Badge>
                          )}
                        </div>

                        <div className="font-bold text-sm text-foreground mt-1.5 leading-snug line-clamp-2">{m.title}</div>
                        <div className="text-xs text-muted-foreground mt-1.5 flex items-center justify-between gap-2 flex-wrap">
                          <span>Penyusun: <strong className="text-foreground font-semibold">{m.teacher}</strong></span>
                          <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                            {isUrl ? "🔗 Link Web" : isTeks ? "📝 Teks Langsung" : `💾 ${m.size}`}
                          </span>
                        </div>

                        {isLocked && m.lockReason && (
                          <div className="mt-2 p-2 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                            <Lock className="h-3.5 w-3.5 shrink-0" />
                            <span>{m.lockReason}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>

                    <div className="px-4 pb-3 pt-2.5 border-t border-border/80 flex items-center justify-between flex-wrap gap-2 bg-muted/20">
                      <div className="flex items-center gap-1.5 flex-wrap flex-1">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isLocked}
                          className={`h-7 text-xs font-bold px-2.5 gap-1 ${isLocked
                              ? "opacity-50 cursor-not-allowed"
                              : "border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-50/50"
                            }`}
                          onClick={() => {
                            if (isLocked) {
                              toast.warning(m.lockReason || "Materi ini belum dapat dibuka.");
                              return;
                            }
                            setPreviewModul(m);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" /> {isSiswa ? "Pelajari Materi" : "Pratinjau"}
                        </Button>

                        {isWakaOrAdmin && (
                          <Button
                            size="sm"
                            variant="outline"
                            className={`h-7 text-xs font-semibold px-2.5 ${m.status === "Terverifikasi Waka"
                                ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50"
                                : "bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-xs"
                              }`}
                            onClick={() => handleToggleVerification(m.id, m.status, m.title)}
                          >
                            {m.status === "Terverifikasi Waka" ? "✓ Sah" : "✅ Sahkan"}
                          </Button>
                        )}

                        {!isTeks && !isLocked && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`h-7 text-xs font-bold px-2.5 gap-1 ${isUrl ? "text-sky-600 hover:bg-sky-500/10" : "text-emerald-600 hover:bg-emerald-500/10"
                              }`}
                            onClick={() => handleDownloadModulPdf(m)}
                          >
                            {isUrl ? (
                              <>
                                <ExternalLink className="h-3.5 w-3.5" /> Buka Link
                              </>
                            ) : (
                              <>
                                <Download className="h-3.5 w-3.5" /> Unduh
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      {(isWakaOrAdmin || isGuru) && !isKamad && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-500/15 hover:text-rose-700 border border-rose-500/30 rounded-lg shrink-0"
                          onClick={() => setDeleteConfirmModul({ id: m.id, title: m.title })}
                          title="Hapus Bahan Ajar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* TAMPILAN LEVEL 1: PUSTAKA BAHAN AJAR (Semua Berkas & Struktur Bab)        */
        /* ========================================================================= */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-600" />
                <span>Pustaka Bahan Ajar:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedJenjang}</span>
                {selectedMapel !== "semua" && <span className="text-muted-foreground font-normal">({selectedMapel})</span>}
              </h2>
              <Badge variant="secondary" className="text-xs font-semibold">
                {viewMode === "semua_materi" ? `${currentFilteredMaterials.length} Berkas` : `${filteredTopics.length} Bab`}
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/70 self-start sm:self-auto">
              <Button
                size="sm"
                variant={viewMode === "semua_materi" ? "default" : "ghost"}
                className={`text-xs font-bold h-7 px-3 rounded-lg cursor-pointer ${
                  viewMode === "semua_materi" ? "bg-emerald-600 text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setViewMode("semua_materi")}
              >
                <FileText className="h-3.5 w-3.5 mr-1" /> Semua Berkas ({currentFilteredMaterials.length})
              </Button>
              <Button
                size="sm"
                variant={viewMode === "folder_bab" ? "default" : "ghost"}
                className={`text-xs font-bold h-7 px-3 rounded-lg cursor-pointer ${
                  viewMode === "folder_bab" ? "bg-emerald-600 text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setViewMode("folder_bab")}
              >
                <Folder className="h-3.5 w-3.5 mr-1" /> Struktur Bab ({filteredTopics.length})
              </Button>
            </div>
          </div>

          {viewMode === "semua_materi" ? (
            <div className="space-y-3">
              {/* Filter Bab Tabs */}
              {filteredTopics.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  <span className="text-[11px] font-semibold text-muted-foreground shrink-0 mr-1">Filter Bab:</span>
                  <button
                    type="button"
                    onClick={() => setSelectedTopicFilter("semua")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                      selectedTopicFilter === "semua"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    Semua
                  </button>
                  {filteredTopics.map((t, idx) => {
                    const count = availableModulList.filter(
                      (m) => m.topic_id === t.id || (m.chapter && m.chapter.trim().toLowerCase() === t.title.trim().toLowerCase())
                    ).length;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTopicFilter(t.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                          selectedTopicFilter === t.id
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <span>Bab #{t.sequence_order || idx + 1}: {t.title}</span>
                        <span className="text-[10px] opacity-80 font-mono">({count})</span>
                      </button>
                    );
                  })}
                  {unassignedMaterials.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedTopicFilter("none")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                        selectedTopicFilter === "none"
                          ? "bg-amber-600 text-white shadow-xs"
                          : "bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25"
                      }`}
                    >
                      <span>Materi Mandiri</span>
                      <span className="text-[10px] opacity-80 font-mono">({unassignedMaterials.length})</span>
                    </button>
                  )}
                </div>
              )}

              {/* Grid Berkas Bahan Ajar */}
              {currentFilteredMaterials.length === 0 ? (
                <Card className="border-border border-dashed p-10 text-center bg-card">
                  <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-60" />
                  <h3 className="text-base font-bold text-foreground">Belum Ada Bahan Ajar Terdaftar</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                    {isLoading
                      ? "Sedang memuat berkas Bahan Ajar..."
                      : isSiswa
                        ? "Guru pengampu belum mengunggah materi pembelajaran untuk tingkat kelas dan mapel ini."
                        : `Belum ada berkas bahan ajar untuk ${selectedJenjang} ${selectedMapel !== "semua" ? `pada mapel ${selectedMapel}` : ""}. Silakan klik tombol di bawah untuk mengunggah berkas modul PDF, video, audio, rangkuman teks, atau tautan materi pembelajaran.`}
                  </p>
                  {!isSiswa && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 cursor-pointer shadow-xs"
                        onClick={() => setIsUploadOpen(true)}
                      >
                        <Upload className="h-3.5 w-3.5" /> + Unggah Bahan Ajar Sekarang
                      </Button>
                    </div>
                  )}
                </Card>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {currentFilteredMaterials.map((m) => {
                    const typeStr = (m.type || "").toUpperCase();
                    const isAudio = typeStr.includes("AUDIO") || m.file_name?.endsWith(".mp3") || m.file_url?.endsWith(".mp3");
                    const isTeks = typeStr.includes("TEKS") || Boolean(m.content_text);
                    const isImage = typeStr.includes("GAMBAR") || m.file_url?.match(/\.(png|jpg|jpeg|webp)$/i);
                    const isUrl = typeStr.includes("URL") || m.file_url?.startsWith("http");
                    const isVideo = typeStr.includes("VIDEO");

                    return (
                      <Card
                        key={m.id}
                        className="border-border transition shadow-xs flex flex-col justify-between hover:border-emerald-500/50 bg-card"
                      >
                        <CardContent className="p-4 flex items-start gap-3">
                          <div
                            className={`h-12 w-12 rounded-xl grid place-items-center shrink-0 font-bold text-xl ${
                              isAudio
                                ? "bg-amber-500/15 text-amber-600"
                                : isTeks
                                  ? "bg-purple-500/15 text-purple-600"
                                  : isVideo
                                    ? "bg-blue-500/15 text-blue-600"
                                    : isImage
                                      ? "bg-rose-500/15 text-rose-600"
                                      : isUrl
                                        ? "bg-sky-500/15 text-sky-600"
                                        : "bg-emerald-500/15 text-emerald-600"
                            }`}
                          >
                            {isTeks ? "📝" : isVideo ? "🎥" : isAudio ? "🎵" : isImage ? "🖼️" : isUrl ? "🔗" : "📄"}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <Badge variant="outline" className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 border-emerald-500/40">
                                  {isUrl ? "Link Web" : isTeks ? "Teks" : m.type || "Dokumen"}
                                </Badge>
                                {m.chapter ? (
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium truncate max-w-[150px]">
                                    📁 {m.chapter}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-muted-foreground">
                                    Materi Mandiri
                                  </Badge>
                                )}
                              </div>

                              <Badge className={m.status === "Terverifikasi Waka" ? "bg-emerald-600 text-white text-[10px] font-bold" : "bg-amber-500 text-white text-[10px] font-bold"}>
                                {m.status === "Terverifikasi Waka" ? "✓ Terverifikasi" : "⏳ Menunggu"}
                              </Badge>
                            </div>

                            <div className="font-bold text-sm text-foreground mt-1.5 leading-snug line-clamp-2">{m.title}</div>
                            <div className="text-xs text-muted-foreground mt-1.5 flex items-center justify-between gap-2 flex-wrap">
                              <span>Penyusun: <strong className="text-foreground font-semibold">{m.teacher}</strong></span>
                              <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                                {isUrl ? "🔗 Link Web" : isTeks ? "📝 Teks Langsung" : `💾 ${m.size}`}
                              </span>
                            </div>
                          </div>
                        </CardContent>

                        <div className="px-4 pb-3 pt-2.5 border-t border-border/80 flex items-center justify-between flex-wrap gap-2 bg-muted/20">
                          <div className="flex items-center gap-1.5 flex-wrap flex-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs font-bold px-2.5 gap-1 border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 cursor-pointer"
                              onClick={() => setPreviewModul(m)}
                            >
                              <Eye className="h-3.5 w-3.5" /> Pratinjau
                            </Button>

                            {isWakaOrAdmin && (
                              <Button
                                size="sm"
                                variant="outline"
                                className={`h-7 text-xs font-semibold px-2.5 cursor-pointer ${
                                  m.status === "Terverifikasi Waka"
                                    ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50"
                                    : "bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-xs"
                                }`}
                                onClick={() => handleToggleVerification(m.id, m.status, m.title)}
                              >
                                {m.status === "Terverifikasi Waka" ? "✓ Sah" : "✅ Sahkan"}
                              </Button>
                            )}

                            {!isTeks && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className={`h-7 text-xs font-bold px-2.5 gap-1 cursor-pointer ${
                                  isUrl ? "text-sky-600 hover:bg-sky-500/10" : "text-emerald-600 hover:bg-emerald-500/10"
                                }`}
                                onClick={() => handleDownloadModulPdf(m)}
                              >
                                {isUrl ? (
                                  <>
                                    <ExternalLink className="h-3.5 w-3.5" /> Buka Link
                                  </>
                                ) : (
                                  <>
                                    <Download className="h-3.5 w-3.5" /> Unduh
                                  </>
                                )}
                              </Button>
                            )}
                          </div>

                          {(isWakaOrAdmin || isGuru) && !isKamad && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-500/15 hover:text-rose-700 border border-rose-500/30 rounded-lg shrink-0 cursor-pointer"
                              onClick={() => setDeleteConfirmModul({ id: m.id, title: m.title })}
                              title="Hapus Bahan Ajar"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Tampilan Folder Bab */
            <div className="space-y-4">
              {filteredTopics.length === 0 ? (
                <Card className="border-border border-dashed p-10 text-center bg-card">
                  <Layers className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-60" />
                  <h3 className="text-base font-bold text-foreground">Belum Ada Bab Terdaftar</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                    {isLoading
                      ? "Sedang memuat data Bab..."
                      : isSiswa
                        ? "Belum ada Bab pembelajaran yang diterbitkan untuk tingkat kelas dan mapel ini."
                        : `Belum ada Bab pembelajaran untuk ${selectedJenjang} ${selectedMapel !== "semua" ? `pada mapel ${selectedMapel}` : ""}. Silakan buat Bab baru untuk mengelompokkan bahan ajar.`}
                  </p>
                  {!isSiswa && (
                    <div className="mt-4">
                      <Button
                        size="sm"
                        className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 cursor-pointer"
                        onClick={() => {
                          setTopicToEdit(null);
                          setIsManageTopicOpen(true);
                        }}
                      >
                        <FolderPlus className="h-3.5 w-3.5" /> + Buat Bab Pertama Sekarang
                      </Button>
                    </div>
                  )}
                </Card>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredTopics.map((topic, idx) => {
                    const countMaterials = availableModulList.filter(
                      (m) => m.topic_id === topic.id || (m.chapter && m.chapter.trim().toLowerCase() === topic.title.trim().toLowerCase())
                    ).length;

                    return (
                      <Card
                        key={topic.id}
                        className="border-border hover:border-emerald-500/60 transition shadow-xs flex flex-col justify-between bg-card group"
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge variant="outline" className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20">
                                Bab #{topic.sequence_order || idx + 1}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] font-semibold text-muted-foreground">
                                {topic.class_name}
                              </Badge>
                            </div>

                            {!isSiswa && (
                              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                  title="Edit Bab"
                                  onClick={() => {
                                    setTopicToEdit(topic);
                                    setIsManageTopicOpen(true);
                                  }}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                {!isKamad && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                                    title="Hapus Bab"
                                    onClick={() => setTopicToDelete(topic)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>

                          <div>
                            <h3 className="font-bold text-sm text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition line-clamp-2">
                              {topic.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 min-h-[32px]">
                              {topic.description || "Topik dan capaian pembelajaran terpadu untuk bahan ajar."}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border/60">
                            <span className="font-semibold text-foreground truncate max-w-[150px]">
                              {topic.subject_name}
                            </span>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] font-semibold ${countMaterials > 0
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                                  : "bg-muted text-muted-foreground"
                                }`}
                            >
                              {countMaterials} Bahan Ajar
                            </Badge>
                          </div>
                        </CardContent>

                        <div className="px-4 pb-3 pt-1">
                          <Button
                            size="sm"
                            className="w-full h-8 bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-xs gap-1 shadow-2xs group-hover:shadow-xs transition cursor-pointer"
                            onClick={() => setSelectedTopic(topic)}
                          >
                            Buka Bahan Ajar Bab Ini <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Section Cadangan: Berkas Bahan Ajar Belum Masuk Bab */}
              {unassignedMaterials.length > 0 && (
                <div className="mt-8 pt-4 border-t border-border">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">
                          Bahan Ajar Umum / Belum Masuk Bab ({unassignedMaterials.length} Berkas)
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          Berkas bahan ajar pada tingkat {selectedJenjang} yang belum dikelompokkan ke dalam Bab spesifik.
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs font-semibold cursor-pointer"
                      onClick={() => setShowUnassignedSection(!showUnassignedSection)}
                    >
                      {showUnassignedSection ? "Sembunyikan" : "Tampilkan Berkas"}
                    </Button>
                  </div>

                  {showUnassignedSection && (
                    <div className="grid sm:grid-cols-2 gap-3 mt-3">
                      {unassignedMaterials.map((m) => (
                        <Card key={m.id} className="border-border p-3.5 bg-card flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <Badge variant="outline" className="text-[10px] font-mono">
                                {m.jenjang} • {m.mapel}
                              </Badge>
                              <Badge className={m.status === "Terverifikasi Waka" ? "bg-emerald-600 text-white text-[9px]" : "bg-amber-500 text-white text-[9px]"}>
                                {m.status === "Terverifikasi Waka" ? "✓ Sah" : "⏳ Menunggu"}
                              </Badge>
                            </div>
                            <h5 className="text-xs font-bold text-foreground line-clamp-2">{m.title}</h5>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Penyusun: {m.teacher}</p>
                          </div>

                          <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-border">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs px-2 cursor-pointer"
                              onClick={() => setPreviewModul(m)}
                            >
                              <Eye className="h-3 w-3 mr-1" /> Pratinjau
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs px-2 text-emerald-600 cursor-pointer"
                              onClick={() => handleDownloadModulPdf(m)}
                            >
                              <Download className="h-3 w-3 mr-1" /> Unduh
                            </Button>
                            {!isSiswa && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-rose-600 hover:bg-rose-50 cursor-pointer"
                                onClick={() => setDeleteConfirmModul({ id: m.id, title: m.title })}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Dialog Manage Bab (Tambah / Edit) */}
      <ManageTopicDialog
        isOpen={isManageTopicOpen}
        onOpenChange={setIsManageTopicOpen}
        topicToEdit={topicToEdit}
        activeMapel={selectedMapel === "semua" ? (allowedMapels[0] || "Al Qur'an Hadis") : selectedMapel}
        activeJenjang={selectedJenjang === "semua" ? "Kelas VIII" : selectedJenjang}
        onSave={handleSaveTopic}
      />

      {/* Dialog Konfirmasi Hapus Bab */}
      <Dialog open={!!topicToDelete} onOpenChange={(open) => !open && setTopicToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600 text-base font-bold">
              <AlertCircle className="h-5 w-5" /> Hapus Bab Pembelajaran?
            </DialogTitle>
            <DialogDescription className="text-xs pt-1">
              Apakah Anda yakin ingin menghapus Bab <strong>"{topicToDelete?.title}"</strong>?
              <br />
              <span className="text-muted-foreground block mt-1">
                Catatan: Berkas bahan ajar di dalam bab ini tidak akan terhapus, melainkan ikatannya dengan bab ini dilepas (masuk ke bahan ajar umum).
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => setTopicToDelete(null)}
            >
              Batal
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="text-xs font-bold gap-1"
              onClick={() => topicToDelete && handleDeleteTopic(topicToDelete)}
            >
              <Trash2 className="h-3.5 w-3.5" /> Ya, Hapus Bab
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Upload Bahan Ajar */}
      <UploadModulDialog
        isOpen={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        defaultMapel={selectedTopic?.subject_name || (selectedMapel !== "semua" ? selectedMapel : (allowedMapels[0] || "Al Qur'an Hadis"))}
        defaultJenjang={selectedTopic?.class_name || (selectedJenjang !== "semua" ? selectedJenjang : "Kelas VIII")}
        defaultTopicId={selectedTopic?.id}
        defaultChapter={selectedTopic?.title}
        availableTopics={filteredTopics.map((t) => ({ id: t.id, title: t.title, sequence_order: t.sequence_order }))}
        onUpload={handleUploadSubmit}
      />

      {/* Dialog Preview Bahan Ajar */}
      <PreviewModulDialog
        previewModul={previewModul}
        isOpen={!!previewModul}
        onOpenChange={(open) => !open && setPreviewModul(null)}
        onDownload={handleDownloadModulPdf}
        onMaterialCompleted={() => fetchMaterials()}
      />

      {/* Dialog Konfirmasi Hapus Berkas Bahan Ajar */}
      <DeleteModulDialog
        deleteConfirmModul={deleteConfirmModul}
        isOpen={!!deleteConfirmModul}
        onOpenChange={(open) => !open && setDeleteConfirmModul(null)}
        onConfirmDelete={handleDeleteModul}
      />
    </div>
  );
}
