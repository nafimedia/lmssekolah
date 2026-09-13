import { useState, useEffect } from "react";
import { History, Search, Eye, Edit, Printer, CheckCircle2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MysqlDataService } from "@/services/mysqlDataService";
import { PrintKbmReportDialog } from "./PrintKbmReportDialog";
import { DetailKbmSessionDialog } from "./DetailKbmSessionDialog";

export interface KbmHistoryItem {
  id: string;
  date: string;
  rombel: string;
  mapel: string;
  topic: string;
  attendance: string;
  hasJournal: boolean;
}

export function RiwayatKbmSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<KbmHistoryItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [historyList, setHistoryList] = useState<KbmHistoryItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    MysqlDataService.getJournals().then((dbRows: any[]) => {
      if (!isMounted) return;
      if (dbRows) {
        setHistoryList(
          dbRows.map((r: any, idx: number) => ({
            id: String(r.id || `db_h_${idx}`),
            date: r.tanggal || "24 Agustus 2026",
            rombel: r.rombel || "Kelas VII A",
            mapel: r.mapel || "Pendidikan Kewarganegaraan",
            topic: r.materi || "Pokok Bahasan KBM",
            attendance: "30 / 30 Siswa",
            hasJournal: true,
          }))
        );
      } else {
        setHistoryList([]);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenDetail = (item: KbmHistoryItem, edit: boolean = false) => {
    setSelectedSession(item);
    setIsEditMode(edit);
    setIsDetailOpen(true);
  };

  const handleSaveUpdatedTopic = (id: string, newTopic: string) => {
    setHistoryList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, topic: newTopic } : item))
    );
  };

  const handleDeleteHistoryItem = async (id: string, topic: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus riwayat KBM "${topic}"?`)) {
      try {
        await MysqlDataService.deleteJournal(id);
        setHistoryList((prev) => prev.filter((item) => item.id !== id));
        toast.success(`🗑️ Riwayat KBM "${topic}" berhasil dihapus!`);
      } catch (error) {
        toast.error(`Gagal menghapus riwayat KBM "${topic}".`);
      }
    }
  };

  const filteredHistory = historyList.filter((item) => {
    const matchesSearch =
      item.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rombel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.mapel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <>
      <Card className="border-border shadow-xs bg-card mt-4 overflow-hidden">
        {/* Header Bersih & Ringkas (Clean UI Mobile-First) */}
        <div className="p-3 sm:p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-muted/15">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <History className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold truncate text-foreground flex items-center gap-1.5">
                Riwayat KBM
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-mono font-semibold">
                  {filteredHistory.length}
                </Badge>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-44">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Cari materi/kelas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs font-normal"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2.5 text-xs font-semibold gap-1 shrink-0"
              onClick={() => setIsPrintOpen(true)}
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cetak Rekap</span>
              <span className="sm:hidden">Cetak</span>
            </Button>
          </div>
        </div>

        <CardContent className="p-3 sm:p-0">
          {filteredHistory.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-xs space-y-1">
              <History className="h-8 w-8 text-muted-foreground/40 mx-auto mb-1" />
              <p>Belum ada riwayat jurnal KBM yang tercatat.</p>
            </div>
          ) : (
            <>
              {/* Tampilan Mobile: Kartu Riwayat Ringkas */}
              <div className="block md:hidden space-y-2">
                {filteredHistory.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl border border-border bg-card space-y-2">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className="text-[9px] font-mono py-0 px-1.5 text-primary">
                          {item.date}
                        </Badge>
                        <Badge className="bg-emerald-600 text-white text-[9px] py-0 px-1.5">
                          {item.rombel}
                        </Badge>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-emerald-600">
                        {item.attendance}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-foreground truncate">{item.topic}</h4>
                      <p className="text-[10px] text-muted-foreground truncate">{item.mapel}</p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
                      <Badge variant="secondary" className="text-[9px] py-0 px-1.5 gap-1 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Jurnal Terisi
                      </Badge>

                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-[10px] font-semibold gap-1"
                          onClick={() => handleOpenDetail(item, false)}
                        >
                          <Eye className="h-3 w-3" /> Detail
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteHistoryItem(item.id, item.topic)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tampilan Desktop: Tabel Lengkap */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 text-left font-bold text-muted-foreground border-b border-border">
                    <tr>
                      <th className="py-2.5 px-3">Tanggal KBM</th>
                      <th className="py-2.5 px-3">Kelas / Rombel</th>
                      <th className="py-2.5 px-3">Mata Pelajaran</th>
                      <th className="py-2.5 px-3">Materi / Pokok Bahasan</th>
                      <th className="py-2.5 px-3 text-center">Presensi</th>
                      <th className="py-2.5 px-3 text-center">Status Jurnal</th>
                      <th className="py-2.5 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30 transition">
                        <td className="py-2.5 px-3 font-mono font-semibold text-foreground">{item.date}</td>
                        <td className="py-2.5 px-3 font-bold text-primary">{item.rombel}</td>
                        <td className="py-2.5 px-3 font-semibold">{item.mapel}</td>
                        <td className="py-2.5 px-3 font-medium text-foreground">{item.topic}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-600">{item.attendance}</td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge className="bg-emerald-600 text-white font-bold text-[10px] gap-1 py-0 px-2">
                            <CheckCircle2 className="h-3 w-3" /> Jurnal ✓
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-primary hover:bg-primary/10"
                              title="Lihat Detail Jurnal"
                              onClick={() => handleOpenDetail(item, false)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                              title="Edit Topik Jurnal"
                              onClick={() => handleOpenDetail(item, true)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="Hapus Sesi"
                              onClick={() => handleDeleteHistoryItem(item.id, item.topic)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <PrintKbmReportDialog
        isOpen={isPrintOpen}
        onOpenChange={setIsPrintOpen}
        historyList={filteredHistory}
      />

      <DetailKbmSessionDialog
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        sessionItem={selectedSession}
        isEditMode={isEditMode}
        onSaveUpdatedTopic={handleSaveUpdatedTopic}
      />
    </>
  );
}
