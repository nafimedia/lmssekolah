import { useState, useEffect, useMemo } from "react";
import { Upload, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { MysqlDataService } from "@/services/mysqlDataService";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { filterSubjectsForUser, ALL_SCHOOL_SUBJECTS } from "@/services/teacherSubjectAccess";
import { validateUploadedFile } from "@/lib/fileValidation";

export const JENIS_PERANGKAT_OPTIONS = [
  { value: "Modul Ajar / RPP", label: "📘 Modul Ajar / RPP Merdeka" },
  { value: "ATP / CP", label: "🗺️ Alur Tujuan Pembelajaran (ATP / CP)" },
  { value: "Program Tahunan", label: "🗓️ Program Tahunan (Prota)" },
  { value: "Program Semester", label: "📅 Program Semester (Promes)" },
  { value: "KKTP", label: "📊 Kriteria Ketercapaian (KKTP)" },
  { value: "Rubrik & Asesmen", label: "📝 Kisi-Kisi & Rubrik Asesmen" },
];

interface UploadPerangkatDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMapel?: string | null;
  defaultKelas?: "VII" | "VIII" | "IX";
  allowedSubjectList?: string[];
  onSuccess: () => void;
}

export function UploadPerangkatDialog({
  isOpen,
  onOpenChange,
  defaultMapel,
  defaultKelas = "VIII",
  allowedSubjectList,
  onSuccess,
}: UploadPerangkatDialogProps) {
  const fallbackAllowed = filterSubjectsForUser(ALL_SCHOOL_SUBJECTS);
  const allowedMapels = useMemo(() => {
    if (allowedSubjectList && allowedSubjectList.length > 0) {
      return allowedSubjectList;
    }
    return fallbackAllowed;
  }, [allowedSubjectList]);

  const [title, setTitle] = useState("");
  const [jenisPerangkat, setJenisPerangkat] = useState("Modul Ajar / RPP");
  const [mapel, setMapel] = useState(defaultMapel || allowedMapels[0] || "Al Qur'an Hadis");
  const [jenjang, setJenjang] = useState<"Kelas VII" | "Kelas VIII" | "Kelas IX">(`Kelas ${defaultKelas}`);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultMapel && allowedMapels.includes(defaultMapel)) {
      setMapel(defaultMapel);
    } else if (allowedMapels.length > 0 && !allowedMapels.includes(mapel)) {
      setMapel(allowedMapels[0]);
    }
    if (defaultKelas) {
      setJenjang(`Kelas ${defaultKelas}`);
    }
  }, [defaultMapel, defaultKelas, isOpen, allowedMapels]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateUploadedFile(file.name, file.size, file.type, {
        maxSizeMb: 25,
        allowedExtensions: ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx"],
      });

      if (!validation.valid) {
        toast.error(`⚠️ Berkas Ditolak: ${validation.error}`);
        e.target.value = "";
        setSelectedFile(null);
        setFileDataUrl("");
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setFileDataUrl(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      return toast.error("Judul dokumen perangkat wajib diisi!");
    }

    setIsSubmitting(true);
    const activeUser = MysqlAuthService.getActiveUser();
    const teacherName = activeUser?.full_name || "Guru Pengampu";
    const newId = "mat_" + Date.now();

    try {
      const res = await MysqlDataService.saveMaterial({
        id: newId,
        title: title.trim(),
        subject_name: mapel,
        class_name: jenjang,
        type: jenisPerangkat,
        status: "Menunggu Verifikasi Waka",
        uploaded_by: teacherName,
        teacher_name: teacherName,
        file_url: fileDataUrl || `/uploads/modul_ajar/${newId}.pdf`,
        filename: selectedFile?.name || `${title.trim()}.pdf`,
        size: selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "1.5 MB",
      } as any);

      if (res === false) {
        toast.error("Gagal mengunggah berkas perangkat pembelajaran.");
        return;
      }

      toast.success(`✅ Berhasil! Dokumen "${title}" telah diunggah dan diajukan ke Waka Kurikulum.`);
      setTitle("");
      setSelectedFile(null);
      setFileDataUrl("");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Terjadi kesalahan saat mengunggah dokumen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-border bg-card">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-emerald-600 text-white font-bold text-[10px] gap-1">
              <Sparkles className="h-3 w-3" /> KURIKULUM MERDEKA
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              {mapel} · {jenjang}
            </span>
          </div>
          <DialogTitle className="text-base font-extrabold flex items-center gap-2">
            <Upload className="h-5 w-5 text-emerald-600" /> Unggah Perangkat Pembelajaran Baru
          </DialogTitle>
          <DialogDescription className="text-xs">
            Unggah dokumen administrasi KBM guru untuk diverifikasi dan disahkan oleh Waka Kurikulum.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
          <div>
            <Label className="text-xs font-bold">Jenis Dokumen Perangkat:</Label>
            <select
              className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1 font-semibold"
              value={jenisPerangkat}
              onChange={(e) => setJenisPerangkat(e.target.value)}
            >
              {JENIS_PERANGKAT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="perangkat-title" className="text-xs font-bold">
              Judul Dokumen Perangkat:
            </Label>
            <Input
              id="perangkat-title"
              placeholder="Contoh: Modul Ajar Bab 1 — Teks Prosedur & Analisis Kasus"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-bold">Mata Pelajaran:</Label>
              <select
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1"
                value={mapel}
                onChange={(e) => setMapel(e.target.value)}
              >
                {allowedMapels.map((m: any) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs font-bold">Jenjang Tingkat:</Label>
              <select
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1"
                value={jenjang}
                onChange={(e) => setJenjang(e.target.value as any)}
              >
                <option value="Kelas VII">Tingkat VII (Fase D)</option>
                <option value="Kelas VIII">Tingkat VIII (Fase D)</option>
                <option value="Kelas IX">Tingkat IX (Fase D)</option>
              </select>
            </div>
          </div>

          <div>
            <Label className="text-xs font-bold">Pilih Berkas Dokumen (PDF / DOCX):</Label>
            <Input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileChange}
              className="mt-1 text-xs cursor-pointer"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Format .PDF, .DOC, .DOCX (Maksimal 25 MB).
            </p>
          </div>

          <DialogFooter className="pt-3 gap-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs font-bold"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-xs"
            >
              <Upload className="h-4 w-4" /> {isSubmitting ? "Mengunggah..." : "Unggah & Ajukan Verifikasi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
