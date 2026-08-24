import { useState } from "react";
import { Users, Plus, PencilLine, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PengampuRow } from "@/services/mysqlDataService";

interface PengampuTabProps {
  pengampuList: PengampuRow[];
  onOpenAddModal: () => void;
  onDeletePengampu: (id: string, name: string) => void;
  isKamad?: boolean;
}

export function PengampuTab({ pengampuList, onOpenAddModal, onDeletePengampu, isKamad }: PengampuTabProps) {
  const [search, setSearch] = useState("");

  const filtered = pengampuList.filter(
    (p) =>
      p.guru.toLowerCase().includes(search.toLowerCase()) ||
      p.mapel.toLowerCase().includes(search.toLowerCase()) ||
      p.rombel.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="border-border shadow-sm bg-card">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Matriks Plotting Pengampu Guru & Rombel
          </CardTitle>
          <CardDescription className="text-xs">
            Alokasi penugasan Guru Pengampu Mata Pelajaran per Rombel (Tahun Ajaran 2026/2027 Ganjil).
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            placeholder="Cari guru, mapel, rombel..."
            className="h-9 px-3 rounded-md border border-border bg-background text-xs w-48"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {!isKamad ? (
            <Button size="sm" className="bg-primary text-primary-foreground font-bold text-xs gap-1" onClick={onOpenAddModal}>
              <Plus className="h-4 w-4" /> Tambah Plotting Pengampu
            </Button>
          ) : (
            <Badge variant="outline" className="text-[10px] text-muted-foreground font-bold shrink-0">
              🔒 Read-Only (Kamad)
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/60 text-left border-b border-border font-bold text-muted-foreground">
            <tr>
              <th className="py-3 px-4">Mata Pelajaran</th>
              <th className="py-3 px-3">Tingkat</th>
              <th className="py-3 px-3">Rombel Target</th>
              <th className="py-3 px-4">Guru Pengampu Utama</th>
              <th className="py-3 px-3 text-center">Total JP</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((item, idx) => (
              <tr key={item.id || idx} className="hover:bg-muted/30 transition">
                <td className="py-3 px-4 font-bold text-foreground">{item.mapel}</td>
                <td className="py-3 px-3 font-semibold">Kelas VIII</td>
                <td className="py-3 px-3">
                  <Badge className="bg-primary/15 text-primary font-bold border-primary/20">
                    {item.rombel}
                  </Badge>
                </td>
                <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{item.guru}</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600">{item.jam || "4 JP"}</td>
                <td className="py-3 px-4 text-center">
                  {!isKamad ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => onDeletePengampu(item.id || String(idx), `${item.guru} (${item.mapel})`)}
                      title="Hapus Plotting"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      🔒 Read-Only
                    </Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
