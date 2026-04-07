// lib/server/Quotes/quotes-server-queries.ts
//
// ARSITEKTUR:
//   - QuotesListFilters sekarang pakai `category?: Category[]` (array) → multi-select
//   - Filter dilakukan client-side setelah fetch semua data
//   - queryKey mengandung filters → TanStack otomatis re-fetch saat filter berubah
//   - staleTime 5 menit → data di-cache, switch filter tidak re-fetch ke network
//     selama cache masih fresh (hanya re-compute filter dari cache)

import { queryOptions } from '@tanstack/react-query';
import { fetchAllQuotes, fetchQuoteById } from './quotes-server';
import { Quote } from '@/type/quotes-type';

// ─── Filter shape ─────────────────────────────────────────────────────────────
// `category` adalah array agar mendukung multi-select:
//   []            → tidak ada filter aktif → tampilkan semua
//   ['pagi']      → hanya pagi
//   ['pagi','solat'] → pagi DAN solat (union, bukan intersection)
export type QuotesListFilters = {
  search?: string;
};

// ─── Query Keys ───────────────────────────────────────────────────────────────
// Key mengandung filters object → setiap kombinasi filter punya cache entry sendiri
// Ini memungkinkan instant switching antar filter kombinasi yang sudah pernah di-fetch
export const QuotesKeys = {
  all: ['Quotes'] as const,
  lists: () => [...QuotesKeys.all, 'list'] as const,

  // Normalisasi key: sort category array agar ['pagi','solat'] === ['solat','pagi']
  // Ini mencegah cache miss akibat urutan filter yang berbeda
  list: (filters?: QuotesListFilters) => {
    const normalizedFilters = filters
      ? {
          ...filters,
        }
      : {};
    return [...QuotesKeys.lists(), normalizedFilters] as const;
  },

  detail: (id: number) => [...QuotesKeys.all, 'detail', id] as const,
};

// ─── List Query Options ───────────────────────────────────────────────────────
// Reusable di seluruh app: cukup pass `filters` yang berbeda
// TanStack Query handle dedup + caching otomatis berdasarkan queryKey
export function QuotesListQueryOptions(filters?: QuotesListFilters & { base_url: string }) {
  return queryOptions({
    queryKey: QuotesKeys.list(filters),

    queryFn: async (): Promise<Quote[]> => {
      // Fetch semua data sekali → di-cache oleh TanStack
      // Filter dilakukan in-memory → switch filter = instant, tanpa network call
      const all = await fetchAllQuotes();
      if (!filters) return all;

      const q = filters.search?.trim().toLowerCase() ?? '';

      // `category` kosong atau undefined → tampilkan semua (no type filter)

      return all.filter((item) => {
        // Search filter: match arab atau terjemahan indo
        const matchSearch =
          !q || item.author.toLowerCase().includes(q) || item.quote.toLowerCase().includes(q);

        // Category filter: item.type harus ada di dalam array category yang dipilih
        // Jika tidak ada filter type → semua lolos

        return matchSearch;
      });
    },

    // Data dianggap fresh selama 5 menit → switch filter tidak trigger network call
    // jika data root ('Quotes','list',{}) masih di cache
    staleTime: 5 * 60 * 1000,

    // Data tetap di memory 30 menit sejak terakhir digunakan
    gcTime: 30 * 60 * 1000,

    retry: 1,
  });
}

export function quoteByIdQueryOptions(id: number) {
  return queryOptions({
    queryKey: QuotesKeys.detail(id),
    queryFn: async () => {
      const raw = await fetchQuoteById(id);
      return raw;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!id && !isNaN(id),
    retry: 1,
  });
}
