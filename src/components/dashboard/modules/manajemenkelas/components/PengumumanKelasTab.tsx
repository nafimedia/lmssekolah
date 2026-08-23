import { useState } from "react";
import { Bell, Send, Plus, Megaphone, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface PengumumanItem {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
}

interface PengumumanKelasTabProps {
  classNameTitle: string;
  announcements: PengumumanItem[];
  onAddAnnouncement: (item: { title: string; content: string }) => void;
  onBroadcastWaGroup: (title: string, content: string) => void;
}

export function PengumumanKelasTab({
  classNameTitle,
  announcements,
  onAddAnnouncement,
  onBroadcastWaGroup,
}: PengumumanKelasTabProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onAddAnnouncement({ title: title.trim(), content: content.trim() });
    setTitle("");
    setContent("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Buat Pengumuman Internal */}
      <Card className="border-border shadow-sm bg-card lg:col-span-1">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" /> Buat Pengumuman {classNameTitle}
          </CardTitle>
          <CardDescription className="text-xs">
            Kirim info penting internal khusus siswa & orang tua {classNameTitle}.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-xs font-semibold">Judul Pengumuman</Label>
              <Input
                placeholder="Contoh: Rapat Wali Murid & Kelengkapan Berkas"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Isi Pesan / Pengumuman</Label>
              <textarea
                className="w-full min-h-[100px] rounded-md border border-input bg-background p-3 text-xs"
                placeholder="Tuliskan detail pengumuman..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 pt-2">
              <Button type="submit" size="sm" className="w-full bg-primary text-primary-foreground font-bold text-xs gap-1.5">
                <Plus className="h-4 w-4" /> Terbitkan Pengumuman Kelas
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-full text-xs font-bold text-purple-600 dark:text-purple-400 border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 gap-1.5"
                onClick={() => {
                  if (!title || !content) return;
                  onBroadcastWaGroup(title, content);
                }}
              >
                <Send className="h-3.5 w-3.5" /> Broadcast WA Group Ortu
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Feed Pengumuman */}
      <Card className="border-border shadow-sm bg-card lg:col-span-2">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Bell className="h-5 w-5 text-emerald-600" /> Papan Pengumuman Internal {classNameTitle}
          </CardTitle>
          <CardDescription className="text-xs">
            Daftar pengumuman resmi Wali Kelas yang aktif di halaman siswa.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {announcements.length === 0 ? (
            <div className="p-6 border border-dashed rounded-xl text-center text-muted-foreground text-xs">
              Belum ada pengumuman internal terbit untuk {classNameTitle}.
            </div>
          ) : (
            announcements.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-border bg-muted/20 space-y-2 hover:bg-muted/30 transition">
                <div className="flex items-center justify-between">
                  <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                    ✓ Resmi Wali Kelas
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">{item.date}</span>
                </div>
                <div className="font-bold text-sm text-foreground">{item.title}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.content}</p>
                <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                  Oleh: <strong className="text-foreground">{item.author}</strong>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
