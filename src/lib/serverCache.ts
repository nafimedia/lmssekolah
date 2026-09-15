// In-memory Server-side Cache for High-Concurrency LMS Workloads
// Caches repeated read queries with TTL and instant invalidation on mutation

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

declare global {
  var __lmsServerCache: Map<string, CacheEntry<any>> | undefined;
}

if (!globalThis.__lmsServerCache) {
  globalThis.__lmsServerCache = new Map<string, CacheEntry<any>>();
}

const cacheStore = globalThis.__lmsServerCache;
const inFlightPromises = new Map<string, Promise<any>>();

export const ServerCache = {
  /**
   * Mengambil data dari cache jika valid, atau mengeksekusi fetcherFn dan menyimpan ke cache.
   * Dilengkapi in-flight request deduplication untuk mencegah Cache Stampede saat akses serentak.
   * @param key Identifikasi unik cache (misal: 'master_mapel_list')
   * @param fetcherFn Fungsi async yang mengambil data langsung dari MySQL
   * @param ttlMs Waktu hidup cache dalam milidetik (default: 30 detik)
   */
  async getOrSet<T>(key: string, fetcherFn: () => Promise<T>, ttlMs: number = 30000): Promise<T> {
    const now = Date.now();
    const entry = cacheStore.get(key);

    if (entry && entry.expiresAt > now) {
      return entry.data as T;
    }

    // In-flight deduplication: Jika query yang sama sedang berjalan, tunggu hasilnya bersamaan
    if (inFlightPromises.has(key)) {
      return await inFlightPromises.get(key)!;
    }

    const promise = (async () => {
      try {
        const freshData = await fetcherFn();
        cacheStore.set(key, {
          data: freshData,
          expiresAt: Date.now() + ttlMs,
        });
        return freshData;
      } finally {
        inFlightPromises.delete(key);
      }
    })();

    inFlightPromises.set(key, promise);
    return await promise;
  },

  /**
   * Menghapus cache berdasarkan kecocokan string atau prefix.
   * @param prefixPattern String awal atau pola key yang ingin dihapus (misal: 'master_mapel', 'schedule_')
   */
  invalidate(prefixPattern: string): void {
    for (const key of cacheStore.keys()) {
      if (key.startsWith(prefixPattern) || key.includes(prefixPattern)) {
        cacheStore.delete(key);
      }
    }
  },

  /**
   * Membersihkan seluruh cache yang tersimpan.
   */
  clear(): void {
    cacheStore.clear();
  },

  /**
   * Mengambil informasi ukuran cache saat ini (untuk pemantauan/diagnostik).
   */
  size(): number {
    return cacheStore.size;
  }
};
