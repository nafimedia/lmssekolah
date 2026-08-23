import { useState, useMemo, useEffect } from "react";
import { MysqlDataService, PengampuRow, RuangRow, JadwalRow } from "@/services/mysqlDataService";
import {
  Sparkles,
  CheckCircle2,
  Plus,
  Building2,
  BookOpen,
  Users,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { INITIAL_MASTER_MAPEL } from "@/services/masterMapelService";

import { PengampuTab } from "./components/PengampuTab";
import { MasterRombelTab } from "./components/MasterRombelTab";

export function SiakadMasterDataModule() {
  const [activeTab, setActiveTab] = useState<string>("pengampu");
  const [dbTeachersList, setDbTeachersList] = useState<string[]>([]);
  const [pengampuList, setPengampuList] = useState<PengampuRow[]>([]);

  const [rombelList, setRombelList] = useState([
    { id: "r1", name: "Rombel 7A", grade: "Kelas VII", waliKelas: "MISBAH AHMAD DANI, S.Pd", studentCount: 32 },
    { id: "r2", name: "Rombel 7B", grade: "Kelas VII", waliKelas: "ENDAH SUPRIHATIN, S.Pd", studentCount: 32 },
    { id: "r3", name: "Rombel 8A", grade: "Kelas VIII", waliKelas: "Dra. Hj. Siti Rahmah, M.Pd", studentCount: 32 },
    { id: "r4", name: "Rombel 8B", grade: "Kelas VIII", waliKelas: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd", studentCount: 32 },
    { id: "r5", name: "Rombel 9A", grade: "Kelas IX", waliKelas: "SOBIYATI, S.Pd", studentCount: 32 },
    { id: "r6", name: "Rombel 9B", grade: "Kelas IX", waliKelas: "SAYONO, S.Pd., M.Pd.", studentCount: 32 },
  ]);

  useEffect(() => {
    let isMounted = true;
    MysqlDataService.getUsers()
      .then((users) => {
        if (!isMounted) return;
        if (users && users.length > 0) {
          const teachers = users.filter((u) => u.role !== "siswa").map((u) => u.full_name);
          if (teachers.length > 0) setDbTeachersList(teachers);
        }
      })
      .catch(() => {});

    MysqlDataService.getPengampuList().then((data) => {
      if (isMounted && data && data.length > 0) setPengampuList(data);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDeletePengampu = (id: string, name: string) => {
    setPengampuList((prev) => prev.filter((p) => p.id !== id));
    toast.success(`🗑️ Plotting pengampu "${name}" berhasil dihapus.`);
  };

  const handleAddPengampuClick = () => {
    toast.info("Gunakan tombol tambah pada matriks pengampu untuk mendaftarkan plotting guru baru.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" /> Master Data SIAKAD & Kurikulum
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pengelolaan data master akademik, rombel, dan matriks pengampu.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-muted/40 rounded-xl border border-border/80">
        {[
          { id: "pengampu", label: "Matriks Pengampu", icon: Users },
          { id: "rombel", label: "Kelas & Rombel", icon: Building2 },
          { id: "mapel", label: "Master Mapel", icon: BookOpen },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === t.id ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <t.icon className="h-4 w-4" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "pengampu" && (
        <PengampuTab
          pengampuList={pengampuList.length > 0 ? pengampuList : [
            { id: "p1", guru: "SAYONO, S.Pd., M.Pd.", mapel: "Matematika", rombel: "Rombel 8A", jam: "4 JP" },
            { id: "p2", guru: "SOBIYATI, S.Pd", mapel: "Bahasa Indonesia", rombel: "Rombel 8A", jam: "4 JP" },
            { id: "p3", guru: "AH. SYARIF HIDAYAH, S.Pd.I", mapel: "Al Qur'an Hadis", rombel: "Rombel 8A", jam: "2 JP" },
          ]}
          onOpenAddModal={handleAddPengampuClick}
          onDeletePengampu={handleDeletePengampu}
        />
      )}

      {activeTab === "rombel" && (
        <MasterRombelTab
          rombelList={rombelList}
          onOpenAddModal={() => toast.success("Rombel baru siap ditambahkan!")}
        />
      )}

      {activeTab === "mapel" && (
        <Card className="border-border shadow-sm bg-card">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Master Mata Pelajaran Kurikulum Merdeka
            </CardTitle>
            <CardDescription className="text-xs">
              Daftar 18 Mata Pelajaran resmi Kurikulum Merdeka MTsN 2 Cilacap.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/60 text-left border-b border-border font-bold text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Mata Pelajaran</th>
                  <th className="py-3 px-3">Kode Mapel</th>
                  <th className="py-3 px-3 text-center">Kelompok</th>
                  <th className="py-3 px-3 text-center">KKTP Standard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {INITIAL_MASTER_MAPEL.map((m) => (
                  <tr key={m.code} className="hover:bg-muted/30 transition">
                    <td className="py-3 px-4 font-bold text-foreground">{m.name}</td>
                    <td className="py-3 px-3 font-mono font-semibold">{m.code}</td>
                    <td className="py-3 px-3 text-center">
                      <Badge variant="outline" className="text-[10px] font-bold">
                        {m.category || "PAI / Umum"}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600">75</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
