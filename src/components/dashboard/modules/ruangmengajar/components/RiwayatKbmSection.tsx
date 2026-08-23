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
      setHistoryList((prev) => prev.filter((item) => item.id !== id));
      await MysqlDataService.deleteJournal(id);
      toast.success(`🗑️ Riwayat KBM "${topic}" berhasil dihapus dari Database!`);
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
      <Card className="border-border shadow-sm bg-card mt-6">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <History className="h-5 w-5 text-primary" /> Riwayat & Laporan Sesi KBM Digital
            </CardTitle>
            <CardDescription className="text-xs">
              Arsip penelusuran histori kegiatan mengajar, presensi, dan rekam jejak jurnal pembelajaran.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Cari materi / kelas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-xs w-full sm:w-48 font-bold"
              />
            </div>

            <Button
              size="sm"
              variant="outline"
              className="text-xs font-bold gap-1 border-border text-foreground hover:bg-muted"
              onClick={() => setIsPrintOpen(true)}
            >
              <Printer className="h-4 w-4" /> Cetak Rekap KBM
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/60 text-left font-bold text-muted-foreground border-b border-border">
              <tr>
                <th className="py-3 px-4">Tanggal KBM</th>
                <th className="py-3 px-3">Kelas / Rombel</th>
                <th className="py-3 px-3">Mata Pelajaran</th>
                <th className="py-3 px-4">Materi / Pokok Bahasan</th>
                <th className="py-3 px-3 text-center">Presensi</th>
                <th className="py-3 px-3 text-center">Status Jurnal</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground text-xs">
                    <History className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                    Belum ada riwayat jurnal KBM yang tersimpan di Database.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition">
                    <td className="py-3 px-4 font-mono font-semibold text-foreground">{item.date}</td>
                    <td className="py-3 px-3 font-bold text-primary">{item.rombel}</td>
                    <td className="py-3 px-3 font-semibold">{item.mapel}</td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{item.topic}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600">{item.attendance}</td>
                    <td className="py-3 px-3 text-center">
                      <Badge className="bg-emerald-600 text-white font-bold text-[10px] gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Jurnal ✓
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-primary hover:bg-primary/10"
                          title="Lihat Detail Sesi"
                          onClick={() => handleOpenDetail(item, false)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                          title="Edit Jurnal"
                          onClick={() => handleOpenDetail(item, true)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                          title="Hapus Riwayat Jurnal"
                          onClick={() => handleDeleteHistoryItem(item.id, item.topic)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
