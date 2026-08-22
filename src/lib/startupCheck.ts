// Environment & Startup Configuration Validator for Production Readiness

export interface SystemCheckReport {
  status: "OK" | "WARNING" | "CRITICAL";
  environment: string;
  missingVariables: string[];
  warnings: string[];
  databaseConfigured: boolean;
}

export function validateStartupEnvironment(): SystemCheckReport {
  const isProd = process.env.NODE_ENV === "production";
  const missingVars: string[] = [];
  const warnings: string[] = [];

  const RECOMMENDED_VARS = [
    "DATABASE_HOST",
    "DATABASE_USER",
    "DATABASE_NAME",
    "LMS_SESSION_SECRET",
  ];

  for (const v of RECOMMENDED_VARS) {
    if (!process.env[v]) {
      if (isProd) {
        missingVars.push(v);
      } else {
        warnings.push(`Variable ${v} belum diatur di .env (menggunakan default fallback).`);
      }
    }
  }

  const status = missingVars.length > 0 ? "CRITICAL" : warnings.length > 0 ? "WARNING" : "OK";

  if (status === "CRITICAL") {
    console.error(`[CRITICAL STARTUP ERROR] Environment variable wajib belum diatur: ${missingVars.join(", ")}`);
  }

  return {
    status,
    environment: process.env.NODE_ENV || "development",
    missingVariables: missingVars,
    warnings,
    databaseConfigured: Boolean(process.env.DATABASE_HOST || "localhost"),
  };
}
