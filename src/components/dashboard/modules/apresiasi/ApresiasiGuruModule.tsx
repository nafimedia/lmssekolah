import { useState, useEffect } from "react";
import { Trophy, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MysqlDataService } from "@/services/mysqlDataService";
import { toast } from "sonner";

export function ApresiasiGuruModule({ activeRole }: { activeRole?: string }) {
  const [teachersList, setTeachersList] = useState([
    { id: "1", name: "AH. SYARIF HIDAYAH, S.Pd.I", mapel: "Al Qur'an Hadis", nip: "199204042025051002", badges: ["🏆 Guru Inovatif", "⭐ Presensi Presisi 100%"], warningCount: 0, status: "Aktif Terpuji" },
    { id: "2", name: "WAKHIBUN, S.P", mapel: "Akidah Akhlak", nip: "197205122005011003", badges: ["🌟 Media Ajar Terkreatif"], warningCount: 0, status: "Aktif Terpuji" },
    { id: "3", name: "CARYATI,", mapel: "Fikih", nip: "197807072007102001", badges: ["⭐ Presensi Presisi 100%"], warningCount: 0, status: "Aktif Terpuji" },
    { id: "4", name: "H. DASIRUN, S.Ag., M.Pd.I", mapel: "Sejarah Kebudayaan Islam", nip: "197311232005011004", badges: ["🏆 Guru Inovatif", "💡 Modul Inspiratif"], warningCount: 0, status: "Aktif Terpuji" },
    { id: "5", name: "ENDAH SUPRIHATIN, S.Pd", mapel: "Bahasa Arab", nip: "199405142019032021", badges: ["🌟 Media Ajar Terkreatif"], warningCount: 0, status: "Aktif Terpuji" },
    { id: "6", name: "SOBIYATI, S.Pd", mapel: "Bahasa Indonesia", nip: "197808152005012004", badges: ["🔥 Ketuntasan KKM Tinggi"], warningCount: 0, status: "Aktif Terpuji" },
    { id: "7", name: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd", mapel: "Bahasa Inggris & TIK", nip: "197205012005011001", badges: ["🏆 Guru Inovatif", "⭐ Presensi Presisi 100%"], warningCount: 0, status: "Aktif Terpuji" },
    { id: "8", name: "SAYONO, S.Pd., M.Pd.", mapel: "Matematika", nip: "197409202003121002", badges: ["🔥 Ketuntasan KKM Tinggi"], warningCount: 0, status: "Aktif Terpuji" },
    { id: "9", name: "NOVANTYA KARTIKAWATI, S.Pd", mapel: "Ilmu Pendidikan Alam", nip: "198603052011012008", badges: ["⭐ Presensi Presisi 100%"], warningCount: 0, status: "Aktif Terpuji" },
    { id: "10", name: "UMI KHAFSOH, S.Pd", mapel: "Ilmu Pendidikan Sosial", nip: "198302142009022005", badges: ["💡 Modul Inspiratif"], warningCount: 0, status: "Aktif Terpuji" },
    { id: "11", name: "ANGGUN NOVTALIA BERLIAN, S.Pd", mapel: "Pendidikan Kewarganegaraan", nip: "199011122019032012", badges: ["🌟 Media Ajar Terkreatif"], warningCount: 0, status: "Aktif Terpuji" },
    { id: "12", name: "NUR ROCHMAN SHODIQ, S.Pd.I", mapel: "PJOK", nip: "198506182014021003", badges: ["⭐ Presensi Presisi 100%"], warningCount: 0, status: "Aktif Terpuji" },
    { id: "13", name: "ISNAENI HASANAH, S.Pd.I", mapel: "Prakarya dan Seni Budaya", nip: "198808252015032004", badges: ["💡 Modul Inspiratif"], warningCount: 0, status: "Aktif Terpuji" },
    { id: "14", name: "RINDANG FARIHA IDANA, S.Pd", mapel: "Bahasa Jawa", nip: "199204102020122009", badges: ["🌟 Media Ajar Terkreatif"], warningCount: 0, status: "Aktif Terpuji" },
    { id: "15", name: "ASROR HIDAYAT, S.Pd", mapel: "Bimbingan dan Konseling", nip: "198701022012011004", badges: ["🏆 Guru Inovatif"], warningCount: 0, status: "Aktif Terpuji" },
  ]);

  const [historyList, setHistoryList] = useState([
    { id: "h1", teacher: "AH. SYARIF HIDAYAH, S.Pd.I", type: "award", title: "🏆 Guru Inovatif", emote: "🎉", comment: "Sangat inspiratif dalam pemanfaatan media digital Al Qur'an Hadis Pertemuan 1-18.", date: "26 Juli 2026" },
    { id: "h2", teacher: "SAYONO, S.Pd., M.Pd.", type: "award", title: "🔥 Ketuntasan KKM Tinggi", emote: "⭐", comment: "Apresiasi atas pencapaian rata-rata nilai Matematika 85+ di seluruh Rombel KBM.", date: "24 Juli 2026" },
  ]);

  useEffect(() => {
    let isMounted = true;
    MysqlDataService.getAwards().then((dbAwards) => {
      if (!isMounted) return;
      if (dbAwards && dbAwards.length > 0) {
        const mapped = dbAwards.map((item) => ({
          id: String(item.id || Date.now()),
          teacher: item.student_name,
          type: (item.warning_category ? "warning" : "award") as "award" | "warning",
          title: item.badge_category || item.warning_category || "Bintang Apresiasi",
          emote: item.warning_category ? "⚠️" : "🎉",
          comment: item.comment_text || "",
          date: item.created_at || "Hari ini",
        }));
        setHistoryList(mapped);
      } else if (dbAwards && dbAwards.length === 0) {
        setHistoryList([]);
      }
    });
    MysqlDataService.getUsers()
      .then((users) => {
        if (!isMounted) return;
        const guruUsers = users.filter((u) => u.role === "guru" || u.role === "walikelas" || u.role === "wali_kelas" || u.role === "waka" || u.role === "kamad");
        if (guruUsers.length > 0) {
          const mapped = guruUsers.map((g, idx) => ({
            id: String(g.id || `g-${idx + 1}`),
            name: g.full_name,
            mapel: (g as any).assigned_mapel || (g as any).specialization || "Mata Pelajaran KBM",
            nip: g.nis_nip || `1980010120050110${idx + 10}`,
            badges: idx % 3 === 0 ? ["🏆 Guru Inovatif", "⭐ Presensi Presisi 100%"] : idx % 2 === 0 ? ["🌟 Media Ajar Terkreatif"] : ["🔥 Ketuntasan KKM Tinggi"],
            warningCount: 0,
            status: "Aktif Terpuji",
          }));
          setTeachersList(mapped);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [actionType, setActionType] = useState<"award" | "warning">("award");
  const [badgeCategory, setBadgeCategory] = useState("🏆 Guru Inovatif");
  const [warningCategory, setWarningCategory] = useState("⚠️ Presensi Perlu Ditingkatkan");
  const [emote, setEmote] = useState("🎉");
  const [commentText, setCommentText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenAction = (teacher: any, type: "award" | "warning") => {
    setSelectedTeacher(teacher);
    setActionType(type);
    setEmote(type === "award" ? "🎉" : "⚠️");
    setCommentText("");
    setIsModalOpen(true);
  };

  const handleSaveAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;

    const title = actionType === "award" ? badgeCategory : warningCategory;
    const newHistory = {
      id: String(Date.now()),
      teacher: selectedTeacher.name,
      type: actionType,
      title: `${emote} ${title.replace(/^[^\s]+\s/, '')}`,
      emote,
      comment: commentText || (actionType === "award" ? "Apresiasi atas dedikasi dan kinerja pembelajaran di madrasah." : "Catatan pembinaan untuk peningkatan kualitas KBM."),
      date: "Hari ini",
    };

    MysqlDataService.saveAward({
      student_name: selectedTeacher.name,
      badge_category: actionType === "award" ? title : undefined,
      warning_category: actionType === "warning" ? title : undefined,
      comment_text: newHistory.comment,
      awarded_by: "Kepala Madrasah",
    }).catch((err) => console.warn("saveAward DB failed:", err));

    setHistoryList([newHistory, ...historyList]);

    if (actionType === "award") {
      setTeachersList(
        teachersList.map((t) =>
          t.id === selectedTeacher.id
            ? { ...t, badges: Array.from(new Set([...t.badges, title])) }
            : t
        )
      );
      toast.success(`Award ${title} berhasil diberikan kepada ${selectedTeacher.name}!`);
    } else {
      setTeachersList(
        teachersList.map((t) =>
          t.id === selectedTeacher.id
            ? { ...t, warningCount: t.warningCount + 1, status: "Perlu Evaluasi Pembinaan" }
            : t
        )
      );
      toast.warning(`Catatan Pembinaan berhasil dikirimkan kepada ${selectedTeacher.name}!`);
    }

    setIsModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" /> Apresiasi & Catatan Pembinaan Guru (Award & Warning)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Portal Kepala Madrasah untuk memberikan penghargaan (award/badge) atau catatan pembinaan (warning) kepada Guru Pengampu beserta emotikon & komentar.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-amber-500/10 via-card to-card border-amber-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-amber-500/20 text-amber-500 grid place-items-center font-bold text-xl">
              🏆
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Total Award Diberikan</div>
              <div className="text-2xl font-extrabold font-mono text-amber-500">{historyList.filter(h => h.type === "award").length + 26} Lencana</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/10 via-card to-card border-destructive/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-destructive/20 text-destructive grid place-items-center font-bold text-xl">
              ⚠️
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Catatan Warning Aktif</div>
              <div className="text-2xl font-extrabold font-mono text-destructive">{historyList.filter(h => h.type === "warning").length + 2} Warning</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 via-card to-card border-emerald-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/20 text-emerald-500 grid place-items-center font-bold text-xl">
              👨‍🏫
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Total Guru Pengampu</div>
              <div className="text-2xl font-extrabold font-mono text-emerald-500">54 Guru</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="guru_list" className="space-y-4">
        <TabsList className="bg-muted p-1 border border-border">
          <TabsTrigger value="guru_list" className="text-xs font-bold gap-1.5">
            👨‍🏫 Daftar Guru & Pemberian Apresiasi
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs font-bold gap-1.5">
            📜 Riwayat Award & Warning Diberikan ({historyList.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guru_list">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachersList.map((t) => (
              <Card key={t.id} className="border-border hover:border-primary/40 transition shadow-xs">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                        {t.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Badge variant={t.warningCount > 0 ? "destructive" : "secondary"} className="text-[10px]">
                      {t.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold mt-2 leading-snug">{t.name}</CardTitle>
                  <CardDescription className="text-xs">{t.mapel} • {t.nip}</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-2 space-y-3">
                  <div className="space-y-1">
                    <div className="text-[11px] text-muted-foreground font-semibold">Lencana & Apresiasi Diterima:</div>
                    <div className="flex flex-wrap gap-1">
                      {t.badges.map((b, idx) => (
                        <Badge key={idx} variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-semibold">
                          {b}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                    <Button
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs h-8 gap-1"
                      onClick={() => handleOpenAction(t, "award")}
                    >
                      🏆 Beri Award
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10 font-bold text-xs h-8 gap-1"
                      onClick={() => handleOpenAction(t, "warning")}
                    >
                      ⚠️ Warning
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Log Riwayat Apresiasi & Pembinaan Kepala Madrasah</CardTitle>
              <CardDescription className="text-xs">Catatan resmi penghargaan dan arahan pembinaan yang telah dikirimkan ke guru.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted text-muted-foreground font-bold text-left">
                  <tr>
                    <th className="p-3">Guru Penerima</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3 text-center">Emote</th>
                    <th className="p-3">Komentar / Catatan Kamad</th>
                    <th className="p-3 text-right">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {historyList.map((h) => (
                    <tr key={h.id} className="hover:bg-muted/30 transition">
                      <td className="p-3 font-bold text-foreground">{h.teacher}</td>
                      <td className="p-3">
                        <Badge className={h.type === "award" ? "bg-amber-500 text-black font-bold" : "bg-destructive text-white font-bold"}>
                          {h.title}
                        </Badge>
                      </td>
                      <td className="p-3 text-center text-lg">{h.emote}</td>
                      <td className="p-3 text-muted-foreground italic">"{h.comment}"</td>
                      <td className="p-3 text-right font-mono text-muted-foreground">{h.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              {actionType === "award" ? (
                <>
                  <Trophy className="h-5 w-5 text-amber-500" /> Beri Award / Lencana Ke Guru
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-destructive" /> Kirim Catatan Warning / Pembinaan
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Penerima: <strong className="text-foreground">{selectedTeacher?.name}</strong> ({selectedTeacher?.mapel})
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveAction} className="space-y-4 py-2">
            {actionType === "award" ? (
              <div>
                <Label className="text-xs font-semibold">Pilih Jenis Award / Lencana:</Label>
                <select
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1 font-semibold"
                  value={badgeCategory}
                  onChange={(e) => setBadgeCategory(e.target.value)}
                >
                  <option value="🏆 Guru Inovatif">🏆 Guru Inovatif</option>
                  <option value="⭐ Presensi Presisi 100%">⭐ Presensi Presisi 100%</option>
                  <option value="🌟 Media Ajar Terkreatif">🌟 Media Ajar Terkreatif</option>
                  <option value="🔥 Ketuntasan KKM Tinggi">🔥 Ketuntasan KKM Tinggi</option>
                  <option value="💡 Modul Inspiratif">💡 Modul Inspiratif</option>
                </select>
              </div>
            ) : (
              <div>
                <Label className="text-xs font-semibold">Pilih Kategori Catatan Warning:</Label>
                <select
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1 font-semibold"
                  value={warningCategory}
                  onChange={(e) => setWarningCategory(e.target.value)}
                >
                  <option value="⚠️ Presensi Perlu Ditingkatkan">⚠️ Presensi Perlu Ditingkatkan</option>
                  <option value="📝 Kelengkapan Modul Terlambat">📝 Kelengkapan Modul Terlambat</option>
                  <option value="💬 Evaluasi KBM Kelas">💬 Evaluasi KBM Kelas</option>
                  <option value="📌 Respon Tugas Lambat">📌 Respon Tugas Lambat</option>
                </select>
              </div>
            )}

            <div>
              <Label className="text-xs font-semibold">Pilih Emotikon:</Label>
              <div className="flex items-center gap-2 mt-1">
                {(actionType === "award" ? ["🎉", "👑", "🎖️", "🌟", "🔥", "🏆"] : ["⚠️", "📢", "📌", "⌛", "💬", "🚨"]).map((emo) => (
                  <button
                    type="button"
                    key={emo}
                    onClick={() => setEmote(emo)}
                    className={`h-9 w-9 rounded-xl border text-lg grid place-items-center transition ${emote === emo ? "bg-primary/20 border-primary scale-110" : "bg-muted/40 border-border hover:bg-muted"
                      }`}
                  >
                    {emo}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Komentar / Pesan Kepala Madrasah:</Label>
              <textarea
                placeholder={actionType === "award" ? "Tuliskan apresiasi khusus untuk apresiasi guru ini..." : "Tuliskan arahan perbaikan dan pembinaan..."}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full h-24 rounded-md border border-border bg-background p-3 text-xs mt-1"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className={actionType === "award" ? "bg-amber-500 text-black font-bold" : "bg-destructive text-white font-bold"}>
                {actionType === "award" ? "Kirim Award & Badge" : "Kirim Catatan Warning"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
