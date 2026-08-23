import { useState, useEffect } from "react";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { MysqlDataService } from "@/services/mysqlDataService";
import { toast } from "sonner";
import { Shield, Search, UserCog, Save, KeyRound, Trash2, Users, GraduationCap, UserCheck, ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { AddUserDialog } from "./components/AddUserDialog";
import { EditRolesDialog } from "./components/EditRolesDialog";
import { ResetPasswordDialog } from "./components/ResetPasswordDialog";
import { DeleteUserDialog } from "./components/DeleteUserDialog";

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {sub && <p className="text-sm text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export function UserManagementModule() {
  const [search, setSearch] = useState("");
  const [dummyUsersList, setDummyUsersList] = useState<Array<{ id: string; full_name: string; email: string; nis: string; class: string; roles: string[] }>>([]);

  // Dialog States
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const [userToEditRoles, setUserToEditRoles] = useState<{ id: string; full_name: string; email: string; nis: string; roles: string[] } | null>(null);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);

  const [userToResetPass, setUserToResetPass] = useState<{ id: string; full_name: string; email: string; nis: string; roles: string[] } | null>(null);
  const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);

  const [userToDelete, setUserToDelete] = useState<{ id: string; full_name: string; email: string; nis: string; roles: string[] } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [activeGroup, setActiveGroup] = useState<"semua" | "siswa" | "guru" | "pejabat">("semua");
  const availableRoles = ["admin", "admin_akademik", "kamad", "waka", "walikelas", "guru", "siswa"];

  useEffect(() => {
    let isMounted = true;
    MysqlDataService.getUsers()
      .then((users) => {
        if (!isMounted) return;
        if (users && users.length > 0) {
          const formatted = users.map((u) => {
            let finalRoles: string[] = [];
            if (u.role && u.role.includes(",")) {
              finalRoles = u.role.split(",").map((r) => r.trim());
            } else {
              finalRoles = [u.role || "siswa"];
            }
            return {
              id: String(u.id),
              full_name: u.full_name,
              email: u.email,
              nis: `${u.identity_type || (u.role === "siswa" ? "NISN" : "NIP")}. ${u.nis_nip || "-"}`,
              class: u.class_name || u.subject_specialty || "Semua",
              roles: finalRoles,
            };
          });
          setDummyUsersList(formatted);
        }
      })
      .catch((err) => console.warn("Failed fetching users from MySQL:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUserCreated = (newUser: { id: string; full_name: string; email: string; nis: string; class: string; roles: string[] }) => {
    MysqlDataService.updateUserRole(newUser.id, newUser.roles, newUser.email).catch(() => {});
    setDummyUsersList((prev) => [newUser, ...prev]);
  };

  const handleSaveRoles = (userId: string, userEmail: string, newRoles: string[]) => {
    MysqlDataService.updateUserRole(userId, newRoles, userEmail).catch(() => {});
    setDummyUsersList((prev) =>
      prev.map((u) => {
        if (u.id !== userId && u.email.toLowerCase() !== userEmail.toLowerCase()) return u;
        return { ...u, roles: newRoles };
      })
    );
  };

  const toggleRole = (userId: string, role: string) => {
    const userObj = dummyUsersList.find((u) => u.id === userId);
    if (userObj) {
      const exists = userObj.roles.includes(role);
      if (exists && userObj.roles.length <= 1) {
        return toast.error("Pengguna harus memiliki minimal 1 role aktif!");
      }

      const newRoles = exists ? userObj.roles.filter((r) => r !== role) : [...userObj.roles, role];
      handleSaveRoles(userId, userObj.email, newRoles);
      toast.success(`Hak akses role ${role} berhasil diperbarui!`);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    const targetId = userToDelete.id;
    const targetEmail = userToDelete.email;
    const targetName = userToDelete.full_name;

    setDummyUsersList((prev) => prev.filter((u) => u.id !== targetId));
    try {
      await MysqlDataService.deleteUser(targetId, targetEmail);
    } catch (err) {}

    toast.success(`Akun pengguna ${targetName} (${targetEmail}) berhasil dihapus!`);
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const siswaCount = dummyUsersList.filter((u) => u.roles.includes("siswa")).length;
  const guruCount = dummyUsersList.filter((u) => u.roles.some((r) => r === "guru" || r === "walikelas")).length;
  const pejabatCount = dummyUsersList.filter((u) => u.roles.some((r) => ["admin", "admin_akademik", "kamad", "waka"].includes(r))).length;

  const filtered = dummyUsersList.filter((u) => {
    if (activeGroup === "siswa" && !u.roles.includes("siswa")) return false;
    if (activeGroup === "guru" && !u.roles.some((r) => r === "guru" || r === "walikelas")) return false;
    if (activeGroup === "pejabat" && !u.roles.some((r) => ["admin", "admin_akademik", "kamad", "waka"].includes(r))) return false;

    const searchLower = search.toLowerCase();
    return (
      u.full_name.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower) ||
      u.nis.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <SectionHeader title="Manajemen Pengguna & Hak Akses (Role)" sub="Pengelolaan terkelompok untuk Siswa, Guru & Wali Kelas, serta Pejabat/Petugas Staf LMS MTsN 2 Cilacap" />

      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Data Akun Pengguna & Hak Akses
            </CardTitle>
            <CardDescription>
              Kelola akun terdaftar ({dummyUsersList.length} total) berdasarkan pengelompokan peran dan wewenang.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Cari nama, email, NIS..."
                className="pl-9 h-9 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button size="sm" className="gap-1.5 shrink-0 bg-primary text-primary-foreground font-bold" onClick={() => setIsAddUserOpen(true)}>
              <UserPlus className="h-4 w-4" /> Tambah User Baru
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-muted/40 rounded-xl border border-border/80">
            <button
              type="button"
              onClick={() => setActiveGroup("semua")}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeGroup === "semua" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Semua User ({dummyUsersList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveGroup("siswa")}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeGroup === "siswa" ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Kelompok Siswa ({siswaCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveGroup("guru")}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeGroup === "guru" ? "bg-blue-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>Guru & Wali Kelas ({guruCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveGroup("pejabat")}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeGroup === "pejabat" ? "bg-amber-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Pejabat & Petugas Staf ({pejabatCount})</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <div>
              Menampilkan <strong className="text-foreground">{filtered.length}</strong> akun dari kelompok{" "}
              <strong className="text-foreground uppercase">
                {activeGroup === "semua" ? "Semua User" : activeGroup === "siswa" ? "Siswa" : activeGroup === "guru" ? "Guru & Wali Kelas" : "Pejabat & Petugas Staf"}
              </strong>
            </div>
            {search && (
              <div>
                Pencarian: &quot;<span className="font-semibold text-foreground">{search}</span>&quot;
              </div>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-left border-b border-border">
                  <th className="py-3 px-4 font-semibold">Pengguna & NIP/NIS</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Kelas</th>
                  <th className="py-3 px-4 font-semibold">Role Aktif</th>
                  <th className="py-3 px-4 font-semibold">Kelola Hak Akses</th>
                  <th className="py-3 px-4 font-semibold text-center">Aksi & Kontrol</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const isSuperAdmin = u.email === "admin@mail.com";
                  const activeSession = MysqlAuthService.getActiveUser();
                  const isSelf = activeSession && activeSession.email.toLowerCase() === u.email.toLowerCase();
                  const currentIsAdmin =
                    activeSession?.role === "admin" ||
                    activeSession?.role === "superadmin" ||
                    activeSession?.role === "admin_akademik" ||
                    activeSession?.email?.toLowerCase() === "admin@mail.com" ||
                    activeSession?.email?.includes("admin");

                  return (
                    <tr key={u.id} className="border-b border-border/60 hover:bg-muted/30 transition">
                      <td className="py-3 px-4 font-medium">
                        <div className="font-bold text-foreground flex items-center gap-1.5">
                          {u.full_name}
                          {isSuperAdmin && (
                            <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-600 border-amber-500/30">
                              🛡️ Dilindungi
                            </Badge>
                          )}
                          {isSelf && (
                            <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                              👤 Sesi Anda
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">{u.nis}</div>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-muted-foreground">{u.email}</td>
                      <td className="py-3 px-4 text-xs font-semibold">{u.class}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((r) => (
                            <Badge key={r} variant="secondary" className="text-[10px] uppercase font-bold bg-primary/10 text-primary border border-primary/20">
                              {r.replace("_", " ")}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-[10px] px-2 font-bold bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 gap-1 mr-1"
                            onClick={() => {
                              setUserToEditRoles(u);
                              setIsEditRoleModalOpen(true);
                            }}
                            title="Buka Modal Kelola & Simpan Multi-Role"
                          >
                            <UserCog className="h-3 w-3" /> 🎭 Atur & Simpan Role
                          </Button>
                          {availableRoles.map((r) => {
                            const hasRole = u.roles.includes(r);
                            return (
                              <Button
                                key={r}
                                size="sm"
                                variant={hasRole ? "default" : "outline"}
                                className={`h-6 text-[10px] px-2 ${hasRole ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
                                onClick={() => toggleRole(u.id, r)}
                              >
                                {hasRole ? `✓ ${r}` : `+ ${r}`}
                              </Button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 border-emerald-500/30 gap-1"
                            onClick={() => {
                              setUserToEditRoles(u);
                              setIsEditRoleModalOpen(true);
                            }}
                            title="Buka Form Kelola & Simpan Role"
                          >
                            <Save className="h-3.5 w-3.5" /> Simpan Role
                          </Button>

                          {currentIsAdmin && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-500/10 border-teal-500/30 gap-1"
                              onClick={() => {
                                setUserToResetPass(u);
                                setIsResetPassModalOpen(true);
                              }}
                              title="Ubah / Reset Kata Sandi Akun (Khusus Super Admin)"
                            >
                              <KeyRound className="h-3.5 w-3.5" /> Sandi
                            </Button>
                          )}

                          {isSuperAdmin || isSelf ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled
                              className="h-7 px-2 text-xs text-muted-foreground opacity-50 cursor-not-allowed"
                              title={isSuperAdmin ? "Super Admin Utama dilindungi dari penghapusan" : "Tidak dapat menghapus akun sendiri"}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border border-rose-500/20"
                              onClick={() => {
                                setUserToDelete(u);
                                setIsDeleteModalOpen(true);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AddUserDialog
        isOpen={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
        onUserCreated={handleUserCreated}
      />

      <EditRolesDialog
        user={userToEditRoles}
        isOpen={isEditRoleModalOpen}
        onOpenChange={setIsEditRoleModalOpen}
        onSaveRoles={handleSaveRoles}
      />

      <ResetPasswordDialog
        user={userToResetPass}
        isOpen={isResetPassModalOpen}
        onOpenChange={setIsResetPassModalOpen}
      />

      <DeleteUserDialog
        user={userToDelete}
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirmDelete={confirmDeleteUser}
      />
    </div>
  );
}
