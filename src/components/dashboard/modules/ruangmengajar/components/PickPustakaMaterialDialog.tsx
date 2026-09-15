import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FolderDown,
  Search,
  FileText,
  Video,
  Music,
  Image as ImageIcon,
  Globe,
  FileEdit,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { MysqlDataService, MaterialRow } from "@/services/mysqlDataService";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { isSameSubject } from "@/utils/subjectNormalization";
import { isSameClass } from "@/utils/classNormalization";
import { toast } from "sonner";

interface PickPustakaMaterialDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeRombel: string;
  activeMapel: string;
  alreadyAttachedIds?: string[];
  onSelectMaterial: (material: MaterialRow) => Promise<void> | void;
}

export function PickPustakaMaterialDialog({
  isOpen,
  onOpenChange,
  activeRombel,
  activeMapel,
  alreadyAttachedIds = [],
  onSelectMaterial,
}: PickPustakaMaterialDialogProps) {
  const me = MysqlAuthService.getActiveUser();
  const currentTeacherName = (me?.full_name || "Guru Pengampu").toLowerCase().trim();

  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    MysqlDataService.getMaterials()
      .then((items) => {
        if (!isMounted) return;
        if (!items || items.length === 0) {
          setMaterials([]);
          return;
        }

        // Filter materi yang cocok dengan Mapel & Jenjang/Rombel
        const filtered = items.filter((m) => {
          // 1. Subject match
          const matchSubject = isSameSubject(m.subject_name || "", activeMapel);
          if (!matchSubject) return false;

          // 2. Class/Grade match (misal: "Kelas VIII" cocok dengan "Kelas VIII A")
          const matchClass =
            !m.class_name ||
            m.class_name === "Semua Kelas" ||
            isSameClass(m.class_name, activeRombel) ||
            (m.class_name && m.class_name.toLowerCase().includes(activeRombel.toLowerCase()));

          return matchClass;
        });

        setMaterials(filtered);
      })
      .catch((err) => {
        console.warn("Gagal memuat materi pustaka:", err);
        if (isMounted) setMaterials([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeMapel, activeRombel]);

  const filteredList = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      (m.chapter && m.chapter.toLowerCase().includes(search.toLowerCase())) ||
      (m.uploaded_by && m.uploaded_by.toLowerCase().includes(search.toLowerCase()));

    const typeUpper = (m.type || "").toUpperCase();
    const matchesType =
      filterType === "all" ||
      (filterType === "dokumen" && (typeUpper.includes("DOKUMEN") || typeUpper.includes("MODUL") || typeUpper.includes("PPT"))) ||
      (filterType === "video" && typeUpper.includes("VIDEO")) ||
      (filterType === "teks" && typeUpper.includes("TEKS")) ||
      (filterType === "audio" && typeUpper.includes("AUDIO")) ||
      (filterType === "link" && typeUpper.includes("URL"));

    return matchesSearch && matchesType;
  });

  const handlePick = async (material: MaterialRow) => {
    try {
      setSubmittingId(String(material.id));
      await onSelectMaterial(material);
      onOpenChange(false);
    } catch (e) {
      console.warn("Gagal memilih materi:", e);
      toast.error("Gagal menambahkan materi ke kelas.");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden border-border bg-card">
        <DialogHeader className="p-4 border-b border-border bg-muted/15">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FolderDown className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Ambil Bahan Ajar dari Pustaka
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Pilih modul/materi dari Pustaka Guru untuk diaktifkan pada <strong>{activeRombel}</strong> ({activeMapel}).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Filter & Search Bar */}
        <div className="p-3 border-b border-border bg-background space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari judul materi, nama topik, atau penyusun..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-xs bg-muted/30"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: "all", label: "Semua Format" },
              { id: "dokumen", label: "📄 Dokumen/PDF" },
              { id: "video", label: "🎥 Video" },
              { id: "teks", label: "📝 Teks Langsung" },
              { id: "audio", label: "🎵 Audio" },
              { id: "link", label: "🔗 Link Web" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilterType(t.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  filterType === t.id
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Material Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {loading ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Sedang mencari berkas di Pustaka Bahan Ajar...
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-border rounded-xl space-y-2">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
              <p className="text-xs font-medium text-foreground">
                Tidak ada materi di Pustaka yang cocok
              </p>
              <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                Pastikan Anda telah mengunggah bahan ajar untuk mapel <strong>{activeMapel}</strong> pada jenjang rombel ini.
              </p>
            </div>
          ) : (
            filteredList.map((item) => {
              const isAttached = alreadyAttachedIds.includes(String(item.id));
              const isSubmitting = submittingId === String(item.id);
              const typeStr = (item.type || "").toUpperCase();

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-border bg-card hover:border-emerald-500/40 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      {typeStr.includes("VIDEO") ? (
                        <Video className="h-4 w-4" />
                      ) : typeStr.includes("TEKS") ? (
                        <FileEdit className="h-4 w-4" />
                      ) : typeStr.includes("AUDIO") ? (
                        <Music className="h-4 w-4" />
                      ) : typeStr.includes("GAMBAR") ? (
                        <ImageIcon className="h-4 w-4" />
                      ) : typeStr.includes("URL") ? (
                        <Globe className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 border-emerald-500/40">
                          {item.type || "Dokumen"}
                        </Badge>
                        {item.chapter && (
                          <Badge variant="secondary" className="text-[10px] font-semibold truncate max-w-[160px]">
                            📁 {item.chapter}
                          </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {item.class_name || "Semua Kelas"}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-foreground line-clamp-1">
                        {item.title}
                      </h4>

                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>Penyusun: {item.uploaded_by || "Guru Pengampu"}</span>
                        <span>•</span>
                        <span>{item.size || "1.5 MB"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {isAttached ? (
                      <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold gap-1 py-1">
                        <CheckCircle2 className="h-3 w-3" /> Sudah Digunakan
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        disabled={isSubmitting}
                        className="h-7 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1 shadow-2xs cursor-pointer"
                        onClick={() => handlePick(item)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>{isSubmitting ? "Mengaitkan..." : "Gunakan di Kelas"}</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="p-3 border-t border-border bg-muted/15 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Ditemukan {filteredList.length} berkas bahan ajar
          </span>
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-semibold"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
