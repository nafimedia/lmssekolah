import { useState, useEffect, useMemo } from "react";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { MysqlDataService } from "@/services/mysqlDataService";
import { toast } from "sonner";
import {
  FileText,
  Upload,
  Eye,
  Download,
  Trash2,
  Music,
  Image as ImageIcon,
  Globe,
  ExternalLink,
  Video,
  FileEdit,
  Lock,
  Unlock,
  CheckCircle2,
  ListOrdered,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { UploadModulDialog, UploadModulPayload } from "./components/UploadModulDialog";
import { PreviewModulDialog } from "./components/PreviewModulDialog";
import { DeleteModulDialog } from "./components/DeleteModulDialog";

export function ModulAjarModule({ activeRole, userProfile }: { activeRole?: string; userProfile?: any }) {
  const isSiswa = activeRole === "siswa";
  const isGuru = activeRole === "guru" || activeRole === "guru_mapel";
  const isWakaOrAdmin = activeRole === "waka" || activeRole === "admin" || activeRole === "admin_akademik" || activeRole === "kamad";
  const isKamad = activeRole === "kamad";

  const me = MysqlAuthService.getActiveUser();
  const currentTeacherName = me?.full_name || "Guru Pengampu";
  const currentSubject = (me as any)?.subject_specialty || userProfile?.assignedSubject || "";

  const [selectedJenjang, setSelectedJenjang] = useState<string>("semua");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("semua");

  // Dialog States
  const [previewModul, setPreviewModul] = useState<any | null>(null);
  const [deleteConfirmModul, setDeleteConfirmModul] = useState<{ id: string; title: string } | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const [modulList, setModulList] = useState<Array<any>>([]);
  const [completions, setCompletions] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMaterials = async () => {
    setIsLoading(true);
    try {
      const [items, compList] = await Promise.all([
        MysqlDataService.getMaterials(),
        MysqlDataService.getMaterialCompletions().catch(() => []),
      ]);
      setCompletions(compList || []);
      if (items && items.length > 0) {
        const dbFormatted = items.map((m) => ({
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
        }));

        dbFormatted.sort((a, b) => (a.sequence_order || 1) - (b.sequence_order || 1));
        setModulList(dbFormatted);
      } else {
        setModulList([]);
      }
    } catch (e) {
      setModulList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

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
      } as any);

      if (res === false) {
        toast.error("Gagal mengunggah Bahan Ajar ke database.");
        return;
      }

      toast.success(`Bahan Ajar "${data.title}" berhasil diunggah (Langkah #${data.sequence_order || 1})!`);
      await fetchMaterials();
    } catch (err) {
      console.warn("Save material DB warning:", err);
      toast.error("Gagal mengunggah Bahan Ajar ke database.");
    }
  };

  const filteredModul = modulList.filter((m) => {
    const matchJenjang = selectedJenjang === "semua" || m.jenjang === selectedJenjang;
    const matchStatus =
      selectedStatusFilter === "semua" ||
      (selectedStatusFilter === "verified" && m.status === "Terverifikasi Waka") ||
      (selectedStatusFilter === "pending" && m.status !== "Terverifikasi Waka");
    return matchJenjang && matchStatus;
  });

  // Calculate student gating / sequence lock
  const materialsWithLockState = useMemo(() => {
    if (!isSiswa) return filteredModul;

    const mapelGroups: Record<string, any[]> = {};
    for (const m of filteredModul) {
      const mapelKey = (m.mapel || "Umum").toLowerCase().trim();
      if (!mapelGroups[mapelKey]) mapelGroups[mapelKey] = [];
      mapelGroups[mapelKey].push(m);
    }

    const result: any[] = [];
    for (const mapelKey in mapelGroups) {
      const list = mapelGroups[mapelKey].sort((a, b) => (a.sequence_order || 1) - (b.sequence_order || 1));
      list.forEach((m, idx) => {
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

        result.push({
          ...m,
          isCompleted,
          isUnlocked,
          lockReason,
        });
      });
    }

    return result.sort((a, b) => (a.sequence_order || 1) - (b.sequence_order || 1));
  }, [filteredModul, isSiswa, completedMaterialIds]);

  const verifiedCount = modulList.filter((m) => m.status === "Terverifikasi Waka").length;
  const pendingCount = modulList.length - verifiedCount;

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            {isSiswa ? "Bahan Ajar & Materi Belajar KBM" : "Pustaka Bahan Ajar & Modul Kurikulum"}
          </h1>
        </div>

        {!isSiswa && (
          <Button
            size="sm"
            className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-2xs px-3"
            onClick={() => setIsUploadOpen(true)}
          >
            <Upload className="h-3.5 w-3.5" /> + Unggah Bahan Ajar
          </Button>
        )}
      </div>

      {/* Metric Quick Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <FileText className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Total Bahan Ajar</p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{modulList.length} Berkas</p>
          </div>
        </div>

        <div
          className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs cursor-pointer hover:border-amber-500/50 transition-colors"
          onClick={() => setSelectedStatusFilter("pending")}
        >
          <div className="h-7 w-7 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold">⏳</span>
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
            <span className="text-xs">✅</span>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Telah Terverifikasi</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">{verifiedCount} Modul</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold">🏫</span>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Jenjang Filter</p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5 truncate">{selectedJenjang === "semua" ? "Semua Jenjang" : selectedJenjang}</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-2.5 rounded-xl bg-card border border-border flex flex-wrap items-center justify-between gap-2.5 shadow-2xs text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-muted-foreground mr-1">Filter Jenjang:</span>
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/70 h-8">
            {["semua", "Kelas VII", "Kelas VIII", "Kelas IX"].map((j) => (
              <Button
                key={j}
                size="sm"
                variant={selectedJenjang === j ? "default" : "ghost"}
                className={`text-xs font-bold h-6 px-2.5 rounded-lg ${selectedJenjang === j ? "bg-emerald-600 text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setSelectedJenjang(j)}
              >
                {j === "semua" ? "Semua" : j}
              </Button>
            ))}
          </div>
        </div>

        {isWakaOrAdmin && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground">Status:</span>
            <select
              className="h-8 bg-background text-xs font-semibold text-foreground border border-input rounded-lg px-2.5 cursor-pointer hover:border-primary/50 transition"
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

      {materialsWithLockState.length === 0 ? (
        <Card className="border-border border-dashed p-12 text-center bg-card">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-foreground">Belum Ada Bahan Ajar Terdaftar</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            {isLoading
              ? "Sedang memuat berkas Bahan Ajar..."
              : isSiswa
              ? "Belum ada bahan ajar yang diterbitkan untuk kelas Anda. Silakan hubungi guru pengampu."
              : "Belum ada berkas Bahan Ajar yang diunggah. Silakan klik tombol '+ Unggah Bahan Ajar' di atas untuk mengunggah berkas baru."}
          </p>
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
                className={`border-border transition shadow-xs flex flex-col justify-between ${
                  isLocked
                    ? "opacity-70 bg-muted/40 border-dashed"
                    : m.isCompleted
                    ? "border-emerald-500/40 bg-emerald-50/15 dark:bg-emerald-950/15"
                    : "hover:border-emerald-500/50"
                }`}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div
                    className={`h-12 w-12 rounded-xl grid place-items-center shrink-0 font-bold text-xl ${
                      isLocked
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
                        <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground border-border">
                          {m.jenjang} • {m.mapel}
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
                          {m.status === "Terverifikasi Waka" ? "✓ Terverifikasi" : "⏳ Perlu Verifikasi"}
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
                      className={`h-7 text-xs font-bold px-2.5 gap-1 ${
                        isLocked
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
                        className={`h-7 text-xs font-semibold px-2.5 ${
                          m.status === "Terverifikasi Waka"
                            ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50"
                            : "bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-xs"
                        }`}
                        onClick={() => handleToggleVerification(m.id, m.status, m.title)}
                      >
                        {m.status === "Terverifikasi Waka" ? "✓ Sah Terverifikasi" : "✅ Sahkan"}
                      </Button>
                    )}

                    {!isTeks && !isLocked && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`h-7 text-xs font-bold px-2.5 gap-1 ${
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
                            <Download className="h-3.5 w-3.5" /> Unduh Berkas
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

      <UploadModulDialog
        isOpen={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        defaultMapel={currentSubject}
        onUpload={handleUploadSubmit}
      />

      <PreviewModulDialog
        previewModul={previewModul}
        isOpen={!!previewModul}
        onOpenChange={(open) => !open && setPreviewModul(null)}
        onDownload={handleDownloadModulPdf}
        onMaterialCompleted={() => fetchMaterials()}
      />

      <DeleteModulDialog
        deleteConfirmModul={deleteConfirmModul}
        isOpen={!!deleteConfirmModul}
        onOpenChange={(open) => !open && setDeleteConfirmModul(null)}
        onConfirmDelete={handleDeleteModul}
      />
    </div>
  );
}
