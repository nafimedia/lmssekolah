export type LogLevel = "INFO" | "WARN" | "ERROR" | "AUDIT";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  requestId: string;
  userId?: string;
  route?: string;
  method?: string;
  errorCode?: string;
  message: string;
  durationMs?: number;
  data?: any;
}

// Generate unique short request correlation ID (e.g. "REQ-8F92C1")
export function generateRequestId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `REQ-${id}`;
}

// Sanitize sensitive fields from log objects
export function sanitizeLogData(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  const SENSITIVE_KEYS = ["password", "password_hash", "newPassword", "token", "secret", "cookie", "lms_session", "authorization"];
  const sanitized: any = Array.isArray(obj) ? [] : {};

  for (const key of Object.keys(obj)) {
    if (SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitized[key] = sanitizeLogData(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }

  return sanitized;
}

export function logEvent(entry: LogEntry): void {
  const sanitizedData = entry.data ? sanitizeLogData(entry.data) : undefined;
  const payload = {
    ...entry,
    data: sanitizedData,
    timestamp: entry.timestamp || new Date().toISOString(),
  };

  const formattedStr = `[${payload.timestamp}] [${payload.level}] [${payload.requestId}] ${payload.message} ${
    payload.errorCode ? `(Code: ${payload.errorCode})` : ""
  }`;

  switch (payload.level) {
    case "ERROR":
      console.error(formattedStr, payload.data || "");
      break;
    case "WARN":
      console.warn(formattedStr, payload.data || "");
      break;
    case "AUDIT":
      console.info(`[AUDIT] ${formattedStr}`, payload.data || "");
      break;
    default:
      console.log(formattedStr, payload.data || "");
      break;
  }
}

// Audit logger for recording critical user activities into MySQL audit_logs table
export async function createAuditLog(params: {
  userId: string;
  action: string;
  module: string;
  target?: string;
  result: "SUCCESS" | "FAILED";
  details?: string;
}): Promise<void> {
  try {
    const { execute } = await import("@/lib/db");
    await execute(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        action VARCHAR(100) NOT NULL,
        module VARCHAR(100) NOT NULL,
        target VARCHAR(255),
        result VARCHAR(20) NOT NULL,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_module (module),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const logId = `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await execute(
      `INSERT INTO audit_logs (id, user_id, action, module, target, result, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [logId, params.userId, params.action, params.module, params.target || null, params.result, params.details || null]
    );

    logEvent({
      timestamp: new Date().toISOString(),
      level: "AUDIT",
      requestId: generateRequestId(),
      userId: params.userId,
      message: `Audit: ${params.action} on ${params.module} (${params.target || "N/A"}) - ${params.result}`,
    });
  } catch (e) {
    console.warn("[createAuditLog failed]:", e);
  }
}
