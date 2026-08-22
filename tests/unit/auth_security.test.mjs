import assert from "node:assert";
import { checkRateLimit } from "../../src/lib/rateLimit.ts";
import { sanitizeLogData, generateRequestId } from "../../src/lib/logger.ts";

export async function runAuthSecurityTests() {
  console.log("👉 [TEST] Running Auth & Security Unit Tests...");

  // 1. Test Request ID Generation
  const reqId = generateRequestId();
  assert.strictEqual(typeof reqId, "string", "RequestId should be string");
  assert.ok(reqId.startsWith("REQ-"), "RequestId should start with REQ-");
  assert.strictEqual(reqId.length, 10, "RequestId format should be REQ-XXXXXX");

  // 2. Test Rate Limiting
  const testKey = `test_rate_${Date.now()}`;
  for (let i = 1; i <= 5; i++) {
    const res = checkRateLimit(testKey, 5, 60000);
    assert.strictEqual(res.allowed, true, `Attempt ${i} should be allowed`);
  }
  const blockedRes = checkRateLimit(testKey, 5, 60000);
  assert.strictEqual(blockedRes.allowed, false, "6th attempt should be blocked by rate limiter");
  assert.strictEqual(blockedRes.remaining, 0, "Remaining attempts should be 0");

  // 3. Test Sensitive Log Data Redaction
  const dirtyLog = {
    userId: "usr-123",
    email: "user@mtsn2.sch.id",
    password: "SuperSecretPassword123!",
    nested: {
      lms_session: "sess-abc-xyz",
      token: "jwt-token-secret",
      role: "guru",
    },
  };
  const cleanLog = sanitizeLogData(dirtyLog);
  assert.strictEqual(cleanLog.password, "[REDACTED]", "Password should be redacted");
  assert.strictEqual(cleanLog.nested.lms_session, "[REDACTED]", "Session cookie should be redacted");
  assert.strictEqual(cleanLog.nested.token, "[REDACTED]", "Token should be redacted");
  assert.strictEqual(cleanLog.userId, "usr-123", "User ID should remain untouched");
  assert.strictEqual(cleanLog.nested.role, "guru", "Role should remain untouched");

  console.log("✅ [PASS] Auth & Security Unit Tests Passed!");
}
