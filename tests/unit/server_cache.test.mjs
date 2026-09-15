import assert from "node:assert/strict";
import { ServerCache } from "../../src/lib/serverCache.ts";

export async function runServerCacheTests() {
  console.log("👉 [TEST] Running Server In-Memory Cache Unit Tests...");

  ServerCache.clear();

  let fetchCount = 0;
  const mockFetcher = async () => {
    fetchCount++;
    return [{ id: 1, name: "Matematika" }, { id: 2, name: "Bahasa Indonesia" }];
  };

  // 1. First fetch - hits fetcher
  const res1 = await ServerCache.getOrSet("test_mapel", mockFetcher, 5000);
  assert.equal(fetchCount, 1, "Fetcher harus dipanggil 1 kali pada pemanggilan pertama");
  assert.equal(res1.length, 2);

  // 2. Second fetch - hits memory cache directly (fetcher not called)
  const res2 = await ServerCache.getOrSet("test_mapel", mockFetcher, 5000);
  assert.equal(fetchCount, 1, "Fetcher TIDAK BOLEH dipanggil lagi jika cache masih valid");
  assert.deepEqual(res1, res2);

  // 3. Invalidation test - purge cache on mutation
  ServerCache.invalidate("test_mapel");
  assert.equal(ServerCache.size(), 0, "Cache harus kosong setelah invalidation");

  // 4. Third fetch after invalidation - hits fetcher again
  const res3 = await ServerCache.getOrSet("test_mapel", mockFetcher, 5000);
  assert.equal(fetchCount, 2, "Fetcher harus dipanggil kembali setelah cache di-invalidate");
  assert.equal(res3.length, 2);

  // Cleanup
  ServerCache.clear();

  console.log("✅ [PASS] Server In-Memory Cache Unit Tests Passed!");
}
