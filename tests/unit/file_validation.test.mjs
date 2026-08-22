import assert from "node:assert";
import { validateUploadedFile, sanitizeFilename } from "../../src/lib/fileValidation.ts";

export async function runFileValidationTests() {
  console.log("👉 [TEST] Running File Upload & Security Validation Tests...");

  // 1. Test Path Traversal Protection
  const dirtyFilename = "../../../var/www/shell.php";
  const cleanName = sanitizeFilename(dirtyFilename);
  assert.strictEqual(cleanName, "shell.php", "Path traversal prefixes should be stripped");

  // 2. Test Dangerous Executable Blocking
  const exeValidation = validateUploadedFile("malware.exe", 1024);
  assert.strictEqual(exeValidation.valid, false, ".exe files should be rejected");

  const phpValidation = validateUploadedFile("../script.php", 1024);
  assert.strictEqual(phpValidation.valid, false, ".php files should be rejected");

  // 3. Test Valid File Upload (PDF / Image)
  const pdfValidation = validateUploadedFile("Modul_Ajar_Matematika_VII.pdf", 5 * 1024 * 1024);
  assert.strictEqual(pdfValidation.valid, true, "Valid PDF should be accepted");

  // 4. Test Oversized File Rejection (> 50MB)
  const oversizedValidation = validateUploadedFile("Video_Praktikum.mp4", 100 * 1024 * 1024, "video/mp4", { maxSizeMb: 50 });
  assert.strictEqual(oversizedValidation.valid, false, "Files larger than 50MB should be rejected");

  console.log("✅ [PASS] File Upload & Security Validation Tests Passed!");
}
