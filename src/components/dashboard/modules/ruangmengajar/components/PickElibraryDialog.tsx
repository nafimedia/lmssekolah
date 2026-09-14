import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Library,
  Search,
  FileText,
  Video,
  Headphones,
  CheckCircle2,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { MysqlDataService } from "@/services/mysqlDataService";

export interface ElibraryBookItem {
  id: string;
  title: string;
  tag: string;
  size?: string;
  type: string;
  url?: string;
  video_url?: string;
  audio_url?: string;
  description?: string;
  provider?: string;
}

interface PickElibraryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeRombel: string;
  activeMapel: string;
  onSelectBook: (book: ElibraryBookItem) => Promise<void> | void;
}

export function PickElibraryDialog({
  isOpen,
  onOpenChange,
  activeRombel,
  activeMapel,
  onSelectBook,
}: PickElibraryDialogProps) {
  const [books, setBooks] = useState<ElibraryBookItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    MysqlDataService.getElibraryBooks()
      .then((data) => {
        if (!isMounted) return;
        setBooks(data || []);
      })
      .catch((err) => {
        console.warn("Gagal memuat buku E-Library:", err);
        if (isMounted) setBooks([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.tag && b.tag.toLowerCase().includes(search.toLowerCase())) ||
      (b.description && b.description.toLowerCase().includes(search.toLowerCase()));

    const matchesType =
      filterType === "all" ||
      (filterType === "pdf" && (b.type === "pdf" || !b.type)) ||
      (filterType === "video" && b.type === "video") ||
      (filterType === "audio" && b.type === "audio");

    return matchesSearch && matchesType;
  });

  const handlePick = async (book: ElibraryBookItem) => {
    try {
      setSubmittingId(book.id);
      await onSelectBook(book);
      onOpenChange(false);
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col border-border bg-card">
        <DialogHeader className="border-b border-border pb-3 shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-purple-600 text-white font-semibold text-[10px] gap-1">
              <Library className="h-3 w-3" /> E-LIBRARY MADRASAH
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              Target KBM: {activeMapel} · {activeRombel}
            </span>
          </div>

          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Library className="h-5 w-5 text-purple-600" /> Ambil Referensi Buku / Media Digital
          </DialogTitle>
          <DialogDescription className="text-xs">
            Pilih buku paket, modul Kurikulum Merdeka, video, atau audio edukasi resmi dari perpustakaan untuk ditautkan langsung ke sesi mengajar kelas Anda.
          </DialogDescription>
        </DialogHeader>

        {/* Filter & Search Bar */}
        <div className="py-2.5 flex items-center gap-2 border-b border-border shrink-0">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari judul buku, modul, mapel, atau topik referensi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-9 px-3 rounded-md border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 shrink-0"
          >
            <option value="all">Semua Tipe Media</option>
            <option value="pdf">📄 Dokumen / E-Book (PDF)</option>
            <option value="video">🎥 Video Pembelajaran</option>
            <option value="audio">🎧 Audio / Podcast</option>
          </select>
        </div>

        {/* List of Books */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Memuat koleksi perpustakaan digital madrasah...
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-border rounded-xl space-y-2 bg-muted/20">
              <Library className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs font-bold text-foreground">Tidak Ada Koleksi Buku Ditemukan</p>
              <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                Belum ada buku atau media perpustakaan yang cocok dengan pencarian kata kunci di atas.
              </p>
            </div>
          ) : (
            filteredBooks.map((book) => {
              const Icon =
                book.type === "video" ? Video : book.type === "audio" ? Headphones : FileText;
              const isSubmitting = submittingId === book.id;
              const bookUrl = book.url || book.video_url || book.audio_url || "";

              return (
                <div
                  key={book.id}
                  className="p-3.5 rounded-xl border border-border bg-card hover:border-purple-500/50 hover:bg-purple-50/20 dark:hover:bg-purple-950/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/15 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 border border-purple-500/30">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant="outline" className="text-[10px] font-semibold border-purple-400/40 text-purple-700 dark:text-purple-300">
                          {book.tag || "Buku Referensi"}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          {book.size || "Berkas Digital"}
                        </Badge>
                        {book.type && (
                          <Badge variant="secondary" className="text-[10px] uppercase font-semibold text-muted-foreground">
                            {book.type}
                          </Badge>
                        )}
                      </div>

                      <h4 className="text-xs font-semibold text-foreground leading-snug truncate">
                        {book.title}
                      </h4>
                      {book.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {book.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {bookUrl && (
                      <a
                        href={bookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 px-2.5 rounded-md border border-border text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center gap-1 transition"
                        title="Pratinjau Berkas"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Pratinjau
                      </a>
                    )}

                    <Button
                      size="sm"
                      disabled={isSubmitting}
                      onClick={() => handlePick(book)}
                      className="h-8 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white gap-1 shadow-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {isSubmitting ? "Menautkan..." : "Tautkan ke KBM"}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="border-t border-border pt-3 shrink-0">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs font-semibold">
            Batal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
