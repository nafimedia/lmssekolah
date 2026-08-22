import assert from "node:assert";

export function calculatePaginationOffset(pageInput, limitInput, totalCount) {
  const page = Math.max(1, Number(pageInput) || 1);
  const limit = Math.min(100, Math.max(1, Number(limitInput) || 20));
  const offset = (page - 1) * limit;
  const totalPages = Math.ceil(totalCount / limit) || 1;

  return { page, limit, offset, totalPages };
}

export async function runPaginationTests() {
  console.log("👉 [TEST] Running Pagination & Query Math Unit Tests...");

  // 1. Normal Pagination Calculation
  const p1 = calculatePaginationOffset(1, 20, 95);
  assert.strictEqual(p1.offset, 0, "Page 1 offset should be 0");
  assert.strictEqual(p1.totalPages, 5, "95 items with limit 20 should be 5 total pages");

  // 2. Limit Clamping (max 100)
  const p2 = calculatePaginationOffset(1, 500, 1000);
  assert.strictEqual(p2.limit, 100, "Limit should be clamped to maximum 100");

  // 3. Negative / Zero Page Clamping
  const p3 = calculatePaginationOffset(-5, 10, 50);
  assert.strictEqual(p3.page, 1, "Negative page should be clamped to 1");

  console.log("✅ [PASS] Pagination & Query Math Unit Tests Passed!");
}
