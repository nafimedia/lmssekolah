export interface FileValidationOptions {
  maxSizeMb?: number;
  allowedExtensions?: string[];
  allowedMimeTypes?: string[];
}

export function sanitizeFilename(filename: string): string {
  // Strip path traversal sequences like ../ or ..\
  const clean = filename.replace(/^.*[\\/]/, "");
  // Replace dangerous characters
  return clean.replace(/[^a-zA-Z0-9_.-]/g, "_");
}

export function validateUploadedFile(
  filename: string,
  fileSizeByte: number,
  mimeType?: string,
  options: FileValidationOptions = {}
): { valid: boolean; error?: string; cleanFilename?: string } {
  const maxSizeMb = options.maxSizeMb || 50; // default 50MB
  const maxSizeBytes = maxSizeMb * 1024 * 1024;

  if (fileSizeByte > maxSizeBytes) {
    return {
      valid: false,
      error: `Ukuran file melebihi batas maksimal (${maxSizeMb} MB).`,
    };
  }

  const cleanName = sanitizeFilename(filename);
  const extMatch = cleanName.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : "";

  // Dangerous script extensions check
  const DANGEROUS_EXT = ["php", "exe", "sh", "bat", "cmd", "js", "vbs", "jar", "phtml"];
  if (DANGEROUS_EXT.includes(ext)) {
    return {
      valid: false,
      error: `Format berkas .${ext} tidak diizinkan demi keamanan server.`,
    };
  }

  if (options.allowedExtensions && options.allowedExtensions.length > 0) {
    if (!options.allowedExtensions.includes(ext)) {
      return {
        valid: false,
        error: `Format berkas .${ext} tidak sesuai. Hanya mendukung: ${options.allowedExtensions.join(", ")}.`,
      };
    }
  }

  return {
    valid: true,
    cleanFilename: cleanName,
  };
}
