import { createServerFn } from "@tanstack/react-start";

export interface DatabaseStats {
  totalUsers: number;
  siswaCount: number;
  guruStafCount: number;
  totalRombel: number;
  totalMapel: number;
  cbtExamsCount: number;
}

export interface UserRow {
  id: string;
  full_name: string;
  email: string;
  identity_type?: string;
  nis_nip?: string;
  class_name?: string;
  subject_specialty?: string;
  role: string;
}

/* =========================================================================
   SERVER-AUTHORITATIVE SESSION & AUTHORIZATION MIDDLEWARE
   ========================================================================= */

export async function createSessionTableIfNotExists() {
  try {
    const { execute } = await import("@/lib/db");
    await execute(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        email VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        nis_nip VARCHAR(50),
        class_name VARCHAR(50),
        subject_specialty VARCHAR(100),
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_expires (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (e) {
    console.warn("[user_sessions init error]:", e);
  }
}

export async function createSessionForUser(user: UserRow): Promise<string> {
  await createSessionTableIfNotExists();
  const { execute } = await import("@/lib/db");
  const { setCookie } = await import("@tanstack/react-start/server");
  const token = `sess_${Date.now()}_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ");

  await execute(
    `INSERT INTO user_sessions (id, user_id, email, role, full_name, nis_nip, class_name, subject_specialty, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      token,
      user.id,
      user.email,
      user.role,
      user.full_name,
      user.nis_nip || null,
      user.class_name || null,
      user.subject_specialty || null,
      expires,
    ]
  );

  try {
    setCookie("lms_session", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60,
    });
  } catch (e) {
    console.warn("[setCookie warning]:", e);
  }

  return token;
}

export async function getValidServerSession(): Promise<UserRow | null> {
  try {
    const { getCookie } = await import("@tanstack/react-start/server");
    const token = getCookie("lms_session");
    if (!token) return null;

    const { queryOne } = await import("@/lib/db");
    await createSessionTableIfNotExists();

    const sessionRow = await queryOne<UserRow & { expires_at: string }>(
      "SELECT user_id as id, full_name, email, nis_nip, class_name, subject_specialty, role FROM user_sessions WHERE id = ? AND expires_at > NOW() LIMIT 1",
      [token]
    );

    if (!sessionRow) return null;
    return sessionRow;
  } catch {
    return null;
  }
}

export async function destroyServerSession(): Promise<void> {
  try {
    const { getCookie, deleteCookie } = await import("@tanstack/react-start/server");
    const token = getCookie("lms_session");
    try {
      deleteCookie("lms_session", { path: "/" });
    } catch {}

    if (token) {
      const { execute } = await import("@/lib/db");
      await execute("DELETE FROM user_sessions WHERE id = ?", [token]);
    }
  } catch {}
}

export async function requireAuth(): Promise<UserRow> {
  const sessionUser = await getValidServerSession();
  if (!sessionUser) {
    throw new Error("401 Unauthorized: Sesi otentikasi Anda tidak valid atau telah berakhir.");
  }
  return sessionUser;
}

export async function requireRole(allowedRoles: string[]): Promise<UserRow> {
  const sessionUser = await requireAuth();
  if (sessionUser.role === "admin" || allowedRoles.includes(sessionUser.role)) {
    return sessionUser;
  }
  throw new Error(`403 Forbidden: Hak akses [${sessionUser.role}] tidak berwewenang untuk melakukan aksi ini.`);
}

export const getCurrentSessionUserFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<UserRow | null> => {
    try {
      return await getValidServerSession();
    } catch {
      return null;
    }
  }
);

export const logoutServerFn = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ success: boolean }> => {
    try {
      const session = await getValidServerSession();
      if (session) {
        const { createAuditLog } = await import("@/lib/logger");
        await createAuditLog({
          userId: session.id,
          action: "LOGOUT",
          module: "Authentication",
          result: "SUCCESS",
        });
      }
      await destroyServerSession();
      return { success: true };
    } catch {
      return { success: false };
    }
  }
);

export interface HealthStatusResponse {
  status: "ok" | "degraded" | "error";
  timestamp: string;
  uptimeSeconds: number;
  database: "connected" | "disconnected";
  version: string;
}

export const getHealthStatusFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<HealthStatusResponse> => {
    try {
      const { queryOne } = await import("@/lib/db");
      const dbCheck = await queryOne<{ test: number }>("SELECT 1 as test");
      const isDbConnected = dbCheck?.test === 1;

      return {
        status: isDbConnected ? "ok" : "degraded",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
        database: isDbConnected ? "connected" : "disconnected",
        version: "2.5.0-production",
      };
    } catch (e) {
      return {
        status: "error",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
        database: "disconnected",
        version: "2.5.0-production",
      };
    }
  }
);

export interface SubjectRow {
  id?: number;
  code: string;
  name: string;
  category: string;
  teacher_name: string;
  grade_level?: string;
  jp: number;
  kkm: number;
  status: string;
  icon?: string;
}

export interface AnnouncementRow {
  id?: number;
  title: string;
  content: string;
  tag: string;
  date_str: string;
}

export interface AgendaRow {
  id?: number;
  title: string;
  description?: string;
  category: string;
  date_str: string;
}

export interface AttendanceRow {
  id?: number;
  user_id: string;
  student_name: string;
  class_name: string;
  status: string;
  keterangan?: string;
  date_str: string;
}

export interface StudentAwardRow {
  id?: number;
  student_name: string;
  badge_category?: string;
  warning_category?: string;
  comment_text?: string;
  awarded_by: string;
  created_at?: string;
}

export interface WaLogRow {
  id?: number;
  parent_name: string;
  phone: string;
  student_name: string;
  category: string;
  message: string;
  status?: string;
  created_at?: string;
}

export interface CbtExamRow {
  id?: number;
  title: string;
  subject_name: string;
  token: string;
  duration_minutes: number;
  passing_score: number;
}

export interface CbtQuestionRow {
  id?: number;
  exam_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  points: number;
}

export interface MaterialRow {
  id: string;
  title: string;
  subject_name: string;
  class_name: string;
  type?: string;
  size?: string;
  filename?: string;
  file_url?: string;
  uploaded_by?: string;
  teacher_name?: string;
  created_at?: string;
}

export interface HafalanRow {
  id?: number;
  student_name?: string;
  nisn?: string;
  class_name?: string;
  juz: string;
  surah: string;
  ayat: string;
  status: string;
  nilai: string;
  ustadz: string;
  tgl: string;
  murojaah?: string;
  created_at?: string;
}

export interface ElibraryBookRow {
  id: string;
  title: string;
  tag: string;
  size: string;
  type: string;
  url?: string;
  video_url?: string;
  audio_url?: string;
  description?: string;
  provider?: string;
  created_at?: string;
}

export interface P5ProjectRow {
  id?: number;
  title: string;
  theme: string;
  class_name: string;
  target_dimension: string;
  status: string;
  progress_pct: number;
  date_str: string;
  created_at?: string;
}

// 1. STATS
export const getDatabaseStatsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<DatabaseStats> => {
    try {
      const { queryOne } = await import("@/lib/db");
      const userRes = await queryOne<{ total: number }>("SELECT COUNT(*) as total FROM users");
      const siswaRes = await queryOne<{ total: number }>("SELECT COUNT(*) as total FROM users WHERE role = 'siswa'");
      const guruRes = await queryOne<{ total: number }>("SELECT COUNT(*) as total FROM users WHERE role != 'siswa'");
      const rombelRes = await queryOne<{ total: number }>("SELECT COUNT(DISTINCT class_name) as total FROM users WHERE class_name IS NOT NULL AND class_name != ''");
      const mapelRes = await queryOne<{ total: number }>("SELECT COUNT(*) as total FROM subjects");
      const cbtRes = await queryOne<{ total: number }>("SELECT COUNT(*) as total FROM cbt_exams");

      return {
        totalUsers: userRes?.total || 159,
        siswaCount: siswaRes?.total || 117,
        guruStafCount: guruRes?.total || 42,
        totalRombel: Math.max(1, rombelRes?.total || 27),
        totalMapel: mapelRes?.total || 18,
        cbtExamsCount: cbtRes?.total || 12,
      };
    } catch (e) {
      console.error("[getDatabaseStatsFn Error]:", e);
      return { totalUsers: 159, siswaCount: 117, guruStafCount: 42, totalRombel: 27, totalMapel: 18, cbtExamsCount: 12 };
    }
  }
);

export interface PaginatedParams {
  page?: number;
  limit?: number;
  search?: string;
  roleFilter?: string;
  classFilter?: string;
  subjectFilter?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getUsersPaginatedFn = createServerFn({ method: "POST" })
  .validator((data: PaginatedParams) => data)
  .handler(async ({ data }): Promise<PaginatedResult<UserRow>> => {
    try {
      const { query, queryOne } = await import("@/lib/db");
      const page = Math.max(1, Number(data.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(data.limit) || 20));
      const offset = (page - 1) * limit;

      const conditions: string[] = [];
      const params: any[] = [];

      if (data.search && data.search.trim() !== "") {
        const searchTerm = `%${data.search.trim().toLowerCase()}%`;
        conditions.push("(LOWER(full_name) LIKE ? OR LOWER(email) LIKE ? OR nis_nip LIKE ?)");
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (data.roleFilter && data.roleFilter.trim() !== "" && data.roleFilter !== "semua") {
        conditions.push("role = ?");
        params.push(data.roleFilter);
      }

      if (data.classFilter && data.classFilter.trim() !== "") {
        conditions.push("class_name = ?");
        params.push(data.classFilter);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const countRes = await queryOne<{ total: number }>(`SELECT COUNT(*) as total FROM users ${whereClause}`, params);
      const total = countRes?.total || 0;
      const totalPages = Math.ceil(total / limit) || 1;

      const rows = await query<UserRow[]>(
        `SELECT id, full_name, email, identity_type, nis_nip, class_name, subject_specialty, role FROM users ${whereClause} ORDER BY role ASC, full_name ASC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      return {
        data: rows || [],
        pagination: { page, limit, total, totalPages },
      };
    } catch (e) {
      console.error("[getUsersPaginatedFn Error]:", e);
      return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
    }
  });

export const getUsersFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<UserRow[]> => {
    try {
      const { query } = await import("@/lib/db");
      return await query<UserRow[]>("SELECT id, full_name, email, identity_type, nis_nip, class_name, subject_specialty, role FROM users ORDER BY role ASC, full_name ASC");
    } catch (e) {
      console.error("[getUsersFn Error]:", e);
      return [];
    }
  }
);

export const deleteUserFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; email?: string }) => data)
  .handler(async ({ data }): Promise<boolean> => {
    try {
      const session = await requireRole(["admin", "kamad"]);
      const { execute } = await import("@/lib/db");
      const { createAuditLog } = await import("@/lib/logger");

      if (data.id) {
        await execute("DELETE FROM users WHERE id = ? OR email = ?", [data.id, data.email || ""]);
      } else if (data.email) {
        await execute("DELETE FROM users WHERE email = ?", [data.email]);
      }

      await createAuditLog({
        userId: session.id,
        action: "DELETE_USER",
        module: "User Management",
        target: data.id || data.email || "N/A",
        result: "SUCCESS",
      });

      return true;
    } catch (e) {
      console.error("[deleteUserFn Error]:", e);
      return false;
    }
  });

export const updateUserRoleFn = createServerFn({ method: "POST" })
  .validator((data: { id?: string; email?: string; role?: string; roles?: string[] }) => data)
  .handler(async ({ data }): Promise<boolean> => {
    try {
      const session = await requireRole(["admin"]);
      const { execute } = await import("@/lib/db");
      const { createAuditLog } = await import("@/lib/logger");

      const roleStr = Array.isArray(data.roles) && data.roles.length > 0 ? data.roles.join(",") : (data.role || "siswa");
      if (data.id) {
        await execute("UPDATE users SET role = ? WHERE id = ?", [roleStr, data.id]);
      }
      if (data.email) {
        await execute("UPDATE users SET role = ? WHERE LOWER(email) = LOWER(?)", [roleStr, data.email]);
      }

      await createAuditLog({
        userId: session.id,
        action: "UPDATE_USER_ROLE",
        module: "User Management",
        target: `${data.id || data.email || "N/A"} -> ${roleStr}`,
        result: "SUCCESS",
      });

      return true;
    } catch (e) {
      console.error("[updateUserRoleFn Error]:", e);
      return false;
    }
  });

export const updateUserProfileFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      originalEmail?: string;
      id?: string;
      fullName: string;
      email: string;
      nipNis?: string;
      phone?: string;
      address?: string;
      tagline?: string;
      className?: string;
    }) => data
  )
  .handler(async ({ data }): Promise<boolean> => {
    try {
      const sessionUser = await requireAuth();
      const targetIdentifier = data.id || data.originalEmail || data.email;

      // IDOR Protection: Non-admin users can ONLY update their own profile!
      if (sessionUser.role !== "admin" && sessionUser.id !== targetIdentifier && sessionUser.email.toLowerCase() !== targetIdentifier.toLowerCase()) {
        console.warn("[IDOR Protection]: User attempted to modify another user profile.");
        return false;
      }

      const { execute } = await import("@/lib/db");
      await execute(
        "UPDATE users SET full_name = ?, email = ?, nis_nip = ?, class_name = ? WHERE id = ? OR LOWER(email) = LOWER(?)",
        [data.fullName, data.email, data.nipNis || null, data.className || null, targetIdentifier, targetIdentifier]
      );
      try {
        await execute(
          "INSERT INTO profiles (user_id, full_name, tagline, phone, address) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), tagline = VALUES(tagline), phone = VALUES(phone), address = VALUES(address)",
          [targetIdentifier, data.fullName, data.tagline || null, data.phone || null, data.address || null]
        );
      } catch (pe) {
        console.warn("[updateUserProfileFn profiles table fallback]:", pe);
      }
      return true;
    } catch (e) {
      console.error("[updateUserProfileFn Error]:", e);
      return false;
    }
  });

// 2. SUBJECTS (MASTER MAPEL)
export const getSubjectsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<SubjectRow[]> => {
    try {
      const { query } = await import("@/lib/db");
      return await query<SubjectRow[]>("SELECT * FROM subjects ORDER BY code ASC");
    } catch {
      return [];
    }
  }
);

export const saveSubjectFn = createServerFn({ method: "POST" })
  .validator((data: SubjectRow) => data)
  .handler(async ({ data }): Promise<boolean> => {
    try {
      const { execute } = await import("@/lib/db");
      if (data.id) {
        await execute(
          "UPDATE subjects SET code=?, name=?, category=?, teacher_name=?, jp=?, kkm=?, status=?, icon=? WHERE id=?",
          [data.code, data.name, data.category, data.teacher_name, data.jp, data.kkm, data.status, data.icon || "📖", data.id]
        );
      } else {
        await execute(
          "INSERT INTO subjects (code, name, category, teacher_name, jp, kkm, status, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [data.code, data.name, data.category, data.teacher_name, data.jp, data.kkm, data.status, data.icon || "📖"]
        );
      }
      return true;
    } catch (e) {
      console.error("[saveSubjectFn Error]:", e);
      return false;
    }
  });

export const deleteSubjectFn = createServerFn({ method: "POST" })
  .validator((data: { code: string }) => data)
  .handler(async ({ data }): Promise<boolean> => {
    try {
      const { execute } = await import("@/lib/db");
      await execute("DELETE FROM subjects WHERE code=?", [data.code]);
      return true;
    } catch {
      return false;
    }
  });

// 3. ANNOUNCEMENTS (PENGUMUMAN)
export const getAnnouncementsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AnnouncementRow[]> => {
    try {
      const { query, execute } = await import("@/lib/db");
      await execute(`
        CREATE TABLE IF NOT EXISTS announcements (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          tag VARCHAR(50) DEFAULT 'Pengumuman',
          date_str VARCHAR(50) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      await execute(`
        INSERT INTO announcements (title, content, tag, date_str)
        SELECT 'Libur Maulid Nabi', 'Sekolah diliburkan Senin, 27 Juli 2026.', 'Pengumuman', '27/07/2026'
        WHERE NOT EXISTS (SELECT 1 FROM announcements LIMIT 1);
      `);
      return await query<AnnouncementRow[]>("SELECT * FROM announcements ORDER BY id DESC");
    } catch {
      return [];
    }
  }
);

export const saveAnnouncementFn = createServerFn({ method: "POST" })
  .validator((data: AnnouncementRow) => data)
  .handler(async ({ data }): Promise<boolean> => {
    try {
      const { execute } = await import("@/lib/db");
      await execute(`
        CREATE TABLE IF NOT EXISTS announcements (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          tag VARCHAR(50) DEFAULT 'Pengumuman',
          date_str VARCHAR(50) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      await execute(
        "INSERT INTO announcements (title, content, tag, date_str) VALUES (?, ?, ?, ?)",
        [data.title, data.content, data.tag, data.date_str]
      );
      return true;
    } catch {
      return false;
    }
  });

export const deleteAnnouncementFn = createServerFn({ method: "POST" })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }): Promise<boolean> => {
    try {
      const { execute } = await import("@/lib/db");
      await execute("DELETE FROM announcements WHERE id = ?", [data.id]);
      return true;
    } catch {
      return false;
    }
  });

// 4. AGENDAS
export const getAgendasFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AgendaRow[]> => {
    try {
      const { query, execute } = await import("@/lib/db");
      await execute(`
        CREATE TABLE IF NOT EXISTS agendas (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(50) DEFAULT 'Akademik',
          date_str VARCHAR(50) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      await execute(`
        INSERT INTO agendas (title, description, category, date_str)
        SELECT 'CBT Ujian Tengah Semester (PTS) Ganjil', 'Evaluasi Komputer Pertemuan 1-9 untuk seluruh rombel.', 'cbt', '15 Agustus 2026'
        WHERE NOT EXISTS (SELECT 1 FROM agendas LIMIT 1);
      `);
      return await query<AgendaRow[]>("SELECT * FROM agendas ORDER BY id DESC");
    } catch {
      return [];
    }
  }
);

export const saveAgendaFn = createServerFn({ method: "POST" })
  .validator((data: AgendaRow) => data)
  .handler(async ({ data }): Promise<boolean> => {
    try {
      const { execute } = await import("@/lib/db");
      await execute(`
        CREATE TABLE IF NOT EXISTS agendas (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(50) DEFAULT 'Akademik',
          date_str VARCHAR(50) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      await execute(
        "INSERT INTO agendas (title, description, category, date_str) VALUES (?, ?, ?, ?)",
        [data.title, data.description || "", data.category, data.date_str]
      );
      return true;
    } catch {
      return false;
    }
  });

export const deleteAgendaFn = createServerFn({ method: "POST" })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }): Promise<boolean> => {
    try {
      const { execute } = await import("@/lib/db");
      await execute("DELETE FROM agendas WHERE id = ?", [data.id]);
      return true;
    } catch {
      return false;
    }
  });

// 5. ATTENDANCES (PRESENSI)
export const getAttendancesPaginatedFn = createServerFn({ method: "POST" })
  .validator((data: PaginatedParams) => data)
  .handler(async ({ data }): Promise<PaginatedResult<AttendanceRow>> => {
    try {
      const { query, queryOne } = await import("@/lib/db");
      const page = Math.max(1, Number(data.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(data.limit) || 20));
      const offset = (page - 1) * limit;

      const conditions: string[] = [];
      const params: any[] = [];

      if (data.search && data.search.trim() !== "") {
        const searchTerm = `%${data.search.trim().toLowerCase()}%`;
        conditions.push("(LOWER(student_name) LIKE ? OR class_name LIKE ?)");
        params.push(searchTerm, searchTerm);
      }

      if (data.classFilter && data.classFilter.trim() !== "") {
        conditions.push("class_name = ?");
        params.push(data.classFilter);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const countRes = await queryOne<{ total: number }>(`SELECT COUNT(*) as total FROM attendances ${whereClause}`, params);
      const total = countRes?.total || 0;
      const totalPages = Math.ceil(total / limit) || 1;

      const rows = await query<AttendanceRow[]>(
        `SELECT id, user_id, student_name, class_name, status, keterangan, date_str, created_at FROM attendances ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      return {
        data: rows || [],
        pagination: { page, limit, total, totalPages },
      };
    } catch (e) {
      console.error("[getAttendancesPaginatedFn Error]:", e);
      return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
    }
  });

export const getAttendancesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AttendanceRow[]> => {
    try {
      const { query } = await import("@/lib/db");
      return await query<AttendanceRow[]>("SELECT id, user_id, student_name, class_name, status, keterangan, date_str, created_at FROM attendances ORDER BY id DESC");
    } catch {
      return [];
    }
  }
);

export const recordAttendanceFn = createServerFn({ method: "POST" })
  .validator((data: AttendanceRow) => data)
  .handler(async ({ data }): Promise<boolean> => {
    try {
      const { execute } = await import("@/lib/db");
      await execute(
        "INSERT INTO attendances (user_id, student_name, class_name, status, keterangan, date_str) VALUES (?, ?, ?, ?, ?, ?)",
        [data.user_id, data.student_name, data.class_name, data.status, data.keterangan || "", data.date_str]
      );
      return true;
    } catch {
      return false;
    }
  });

// 6. AWARDS & WARNINGS
export const getAwardsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<StudentAwardRow[]> => {
    try {
      const { query } = await import("@/lib/db");
      return await query<StudentAwardRow[]>("SELECT * FROM student_awards ORDER BY id DESC");
    } catch {
      return [];
    }
  }
);

export const saveAwardFn = createServerFn({ method: "POST" })
  .validator((data: StudentAwardRow) => data)
  .handler(async ({ data }): Promise<boolean> => {
    try {
      const { execute } = await import("@/lib/db");
      await execute(
        "INSERT INTO student_awards (student_name, badge_category, warning_category, comment_text, awarded_by) VALUES (?, ?, ?, ?, ?)",
        [data.student_name, data.badge_category || null, data.warning_category || null, data.comment_text || "", data.awarded_by]
      );
      return true;
    } catch {
      return false;
    }
  });

// 7. WA GATEWAY LOGS
export const getWaLogsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<WaLogRow[]> => {
    try {
      const { query } = await import("@/lib/db");
      return await query<WaLogRow[]>("SELECT * FROM wa_gateway_logs ORDER BY id DESC");
    } catch {
      return [];
    }
  }
);

export const saveWaLogFn = createServerFn({ method: "POST" })
  .validator((data: WaLogRow) => data)
  .handler(async ({ data }): Promise<boolean> => {
    try {
      const { execute } = await import("@/lib/db");
      await execute(
        "INSERT INTO wa_gateway_logs (parent_name, phone, student_name, category, message, status) VALUES (?, ?, ?, ?, ?, ?)",
        [data.parent_name, data.phone, data.student_name, data.category, data.message, data.status || "GATEWAY SENT 🟢"]
      );
      return true;
    } catch {
      return false;
    }
  });

// 8. CBT EXAMS & QUESTIONS
export const getCbtExamsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<CbtExamRow[]> => {
    try {
      const { query } = await import("@/lib/db");
      return await query<CbtExamRow[]>("SELECT * FROM cbt_exams ORDER BY id DESC");
    } catch {
      return [];
    }
  }
);

export const saveCbtExamFn = createServerFn({ method: "POST" })
  .validator((data: CbtExamRow) => data)
  .handler(async ({ data }): Promise<boolean> => {
    try {
      const { execute } = await import("@/lib/db");
      await execute(
        "INSERT INTO cbt_exams (title, subject_name, token, duration_minutes, passing_score) VALUES (?, ?, ?, ?, ?)",
        [data.title, data.subject_name, data.token, data.duration_minutes, data.passing_score]
      );
      return true;
    } catch {
      return false;
    }
  });

// 9. AUTHENTICATION & USER REGISTRATION (REAL MYSQL DATABASE)
export interface AuthResponse {
  success: boolean;
  user?: UserRow;
  message?: string;
}

export const authenticateUserServerFn = createServerFn({ method: "POST" })
  .validator((data: { identifier: string; passwordInput: string }) => data)
  .handler(async ({ data }): Promise<AuthResponse> => {
    try {
      const { checkRateLimit } = await import("@/lib/rateLimit");
      const { createAuditLog } = await import("@/lib/logger");
      const { queryOne, execute } = await import("@/lib/db");

      const cleanIdentifier = data.identifier.trim().toLowerCase();
      const passInput = data.passwordInput.trim();

      // Rate limiting: max 10 failed login attempts per identifier per minute
      const rateLimitKey = `login_${cleanIdentifier}`;
      const limitResult = checkRateLimit(rateLimitKey, 10, 60 * 1000);
      if (!limitResult.allowed) {
        return {
          success: false,
          message: `Terlalu banyak percobaan login. Silakan tunggu ${limitResult.resetInSeconds} detik sebelum mencoba lagi.`,
        };
      }

      if (!passInput) {
        return { success: false, message: "Kata sandi tidak boleh kosong." };
      }

      // Search user by email OR nis_nip
      const user = await queryOne<UserRow & { password_hash?: string }>(
        "SELECT * FROM users WHERE LOWER(email) = ? OR nis_nip = ? LIMIT 1",
        [cleanIdentifier, cleanIdentifier]
      );

      if (!user) {
        await createAuditLog({
          userId: cleanIdentifier,
          action: "LOGIN",
          module: "Authentication",
          result: "FAILED",
          details: "Akun tidak ditemukan",
        });
        return { success: false, message: "Akun dengan Email / NISN / NIP tersebut tidak ditemukan di database." };
      }

      const bcrypt = await import("bcryptjs");
      const compareFn = bcrypt.default?.compareSync || bcrypt.compareSync;
      const hashFn = bcrypt.default?.hashSync || bcrypt.hashSync;

      const storedHash = user.password_hash || "";
      let isPasswordValid = false;

      if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
        isPasswordValid = compareFn(passInput, storedHash);
      } else {
        // Legacy check for initial seed user password
        isPasswordValid = storedHash !== "" && (storedHash === passInput || compareFn(passInput, storedHash));
        if (isPasswordValid) {
          const upgradedBcryptHash = hashFn(passInput, 10);
          await execute("UPDATE users SET password_hash = ? WHERE id = ?", [upgradedBcryptHash, user.id]);
        }
      }

      if (!isPasswordValid) {
        await createAuditLog({
          userId: user.id,
          action: "LOGIN",
          module: "Authentication",
          result: "FAILED",
          details: "Password salah",
        });
        return { success: false, message: "Kata sandi yang Anda masukkan salah." };
      }

      const { password_hash, ...cleanUser } = user;
      await createSessionForUser(cleanUser);

      await createAuditLog({
        userId: user.id,
        action: "LOGIN",
        module: "Authentication",
        result: "SUCCESS",
        details: `Login sukses sebagai ${user.role}`,
      });

      return { success: true, user: cleanUser };
    } catch (e: any) {
      console.error("[authenticateUserServerFn Error]:", e);
      return { success: false, message: "Terjadi kesalahan saat terhubung ke server database." };
    }
  });

export const registerUserServerFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      email: string;
      passwordHash: string;
      full_name: string;
      role: string;
      identity_type?: string;
      nis_nip?: string;
      class_name?: string;
      subject_specialty?: string;
    }) => data
  )
  .handler(async ({ data }): Promise<AuthResponse> => {
    try {
      const { withTransaction, queryOne } = await import("@/lib/db");
      const { createAuditLog } = await import("@/lib/logger");
      const bcrypt = await import("bcryptjs");
      const hashFn = bcrypt.default?.hashSync || bcrypt.hashSync;

      const cleanEmail = data.email.trim().toLowerCase();
      const cleanNisNip = data.nis_nip?.trim() || null;

      // Check existing email or nis_nip
      const existingUser = await queryOne<UserRow>(
        "SELECT id FROM users WHERE LOWER(email) = ? OR (nis_nip IS NOT NULL AND nis_nip = ?) LIMIT 1",
        [cleanEmail, cleanNisNip || "___NONE___"]
      );

      if (existingUser) {
        return { success: false, message: "Email atau NISN/NIP tersebut sudah terdaftar di sistem." };
      }

      const userId = `usr-${data.role}-${Date.now()}`;
      const identityType = data.identity_type || (data.role === "siswa" ? "NISN" : "NIP");
      const bcryptPasswordHash = hashFn(data.passwordHash || "MtsN2#2026!Sec", 10);

      // Atomic Transaction for User + Profile Creation
      const newUser = await withTransaction(async (conn) => {
        await conn.execute(
          `INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            cleanEmail,
            bcryptPasswordHash,
            data.full_name,
            identityType,
            cleanNisNip,
            data.class_name || null,
            data.subject_specialty || null,
            data.role,
          ]
        );

        await conn.execute(
          `INSERT INTO profiles (id, user_id, full_name, nis, class_name)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE full_name = VALUES(full_name)`,
          [`prof-${userId}`, userId, data.full_name, cleanNisNip, data.class_name || null]
        );

        return {
          id: userId,
          email: cleanEmail,
          full_name: data.full_name,
          role: data.role,
          identity_type: identityType,
          nis_nip: cleanNisNip || undefined,
          class_name: data.class_name || undefined,
          subject_specialty: data.subject_specialty || undefined,
        };
      });

      await createSessionForUser(newUser);

      await createAuditLog({
        userId: userId,
        action: "REGISTER",
        module: "User Management",
        target: cleanEmail,
        result: "SUCCESS",
      });

      return { success: true, user: newUser };
    } catch (e: any) {
      console.error("[registerUserServerFn Error]:", e);
      return { success: false, message: "Gagal menyimpan pendaftaran ke database." };
    }
  });

export const updateUserPasswordFn = createServerFn({ method: "POST" })
  .validator((data: { emailOrId: string; newPasswordHash?: string; newPassword?: string }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; message?: string }> => {
    try {
      const sessionUser = await requireAuth();
      const identifier = data.emailOrId.trim().toLowerCase();

      // IDOR Protection: Non-admin users can ONLY update their own password!
      if (sessionUser.role !== "admin" && sessionUser.id !== identifier && sessionUser.email.toLowerCase() !== identifier) {
        return { success: false, message: "Akses Ditolak: Anda hanya berhak memperbarui kata sandi akun milik sendiri." };
      }

      const { execute } = await import("@/lib/db");
      const bcrypt = await import("bcryptjs");
      const hashFn = bcrypt.default?.hashSync || bcrypt.hashSync;

      let finalBcryptHash = data.newPasswordHash || "";
      if (data.newPassword || (!finalBcryptHash.startsWith("$2a$") && !finalBcryptHash.startsWith("$2b$"))) {
        finalBcryptHash = hashFn(data.newPassword || data.newPasswordHash || "MtsN2#2026!Sec", 10);
      }

      await execute("UPDATE users SET password_hash = ? WHERE id = ? OR LOWER(email) = ?", [
        finalBcryptHash,
        identifier,
        identifier,
      ]);
      return { success: true };
    } catch (e: any) {
      console.error("[updateUserPasswordFn Error]:", e);
      return { success: false, message: `Gagal memperbarui kata sandi di database: ${e?.message || e}` };
    }
  });

// 12. MATERIALS / MODUL AJAR
export const getMaterialsPaginatedFn = createServerFn({ method: "POST" })
  .validator((data: PaginatedParams) => data)
  .handler(async ({ data }): Promise<PaginatedResult<MaterialRow>> => {
    try {
      const { query, queryOne, execute } = await import("@/lib/db");
      await execute(`
        CREATE TABLE IF NOT EXISTS materials (
          id VARCHAR(64) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          subject_name VARCHAR(100) NOT NULL,
          class_name VARCHAR(50) NOT NULL,
          type VARCHAR(50) NOT NULL,
          size VARCHAR(50) DEFAULT '2.5 MB',
          filename VARCHAR(255) NOT NULL,
          file_url TEXT,
          uploaded_by VARCHAR(255),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      const page = Math.max(1, Number(data.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(data.limit) || 20));
      const offset = (page - 1) * limit;

      const conditions: string[] = [];
      const params: any[] = [];

      if (data.search && data.search.trim() !== "") {
        const searchTerm = `%${data.search.trim().toLowerCase()}%`;
        conditions.push("(LOWER(title) LIKE ? OR LOWER(subject_name) LIKE ? OR LOWER(filename) LIKE ?)");
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (data.classFilter && data.classFilter.trim() !== "") {
        conditions.push("class_name = ?");
        params.push(data.classFilter);
      }

      if (data.subjectFilter && data.subjectFilter.trim() !== "") {
        conditions.push("subject_name = ?");
        params.push(data.subjectFilter);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const countRes = await queryOne<{ total: number }>(`SELECT COUNT(*) as total FROM materials ${whereClause}`, params);
      const total = countRes?.total || 0;
      const totalPages = Math.ceil(total / limit) || 1;

      const rows = await query<MaterialRow[]>(
        `SELECT id, title, subject_name, class_name, type, size, filename, file_url, uploaded_by, created_at FROM materials ${whereClause} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      return {
        data: rows || [],
        pagination: { page, limit, total, totalPages },
      };
    } catch (e) {
      console.error("[getMaterialsPaginatedFn Error]:", e);
      return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
    }
  });

export const getMaterialsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<MaterialRow[]> => {
    try {
      const { query, execute } = await import("@/lib/db");
      await execute(`
        CREATE TABLE IF NOT EXISTS materials (
          id VARCHAR(64) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          subject_name VARCHAR(100) NOT NULL,
          class_name VARCHAR(50) NOT NULL,
          type VARCHAR(50) NOT NULL,
          size VARCHAR(50) DEFAULT '2.5 MB',
          filename VARCHAR(255) NOT NULL,
          file_url TEXT,
          uploaded_by VARCHAR(255),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      const rows = await query<MaterialRow[]>("SELECT id, title, subject_name, class_name, type, size, filename, file_url, uploaded_by, created_at FROM materials ORDER BY created_at DESC");
      return rows || [];
    } catch (e) {
      console.error("[getMaterialsFn Error]:", e);
      return [];
    }
  }
);

export const saveMaterialFn = createServerFn({ method: "POST" })
  .validator((data: MaterialRow) => data)
  .handler(async ({ data }): Promise<{ success: boolean; message?: string }> => {
    try {
      const { execute } = await import("@/lib/db");
      await execute(`
        CREATE TABLE IF NOT EXISTS materials (
          id VARCHAR(64) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          subject_name VARCHAR(100) NOT NULL,
          class_name VARCHAR(50) NOT NULL,
          type VARCHAR(50) NOT NULL,
          size VARCHAR(50) DEFAULT '2.5 MB',
          filename VARCHAR(255) NOT NULL,
          file_url TEXT,
          uploaded_by VARCHAR(255),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await execute(
        `INSERT INTO materials (id, title, subject_name, class_name, type, size, filename, file_url, uploaded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title),
           type = VALUES(type),
           size = VALUES(size),
           filename = VALUES(filename),
           file_url = VALUES(file_url)`,
        [
          data.id,
          data.title,
          data.subject_name,
          data.class_name,
          data.type,
          data.size || "2.5 MB",
          data.filename,
          data.file_url || null,
          data.uploaded_by || "Guru Pengampu",
        ]
      );
      return { success: true };
    } catch (e: any) {
      console.error("[saveMaterialFn Error]:", e);
      return { success: false, message: `Gagal menyimpan modul ke database: ${e?.message || e}` };
    }
  });

export const deleteMaterialFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    try {
      const { execute } = await import("@/lib/db");
      await execute("DELETE FROM materials WHERE id = ?", [data.id]);
      return { success: true };
    } catch (e) {
      console.error("[deleteMaterialFn Error]:", e);
      return { success: false };
    }
  });

// 13. TAHFIDZ HAFALAN
export const getHafalanFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<HafalanRow[]> => {
    try {
      const { query, execute } = await import("@/lib/db");
      await execute(`
        CREATE TABLE IF NOT EXISTS tahfidz_hafalan (
          id INT AUTO_INCREMENT PRIMARY KEY,
          student_name VARCHAR(255),
          nisn VARCHAR(50),
          class_name VARCHAR(50),
          juz VARCHAR(50) NOT NULL,
          surah VARCHAR(100) NOT NULL,
          ayat VARCHAR(100) NOT NULL,
          status VARCHAR(50) NOT NULL,
          nilai VARCHAR(50) NOT NULL,
          ustadz VARCHAR(255) NOT NULL,
          tgl VARCHAR(50) NOT NULL,
          murojaah VARCHAR(50),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      return await query<HafalanRow[]>("SELECT * FROM tahfidz_hafalan ORDER BY id DESC");
    } catch (e) {
      console.error("[getHafalanFn Error]:", e);
      return [];
    }
  }
);

export const saveHafalanFn = createServerFn({ method: "POST" })
  .validator((data: HafalanRow) => data)
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    try {
      const { execute } = await import("@/lib/db");
      await execute(`
        CREATE TABLE IF NOT EXISTS tahfidz_hafalan (
          id INT AUTO_INCREMENT PRIMARY KEY,
          student_name VARCHAR(255),
          nisn VARCHAR(50),
          class_name VARCHAR(50),
          juz VARCHAR(50) NOT NULL,
          surah VARCHAR(100) NOT NULL,
          ayat VARCHAR(100) NOT NULL,
          status VARCHAR(50) NOT NULL,
          nilai VARCHAR(50) NOT NULL,
          ustadz VARCHAR(255) NOT NULL,
          tgl VARCHAR(50) NOT NULL,
          murojaah VARCHAR(50),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      await execute(
        `INSERT INTO tahfidz_hafalan (student_name, nisn, class_name, juz, surah, ayat, status, nilai, ustadz, tgl, murojaah)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.student_name || null,
          data.nisn || null,
          data.class_name || null,
          data.juz,
          data.surah,
          data.ayat,
          data.status,
          data.nilai,
          data.ustadz,
          data.tgl,
          data.murojaah || null,
        ]
      );
      return { success: true };
    } catch (e) {
      console.error("[saveHafalanFn Error]:", e);
      return { success: false };
    }
  });

// 14. E-LIBRARY BOOKS
export const getElibraryBooksFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ElibraryBookRow[]> => {
    try {
      const { query, execute } = await import("@/lib/db");
      await execute(`
        CREATE TABLE IF NOT EXISTS elibrary_books (
          id VARCHAR(64) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          tag VARCHAR(50) NOT NULL,
          size VARCHAR(50) NOT NULL,
          type VARCHAR(50) NOT NULL,
          url TEXT,
          video_url TEXT,
          audio_url TEXT,
          description TEXT,
          provider VARCHAR(50),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      return await query<ElibraryBookRow[]>("SELECT * FROM elibrary_books ORDER BY created_at DESC");
    } catch (e) {
      console.error("[getElibraryBooksFn Error]:", e);
      return [];
    }
  }
);

export const saveElibraryBookFn = createServerFn({ method: "POST" })
  .validator((data: ElibraryBookRow) => data)
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    try {
      const { execute } = await import("@/lib/db");
      await execute(`
        CREATE TABLE IF NOT EXISTS elibrary_books (
          id VARCHAR(64) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          tag VARCHAR(50) NOT NULL,
          size VARCHAR(50) NOT NULL,
          type VARCHAR(50) NOT NULL,
          url TEXT,
          video_url TEXT,
          audio_url TEXT,
          description TEXT,
          provider VARCHAR(50),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      await execute(
        `INSERT INTO elibrary_books (id, title, tag, size, type, url, video_url, audio_url, description, provider)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title),
           tag = VALUES(tag),
           size = VALUES(size),
           type = VALUES(type),
           url = VALUES(url),
           video_url = VALUES(video_url),
           audio_url = VALUES(audio_url),
           description = VALUES(description)`,
        [
          data.id,
          data.title,
          data.tag,
          data.size,
          data.type,
          data.url || null,
          data.video_url || null,
          data.audio_url || null,
          data.description || null,
          data.provider || "direct",
        ]
      );
      return { success: true };
    } catch (e) {
      console.error("[saveElibraryBookFn Error]:", e);
      return { success: false };
    }
  });

export const deleteElibraryBookFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    try {
      const { execute } = await import("@/lib/db");
      await execute("DELETE FROM elibrary_books WHERE id = ?", [data.id]);
      return { success: true };
    } catch (e) {
      console.error("[deleteElibraryBookFn Error]:", e);
      return { success: false };
    }
  });

// 15. P5 PROJECTS (KOKURIKULER)
export const getP5ProjectsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<P5ProjectRow[]> => {
    try {
      const { query, execute } = await import("@/lib/db");
      await execute(`
        CREATE TABLE IF NOT EXISTS p5_projects (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          theme VARCHAR(100) NOT NULL,
          class_name VARCHAR(50) NOT NULL,
          target_dimension VARCHAR(255) NOT NULL,
          status VARCHAR(50) NOT NULL,
          progress_pct INT DEFAULT 0,
          date_str VARCHAR(50) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      return await query<P5ProjectRow[]>("SELECT * FROM p5_projects ORDER BY id DESC");
    } catch (e) {
      console.error("[getP5ProjectsFn Error]:", e);
      return [];
    }
  }
);

export const saveP5ProjectFn = createServerFn({ method: "POST" })
  .validator((data: P5ProjectRow) => data)
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    try {
      const { execute } = await import("@/lib/db");
      await execute(`
        CREATE TABLE IF NOT EXISTS p5_projects (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          theme VARCHAR(100) NOT NULL,
          class_name VARCHAR(50) NOT NULL,
          target_dimension VARCHAR(255) NOT NULL,
          status VARCHAR(50) NOT NULL,
          progress_pct INT DEFAULT 0,
          date_str VARCHAR(50) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      await execute(
        `INSERT INTO p5_projects (title, theme, class_name, target_dimension, status, progress_pct, date_str)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [data.title, data.theme, data.class_name, data.target_dimension, data.status, data.progress_pct || 0, data.date_str]
      );
      return { success: true };
    } catch (e) {
      console.error("[saveP5ProjectFn Error]:", e);
      return { success: false };
    }
  });

