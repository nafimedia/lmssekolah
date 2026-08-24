import { useState } from "react";
import { Sparkles, Award, Edit, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface KktpSkemaTabProps {
  isKamad?: boolean;
}

export function KktpSkemaTab({ isKamad }: KktpSkemaTabProps) {
  const [defaultKktp, setDefaultKktp] = useState<number>(75);
  const [isEditingKktp, setIsEditingKktp] = useState<boolean>(false);
  const [tempKktp, setTempKktp] = useState<string>("75");

  const [gradingScales] = useState([
    {
      grade: "A",
      label: "Sangat Baik",
      range: "90 - 100",
      color: "text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20",
      desc: "Peserta didik sangat menguasai seluruh Capaian Pembelajaran (CP) dan TP secara mandiri dengan tajwid/pemahaman konsep tingkat tinggi.",
    },
    {
      grade: "B",
      label: "Baik",
      range: "80 - 89",
      color: "text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-950/20",
      desc: "Peserta didik menguasai sebagian besar Capaian Pembelajaran (CP) dan TP secara mandiri dengan baik.",
    },
    {
      grade: "C",
      label: "Cukup (Batas KKTB)",
      range: "75 - 79",
      color: "text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/20",
      desc: "Peserta didik telah mencapai batas kriteria minimum KKTB/KKTP standar madrasah.",
    },
    {
      grade: "D",
      label: "Perlu Bimbingan (Remedial)",
      range: "< 75",
      color: "text-red-600 border-red-300 bg-red-50 dark:bg-red-950/20",
      desc: "Peserta didik belum mencapai KKTP minimum standar, memerlukan pendampingan & remedial dari Guru Pengampu.",
    },
  ]);

  const handleSaveKktp = () => {
    if (isKamad) {
      toast.error("🔒 Akses ditolak: Kepala Madrasah hanya berhak memantau data KKTP (Read-Only).");
      setIsEditingKktp(false);
      return;
    }
    const val = parseInt(tempKktp, 10);
    if (isNaN(val) || val < 50 || val > 100) {
      return toast.error("Nilai KKTP standar harus antara 50 s.d. 100!");
    }
    setDefaultKktp(val);
    setIsEditingKktp(false);
    toast.success(`⚡ KKTP Standar Akademik Madrasah berhasil diperbarui menjadi ${val}!`);
  };

  return (
    <div className="space-y-6">
      {/* KKTP Standard Banner Card */}
      <Card className="border-border shadow-sm bg-card">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5 text-amber-500" /> Kriteria Ketercapaian Tujuan Pembelajaran (KKTP Standar)
            </CardTitle>
            <CardDescription className="text-xs">
              Nilai standar ketuntasan belajar minimum Kurikulum Merdeka MTsN 2 Cilacap yang berlaku untuk seluruh Mata Pelajaran.
            </CardDescription>
          </div>

          <div className="flex items-center gap-3 bg-muted/50 p-2.5 rounded-xl border border-border">
            <div className="text-xs">
              <span className="text-muted-foreground block text-[10px]">KKTP Standar Utama:</span>
              <strong className="text-lg font-black font-mono text-emerald-600">{defaultKktp} / 100</strong>
            </div>
            {isKamad ? (
              <Badge variant="outline" className="text-[10px] text-muted-foreground font-bold shrink-0">
                🔒 Read-Only (Kamad)
              </Badge>
            ) : !isEditingKktp ? (
              <Button
                size="sm"
                variant="outline"
                className="text-xs font-bold gap-1 border-primary/40 text-primary"
                onClick={() => {
                  setTempKktp(String(defaultKktp));
                  setIsEditingKktp(true);
                }}
              >
                <Edit className="h-3.5 w-3.5" /> Ubah KKTP
              </Button>
            ) : (
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  value={tempKktp}
                  onChange={(e) => setTempKktp(e.target.value)}
                  className="w-16 h-8 text-xs font-bold text-center font-mono"
                />
                <Button size="sm" className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5" onClick={handleSaveKktp}>
                  <Check className="h-4 w-4" /> Simpan
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Skema Predikat Nilai Rapor Card */}
      <Card className="border-border shadow-sm bg-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-600" /> Skema Rubrik Predikat & Kualifikasi Nilai Rapor
          </CardTitle>
          <CardDescription className="text-xs">
            Rentang nilai, predikat kualifikasi, dan deskripsi capaian pembelajaran Kurikulum Merdeka.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gradingScales.map((scale) => (
              <div
                key={scale.grade}
                className={`p-4 rounded-xl border ${scale.color} space-y-2 transition hover:shadow-xs`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black font-mono">{scale.grade}</span>
                    <Badge variant="outline" className="font-bold text-xs">
                      {scale.label}
                    </Badge>
                  </div>
                  <Badge className="font-mono font-bold text-xs bg-background text-foreground border border-border">
                    Rentang: {scale.range}
                  </Badge>
                </div>
                <p className="text-xs leading-relaxed opacity-90">{scale.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
