import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderKanban, Award } from "lucide-react";
import { toast } from "sonner";

export function KokurikulerSiswaModule({ userProfile }: { userProfile?: any } = {}) {
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-purple-500" /> Kegiatan Kokurikuler & Projek P5-PPRA
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Projek Penguatan Profil Pelajar Pancasila & Rahmatan Lil 'Alamin: Kehadiran projek & Laporan Gelar Karya Siswa.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3">
            <Badge className="bg-purple-600 text-white text-[10px] mb-1 w-fit">PROJEK P5 AKTIF</Badge>
            <CardTitle className="text-base font-bold">Kerajinan Batik Cilacap & Wirausaha Muda</CardTitle>
            <CardDescription className="text-xs">Koordinator Projek: Dra. Hj. Siti Rahmah • Target Gelar Karya: 25 Agustus 2026</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span>Kehadiran Sesi Projek Saya</span>
                <span className="text-emerald-500 font-mono font-bold">100% Hadir (8/8 Sesi)</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/10 space-y-2">
              <div className="font-bold text-xs text-foreground">Laporan & Dokumentasi Karya Projek:</div>
              <div className="text-xs text-muted-foreground">
                • Produk Batik Motif Wijayakusuma Cilacap buatan kelompok 8A tuntas diproduksi.<br />
                • Laporan analisis wirausaha & pemasaran siap dipresentasikan pada Gelar Karya.
              </div>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs mt-2" onClick={() => toast.success("Laporan Projek P5 berhasil diunggah!")}>
                + Unggah Berkas Laporan Projek PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" /> Penilaian Karakter Profil Pelajar Pancasila
            </CardTitle>
            <CardDescription className="text-xs">Evaluasi pembiasaan karakter & dimensi Rahmatan Lil 'Alamin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { dim: "Beriman, Bertakwa, & Berakhlaq Mulia", score: "Sangat Baik (SB)", icon: "✨" },
              { dim: "Gotong Royong & Kolaborasi Kelompok", score: "Sangat Baik (SB)", icon: "👥" },
              { dim: "Kreativitas & Inovasi Produk Batik", score: "Berkembang Sesuai Harapan (BSH)", icon: "🎨" },
              { dim: "Kemandirian & Wirausaha", score: "Sangat Baik (SB)", icon: "💼" },
            ].map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-border bg-card flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <span>{item.icon}</span>
                  <span>{item.dim}</span>
                </div>
                <Badge variant="outline" className="text-purple-600 border-purple-500/30 font-bold text-[10px]">
                  {item.score}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
