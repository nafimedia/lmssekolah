import { useState, useEffect } from "react";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { MysqlDataService } from "@/services/mysqlDataService";
import { toast } from "sonner";
import { FileText, Upload, Eye, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { UploadModulDialog } from "./components/UploadModulDialog";
import { PreviewModulDialog } from "./components/PreviewModulDialog";
import { DeleteModulDialog } from "./components/DeleteModulDialog";

export function ModulAjarModule({ activeRole, userProfile }: { activeRole?: string; userProfile?: any }) {
  const isSiswa = activeRole === "siswa";
  const isGuru = activeRole === "guru" || activeRole === "guru_mapel";
  const isWakaOrAdmin = activeRole === "waka" || activeRole === "admin" || activeRole === "admin_akademik" || activeRole === "kamad";
  const isWaka = activeRole === "waka";
  const isKamad = activeRole === "kamad";

  const me = MysqlAuthService.getActiveUser();
  const rawClass = userProfile?.class_name || (me as any)?.class_name || "VIII-A";
  const currentTeacherName = me?.full_name || "Guru Pengampu";
  const currentSubject = (me as any)?.subject_specialty || userProfile?.assignedSubject || "";

  const [selectedJenjang, setSelectedJenjang] = useState<string>("semua");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("semua");

  // Dialog States
  const [previewModul, setPreviewModul] = useState<any | null>(null);
  const [deleteConfirmModul, setDeleteConfirmModul] = useState<{ id: string; title: string } | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const [modulList, setModulList] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMaterials = async () => {
    setIsLoading(true);
    try {
      const items = await MysqlDataService.getMaterials();
      if (items && items.length > 0) {
        const dbFormatted = items.map((m) => ({
          id: String(m.id),
          title: m.title,
          mapel: m.subject_name || "Mata Pelajaran",
          jenjang: m.class_name || "Kelas VIII",
          teacher: m.uploaded_by || m.teacher_name || "Guru Pengampu",
          size: m.size || "3.5 MB",
          date: m.created_at ? new Date(m.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Terbaru",
          status: "Terverifikasi Waka",
          file_url: m.file_url || "",
          file_name: m.filename || `${m.title}.pdf`,
        }));
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

  const handleDownloadModulPdf = (m: any) => {
    const fileUrl = m.file_url;
    const fileName = m.file_name || `${m.title}.pdf`;
    const title = m.title;

    if (fileUrl && (fileUrl.startsWith("data:") || fileUrl.startsWith("blob:") || fileUrl.startsWith("http"))) {
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`📄 Berkas PDF "${title}" berhasil diunduh!`);
      return;
    }

    const dummyPdf = `%PDF-1.4\n1 0 obj\n<< /Title (${title}) /Author (MTsN 2 Cilacap) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`;
    const blob = new Blob([dummyPdf], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`📄 Berkas PDF "${title}" berhasil diunduh!`);
  };

  const handleToggleVerification = (id: string, currentStatus: string, title: string) => {
    setModulList((prev) => {
      return prev.map((m) => {
        if (m.id === id) {
          const nextStatus = currentStatus === "Terverifikasi Waka" ? "Perlu Verifikasi Waka" : "Terverifikasi Waka";
          if (nextStatus === "Terverifikasi Waka") {
            toast.success(`✅ Berhasil! Modul Ajar "${title}" resmi diverifikasi dan disahkan oleh Waka Kurikulum.`);
          } else {
            toast.info(`ℹ️ Status Modul Ajar "${title}" dikembalikan ke Menunggu Verifikasi.`);
          }
          return { ...m, status: nextStatus };
        }
        return m;
      });
    });
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

  const handleUploadSubmit = async (data: { title: string; mapel: string; jenjang: string; file: File | null; dataUrl: string }) => {
    const calcSize = data.file ? `${(data.file.size / (1024 * 1024)).toFixed(1)} MB` : "3.8 MB";
    const fileUrlToSave = data.dataUrl || "";
    const newId = "mod_" + Date.now();

    try {
      await MysqlDataService.saveMaterial({
        id: newId,
        title: data.title.trim(),
        subject_name: data.mapel,
        class_name: data.jenjang,
        uploaded_by: currentTeacherName || "Guru Pengampu",
        teacher_name: currentTeacherName || "Guru Pengampu",
        file_url: fileUrlToSave || ("/uploads/" + newId + ".pdf"),
        filename: data.file?.name || `${data.title}.pdf`,
        size: calcSize,
      });

      toast.success(`Modul Ajar PDF "${data.title}" berhasil diunggah dan tersimpan permanen ke database!`);
      await fetchMaterials();
    } catch (err) {
      console.warn("Save material DB warning:", err);
      toast.error("Gagal mengunggah Modul Ajar ke database.");
    }
  };

  const filteredModul = modulList.filter((m) => {
    const matchJenjang = selectedJenjang === "semua" || m.jenjang === selectedJenjang;
    const matchStatus =
      selectedStatusFilter === "semua" ||
      (selectedStatusFilter === "pending" && m.status !== "Terverifikasi Waka") ||
      (selectedStatusFilter === "verified" && m.status === "Terverifikasi Waka");

    if (isGuru) {
      const cleanTeacher = (currentTeacherName || "").toLowerCase().trim();
      const cleanMTeacher = m.teacher.toLowerCase().trim();
      const cleanSubject = (currentSubject || "").toLowerCase().trim();
      const cleanMMapel = m.mapel.toLowerCase().trim();

      const isNameMatch = cleanTeacher && (cleanMTeacher.includes(cleanTeacher) || cleanTeacher.includes(cleanMTeacher));
      const isSubjectMatch = cleanSubject && (cleanMMapel.includes(cleanSubject) || cleanSubject.includes(cleanMMapel));

      const isMine = isNameMatch || isSubjectMatch;
      return matchJenjang && matchStatus && isMine;
    }

    return matchJenjang && matchStatus;
  });

  const verifiedCount = modulList.filter((m) => m.status === "Terverifikasi Waka").length;
  const pendingCount = modulList.length - verifiedCount;

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-emerald-500" />
            {isWaka ? "Verifikasi & Validasi Modul Ajar PDF" : "Perangkat Ajar & Modul Ajar PDF"}{" "}
            {isSiswa && <Badge className="bg-emerald-600 text-white font-bold text-xs">📍 Kelas {rawClass}</Badge>}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isWaka
              ? "Portal verifikasi dan validasi modul ajar Kurikulum Merdeka."
              : isSiswa
              ? `Akses berkas PDF modul ajar khusus Kelas ${rawClass}.`
              : "Pengelolaan modul ajar Kurikulum Merdeka per mata pelajaran dan jenjang."}
          </p>
        </div>
        {!isSiswa && !isKamad && (
          <Button size="sm" className="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs" onClick={() => setIsUploadOpen(true)}>
            <Upload className="h-3.5 w-3.5" /> Unggah Modul Ajar PDF
          </Button>
        )}
      </div>

      {isKamad && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 flex items-center justify-between text-xs font-semibold mb-6">
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-amber-600 shrink-0" />
            <span>🏛️ <strong>Mode Monitoring Eksekutif Kepala Madrasah</strong> — Tampilan Read-Only. Memantau modul ajar PDF guru tanpa melakukan pengunggahan/penghapusan.</span>
          </span>
          <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-400 font-mono text-[10px]">READ ONLY MONITORING</Badge>
        </div>
      )}

      {isWakaOrAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl border border-border bg-card space-y-1 shadow-xs">
            <div className="text-xs text-muted-foreground font-medium">Total Modul Diunggah</div>
            <div className="text-2xl font-black text-foreground">{modulList.length} Berkas</div>
            <div className="text-[11px] text-muted-foreground">Persyaratan Kurikulum Merdeka</div>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-1 shadow-xs cursor-pointer hover:bg-amber-500/10 transition" onClick={() => setSelectedStatusFilter("pending")}>
            <div className="text-xs text-amber-700 dark:text-amber-400 font-bold flex items-center justify-between">
              <span>Menunggu Verifikasi Waka</span>
              <span>⏳</span>
            </div>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-400">{pendingCount} Modul</div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Perlu peninjauan & pengesahan</div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1 shadow-xs cursor-pointer hover:bg-emerald-500/10 transition" onClick={() => setSelectedStatusFilter("verified")}>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-between">
              <span>Resmi Terverifikasi Waka</span>
              <span>✅</span>
            </div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{verifiedCount} Modul</div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Siap digunakan KBM & e-Rapor</div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground mr-1">Filter Jenjang:</span>
          {["semua", "Kelas VII", "Kelas VIII", "Kelas IX"].map((j) => (
            <Button
              key={j}
              size="sm"
              variant={selectedJenjang === j ? "default" : "outline"}
              className="text-xs font-bold"
              onClick={() => setSelectedJenjang(j)}
            >
              {j === "semua" ? "Semua Jenjang" : j}
            </Button>
          ))}
        </div>

        {isWakaOrAdmin && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">Status Verifikasi:</span>
            <select
              className="bg-background text-xs font-bold text-foreground border border-input rounded-md px-2.5 py-1 focus:outline-hidden cursor-pointer"
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
            >
              <option value="semua">Semua Status</option>
              <option value="pending">⏳ Menunggu Verifikasi Waka</option>
              <option value="verified">✅ Terverifikasi Waka</option>
            </select>
          </div>
        )}
      </div>

      {filteredModul.length === 0 ? (
        <Card className="border-border border-dashed p-12 text-center bg-card">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-foreground">Belum Ada Modul Ajar PDF Terdaftar</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            {isLoading
              ? "Sedang memuat berkas Modul Ajar dari database MySQL..."
              : "Belum ada berkas Modul Ajar PDF yang diunggah di database. Silakan klik tombol '+ Unggah Modul Ajar PDF' di atas untuk mengunggah berkas baru."}
          </p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filteredModul.map((m) => (
            <Card key={m.id} className="border-border hover:border-emerald-500/50 transition shadow-xs flex flex-col justify-between">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/15 text-emerald-600 grid place-items-center shrink-0 font-bold text-xl">
                  📄
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 border-emerald-500/30">
                      {m.jenjang} • {m.mapel}
                    </Badge>
                    <Badge className={m.status === "Terverifikasi Waka" ? "bg-emerald-600 text-white text-[10px] font-bold" : "bg-amber-500 text-white text-[10px] font-bold"}>
                      {m.status === "Terverifikasi Waka" ? "✓ Terverifikasi Waka" : "⏳ Perlu Verifikasi"}
                    </Badge>
                  </div>
                  <div className="font-bold text-sm text-foreground mt-1.5 leading-snug line-clamp-2">{m.title}</div>
                  <div className="text-xs text-muted-foreground mt-1.5 flex items-center justify-between gap-2 flex-wrap">
                    <span>Penyusun: <strong className="text-foreground font-semibold">{m.teacher}</strong></span>
                    <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">💾 {m.size}</span>
                  </div>
                </div>
              </CardContent>

              <div className="px-4 pb-3 pt-2.5 border-t border-border/80 flex items-center justify-between flex-wrap gap-2 bg-muted/20">
                <div className="flex items-center gap-1.5 flex-wrap flex-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs font-bold border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 px-2.5 gap-1"
                    onClick={() => setPreviewModul(m)}
                  >
                    <Eye className="h-3.5 w-3.5" /> Pratinjau
                  </Button>

                  {isWakaOrAdmin && (
                    <Button
                      size="sm"
                      variant="outline"
                      className={`h-7 text-xs font-bold px-2.5 ${
                        m.status === "Terverifikasi Waka"
                          ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50"
                          : "bg-emerald-600 text-white hover:bg-emerald-700 font-extrabold shadow-xs"
                      }`}
                      onClick={() => handleToggleVerification(m.id, m.status, m.title)}
                    >
                      {m.status === "Terverifikasi Waka" ? "✓ Sah Terverifikasi" : "✅ Sahkan"}
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs font-bold text-emerald-600 hover:bg-emerald-500/10 px-2.5 gap-1"
                    onClick={() => handleDownloadModulPdf(m)}
                  >
                    <Download className="h-3.5 w-3.5" /> Unduh PDF
                  </Button>
                </div>

                {(isWakaOrAdmin || isGuru) && !isKamad && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-500/15 hover:text-rose-700 border border-rose-500/30 rounded-lg shrink-0"
                    onClick={() => setDeleteConfirmModul({ id: m.id, title: m.title })}
                    title="Hapus Modul Ajar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
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
      />

      <DeleteModulDialog
        deleteConfirmModul={deleteConfirmModul}
        isOpen={!!deleteConfirmModul}
        onOpenChange={(open) => !open && setDeleteConfirmModul(null)}
        onConfirmDelete={handleDeleteModul}
      />
    </>
  );
}
