import { useState, useEffect } from "react";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { MysqlDataService } from "@/services/mysqlDataService";
import { toast } from "sonner";
import { Shield, Search, UserCog, Save, KeyRound, Trash2, Users, GraduationCap, UserCheck, ShieldCheck, UserPlus, ArrowUpDown, ArrowUp, ArrowDown, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { AddUserDialog } from "./components/AddUserDialog";
import { EditRolesDialog } from "./components/EditRolesDialog";
import { ResetPasswordDialog } from "./components/ResetPasswordDialog";
import { DeleteUserDialog } from "./components/DeleteUserDialog";
import { EditUserDialog, UserItem } from "./components/EditUserDialog";

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {sub && <p className="text-sm text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function getPersistedRoleOverrides(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("lms_user_roles_overrides") || "{}");
  } catch {
    return {};
  }
}

function setPersistedRoleOverride(identifier: string, roles: string[]) {
  if (typeof window === "undefined" || !identifier) return;
  try {
    const current = getPersistedRoleOverrides();
    current[identifier.toLowerCase().trim()] = roles;
    localStorage.setItem("lms_user_roles_overrides", JSON.stringify(current));
  } catch {}
}

export function UserManagementModule({ activeRole, userProfile }: { activeRole?: string; userProfile?: any }) {
  const isKamad = activeRole === "kamad";
  const [search, setSearch] = useState("");
  const [usersList, setUsersList] = useState<Array<UserItem>>([]);

  // Dialog States
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const [userToEditData, setUserToEditData] = useState<UserItem | null>(null);
  const [isEditDataModalOpen, setIsEditDataModalOpen] = useState(false);

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
          const overrides = getPersistedRoleOverrides();
          const formatted = users.map((u) => {
            const cleanEmail = (u.email || "").toLowerCase().trim();
            const cleanId = String(u.id || "").trim();
            const cleanNip = (u.nis_nip || "").trim();

            let finalRoles: string[] =
              overrides[cleanEmail] || overrides[cleanId] || overrides[cleanNip] || [];

            if (finalRoles.length === 0) {
              const roleStr = u.role || "";
              if (roleStr && roleStr.includes(",")) {
                finalRoles = roleStr.split(",").map((r) => r.trim());
              } else if (roleStr) {
                finalRoles = [roleStr];
              } else {
                finalRoles = ["siswa"];
              }
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
          setUsersList(formatted);
        }
      })
      .catch((err) => console.warn("Failed fetching users from MySQL:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUserCreated = (newUser: { id: string; full_name: string; email: string; nis: string; class: string; roles: string[] }) => {
    MysqlDataService.updateUserRole(newUser.id, newUser.roles, newUser.email).catch(() => {});
    setUsersList((prev) => [newUser, ...prev]);
  };

  const handleUserUpdated = (updatedUser: UserItem) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
    );
  };

  const handleSaveRoles = async (userId: string, userEmail: string, newRoles: string[]) => {
    const targetUser = usersList.find((u) => u.id === userId || u.email.toLowerCase() === userEmail.toLowerCase());
    const cleanNip = targetUser?.nis?.replace(/^(NISN|NIP)\.\s*/i, "").trim() || "";

    // 1. Immediately persist to localStorage overrides so refresh never reverts
    if (userEmail) setPersistedRoleOverride(userEmail, newRoles);
    if (userId) setPersistedRoleOverride(userId, newRoles);
    if (cleanNip) setPersistedRoleOverride(cleanNip, newRoles);

    // 2. Persist to MySQL database via backend server function
    const ok = await MysqlDataService.updateUserRole(userId, newRoles, userEmail, cleanNip);
    if (!ok) {
      toast.warning("Role tersimpan di browser, tetapi gagal tersambung ke database MySQL.");
    } else {
      toast.success("Role pengguna berhasil diperbarui dan disimpan secara permanen!");
    }

    // 3. Update React UI state
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id !== userId && u.email.toLowerCase() !== userEmail.toLowerCase()) return u;
        return { ...u, roles: newRoles };
      })
    );
  };

  const toggleRole = (userId: string, role: string) => {
    const userObj = usersList.find((u) => u.id === userId);
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

    setUsersList((prev) => prev.filter((u) => u.id !== targetId));
    try {
      await MysqlDataService.deleteUser(targetId, targetEmail);
    } catch (err) {}

    toast.success(`Akun pengguna ${targetName} (${targetEmail}) berhasil dihapus!`);
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const siswaCount = usersList.filter((u) => u.roles.includes("siswa")).length;
  const guruCount = usersList.filter((u) => u.roles.some((r) => r === "guru" || r === "walikelas")).length;
  const pejabatCount = usersList.filter((u) => u.roles.some((r) => ["admin", "admin_akademik", "kamad", "waka"].includes(r))).length;

  const filtered = usersList.filter((u) => {
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

  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (colKey: string) => {
    if (sortColumn === colKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(colKey);
      setSortDir("asc");
    }
  };

  const sortedFiltered = [...filtered].sort((a, b) => {
    let valA: any = "";
    let valB: any = "";
    if (sortColumn === "name") {
      valA = a.full_name.toLowerCase();
      valB = b.full_name.toLowerCase();
    } else if (sortColumn === "email") {
      valA = a.email.toLowerCase();
      valB = b.email.toLowerCase();
    } else if (sortColumn === "class") {
      valA = a.class.toLowerCase();
      valB = b.class.toLowerCase();
    } else if (sortColumn === "role") {
      valA = (a.roles[0] || "").toLowerCase();
      valB = (b.roles[0] || "").toLowerCase();
    }

    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-6">
      <SectionHeader title="Manajemen Pengguna & Hak Akses (Role)" sub="Kelola akun pengguna, pengelompokan peran, dan hak akses sistem." />

      {isKamad && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 flex items-center justify-between text-xs font-semibold">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
            <span>🏛️ <strong>Mode Monitoring Eksekutif Kepala Madrasah</strong> — Tampilan Read-Only. Kepala Madrasah memantau direktori user & wewenang role tanpa mengubah data.</span>
          </span>
          <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-400 font-mono text-[10px]">READ ONLY MONITORING</Badge>
        </div>
      )}

      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Data Akun Pengguna & Hak Akses
            </CardTitle>
            <CardDescription>
              Kelola akun terdaftar ({usersList.length} total) berdasarkan pengelompokan peran dan wewenang.
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
            {!isKamad && (
              <Button size="sm" className="gap-1.5 shrink-0 bg-primary text-primary-foreground font-bold" onClick={() => setIsAddUserOpen(true)}>
                <UserPlus className="h-4 w-4" /> Tambah User Baru
              </Button>
            )}
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
              <span>Semua User ({usersList.length})</span>
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
              Menampilkan <strong className="text-foreground">{sortedFiltered.length}</strong> akun dari kelompok{" "}
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
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/60 text-left border-b border-border font-bold text-muted-foreground">
                  <th className="py-3 px-4 cursor-pointer hover:bg-muted/80 select-none" onClick={() => handleSort("name")}>
                    <div className="flex items-center gap-1.5">
                      <span>Pengguna & NIP/NIS</span>
                      {sortColumn === "name" ? (
                        sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/40" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4 cursor-pointer hover:bg-muted/80 select-none" onClick={() => handleSort("email")}>
                    <div className="flex items-center gap-1.5">
                      <span>Email</span>
                      {sortColumn === "email" ? (
                        sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/40" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-3 cursor-pointer hover:bg-muted/80 select-none" onClick={() => handleSort("class")}>
                    <div className="flex items-center gap-1.5">
                      <span>Kelas / Spesialisasi</span>
                      {sortColumn === "class" ? (
                        sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/40" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4 cursor-pointer hover:bg-muted/80 select-none" onClick={() => handleSort("role")}>
                    <div className="flex items-center gap-1.5">
                      <span>Hak Akses (Role Aktif)</span>
                      {sortColumn === "role" ? (
                        sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/40" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Aksi & Kontrol Akses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedFiltered.map((u) => {
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
                    <tr key={u.id} className="hover:bg-muted/30 transition">
                      <td className="py-3 px-4 font-medium">
                        <div className="font-bold text-foreground flex items-center gap-1.5 flex-wrap">
                          <span>{u.full_name}</span>
                          {isSuperAdmin && (
                            <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30 flex items-center gap-1">
                              <Shield className="h-3 w-3 text-amber-500" /> Dilindungi
                            </Badge>
                          )}
                          {isSelf && (
                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 flex items-center gap-1">
                              <UserCheck className="h-3 w-3 text-emerald-500" /> Sesi Anda
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{u.nis}</div>
                      </td>

                      <td className="py-3 px-4 font-mono text-muted-foreground text-xs">{u.email}</td>

                      <td className="py-3 px-3">
                        <Badge variant="outline" className="text-[11px] font-semibold border-border">
                          {u.class}
                        </Badge>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((r) => {
                            const badgeColor =
                              r === "admin" || r === "admin_akademik"
                                ? "bg-purple-600 text-white"
                                : r === "kamad" || r === "waka"
                                ? "bg-amber-600 text-white"
                                : r === "walikelas"
                                ? "bg-blue-600 text-white"
                                : r === "guru"
                                ? "bg-emerald-600 text-white"
                                : "bg-muted text-muted-foreground border border-border";

                            return (
                              <Badge key={r} className={`text-[10px] uppercase font-bold px-2 py-0.5 ${badgeColor}`}>
                                {r.replace("_", " ")}
                              </Badge>
                            );
                          })}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isKamad ? (
                          <Badge variant="outline" className="text-[10px] font-mono text-amber-700 dark:text-amber-400 border-amber-500/40 bg-amber-500/10">
                            👁️ READ-ONLY MONITORING
                          </Badge>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2.5 text-xs font-bold text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 border-amber-500/30 gap-1"
                              onClick={() => {
                                setUserToEditData(u);
                                setIsEditDataModalOpen(true);
                              }}
                              title="Edit Profile Data Pengguna (Nama, NISN/NIP, Email, Kelas)"
                            >
                              <Edit3 className="h-3.5 w-3.5" /> Edit Data
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 border-emerald-500/30 gap-1"
                              onClick={() => {
                                setUserToEditRoles(u);
                                setIsEditRoleModalOpen(true);
                              }}
                              title="Kelola Peran (Role) Pengguna"
                            >
                              <UserCog className="h-3.5 w-3.5" /> Kelola Role
                            </Button>

                            {currentIsAdmin && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2.5 text-xs font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-500/10 border-teal-500/30 gap-1"
                                onClick={() => {
                                  setUserToResetPass(u);
                                  setIsResetPassModalOpen(true);
                                }}
                                title="Ubah / Reset Kata Sandi"
                              >
                                <KeyRound className="h-3.5 w-3.5" /> Sandi
                              </Button>
                            )}

                            {isSuperAdmin || isSelf ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled
                                className="h-7 px-2.5 text-xs text-muted-foreground opacity-40 cursor-not-allowed"
                                title={isSuperAdmin ? "Super Admin Utama dilindungi dari penghapusan" : "Tidak dapat menghapus akun sendiri"}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-500/30 gap-1"
                                onClick={() => {
                                  setUserToDelete(u);
                                  setIsDeleteModalOpen(true);
                                }}
                                title="Hapus Akun Pengguna"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Hapus
                              </Button>
                            )}
                          </div>
                        )}
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

      <EditUserDialog
        isOpen={isEditDataModalOpen}
        onOpenChange={setIsEditDataModalOpen}
        user={userToEditData}
        onUserUpdated={handleUserUpdated}
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
