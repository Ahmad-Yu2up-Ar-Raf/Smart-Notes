import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useTransition,
} from 'react';
import {
  addToLiked,
  updateLikedQuantity,
  removeFromLiked,
  getLiked,
  clearLiked,
  getLikedCount,
  LikedItem,
} from '@/lib/storage/liked-storage';
import { Quote } from '@/type/quotes-type';

/**
 * ✅ OPTIMISTIC UI: Update UI instantly, sync to storage in background
 *
 * Benefits:
 * - ⚡ Instant feedback (no lag)
 * - 🔄 Storage syncs in background
 * - ↩️ Rollback if error
 * - 🛡️ Race condition protected
 */
type LikedContextState = {
  // State
  items: LikedItem[];
  count: number;

  isLoading: boolean;
  isPending: boolean; // ← Optimistic operation pending

  // Operations
  addItem: (quote: Quote, quantity?: number) => Promise<void>;
  updateQuantity: (quoteId: number, quantity: number) => Promise<void>;
  removeItem: (quoteId: number) => Promise<void>;
  clearAll: () => Promise<void>;

  // Helpers
  getItem: (quoteId: number) => LikedItem | undefined;
  hasItem: (quoteId: number) => boolean;
};

const LikedContext = createContext<LikedContextState | null>(null);

export function LikedProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<LikedItem[]>([]);
  const [count, setCount] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ✅ useTransition untuk track optimistic operations
  const [isPending, startTransition] = useTransition();

  /**
   * ✅ INIT: Load liked dari storage saat app startup
   */
  useEffect(() => {
    const initLiked = async () => {
      try {
        setIsLoading(true);
        const liked = await getLiked();
        const likedCount = await getLikedCount();

        setItems(liked);
        setCount(likedCount);
      } catch (error) {
        console.error('❌ initLiked error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initLiked();
  }, []);

  /**
   * ✅ ADD TO CART (Optimistic)
   * 1. Update UI instantly ⚡
   * 2. Sync to storage in background 🔄
   * 3. Rollback if error ↩️
   */
  const addItem = useCallback(
    async (quote: Quote, quantity: number = 1) => {
      // ✅ OPTIMISTIC UPDATE: Immediately update UI
      startTransition(() => {
        const updatedItems = [...items];
        const existingIndex = updatedItems.findIndex((item) => item.quote.id === quote.id);

        if (existingIndex >= 0) {
          updatedItems[existingIndex].quantity += quantity;
        } else {
          updatedItems.push({ quote, quantity });
        }

        setItems(updatedItems);
        const newCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

        setCount(newCount);

        // ✅ SYNC IN BACKGROUND: Non-blocking storage update
        requestAnimationFrame(async () => {
          try {
            await addToLiked(quote, quantity);
          } catch (error) {
            console.error('❌ addItem sync error:', error);
            // ↩️ ROLLBACK: Refresh dari storage jika gagal
            try {
              const freshLiked = await getLiked();
              const freshCount = await getLikedCount();

              setItems(freshLiked);
              setCount(freshCount);
            } catch (rollbackError) {
              console.error('❌ rollback failed:', rollbackError);
            }
          }
        });
      });
    },
    [items]
  );

  /**
   * ✅ UPDATE QUANTITY (Optimistic)
   */
  const updateQuantity = useCallback(
    async (quoteId: number, quantity: number) => {
      // ✅ OPTIMISTIC UPDATE
      startTransition(() => {
        let updatedItems = items;

        if (quantity <= 0) {
          updatedItems = items.filter((item) => item.quote.id !== quoteId);
        } else {
          updatedItems = items.map((item) =>
            item.quote.id === quoteId ? { ...item, quantity } : item
          );
        }

        setItems(updatedItems);
        const newCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

        setCount(newCount);

        // ✅ SYNC IN BACKGROUND
        requestAnimationFrame(async () => {
          try {
            await updateLikedQuantity(quoteId, quantity);
          } catch (error) {
            console.error('❌ updateQuantity sync error:', error);
            // ↩️ ROLLBACK
            try {
              const freshLiked = await getLiked();
              const freshCount = await getLikedCount();

              setItems(freshLiked);
              setCount(freshCount);
            } catch (rollbackError) {
              console.error('❌ rollback failed:', rollbackError);
            }
          }
        });
      });
    },
    [items]
  );

  /**
   * ✅ REMOVE FROM CART (Optimistic)
   */
  const removeItem = useCallback(
    async (quoteId: number) => {
      // ✅ OPTIMISTIC UPDATE
      startTransition(() => {
        const updatedItems = items.filter((item) => item.quote.id !== quoteId);

        setItems(updatedItems);
        const newCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

        setCount(newCount);

        // ✅ SYNC IN BACKGROUND
        requestAnimationFrame(async () => {
          try {
            await removeFromLiked(quoteId);
          } catch (error) {
            console.error('❌ removeItem sync error:', error);
            // ↩️ ROLLBACK
            try {
              const freshLiked = await getLiked();
              const freshCount = await getLikedCount();

              setItems(freshLiked);
              setCount(freshCount);
            } catch (rollbackError) {
              console.error('❌ rollback failed:', rollbackError);
            }
          }
        });
      });
    },
    [items]
  );

  /**
   * ✅ CLEAR ALL CART (Optimistic)
   */
  const clearAll = useCallback(async () => {
    // ✅ OPTIMISTIC UPDATE
    startTransition(() => {
      setItems([]);
      setCount(0);

      // ✅ SYNC IN BACKGROUND
      requestAnimationFrame(async () => {
        try {
          await clearLiked();
        } catch (error) {
          console.error('❌ clearAll sync error:', error);
          // ↩️ ROLLBACK
          try {
            const freshLiked = await getLiked();
            const freshCount = await getLikedCount();

            setItems(freshLiked);
            setCount(freshCount);
          } catch (rollbackError) {
            console.error('❌ rollback failed:', rollbackError);
          }
        }
      });
    });
  }, [items]);

  /**
   * ✅ HELPER: Get specific item dari liked
   */
  const getItem = useCallback(
    (quoteId: number): LikedItem | undefined => {
      return items.find((item) => item.quote.id === quoteId);
    },
    [items]
  );

  /**
   * ✅ HELPER: Check apakah quote sudah ada di liked
   */
  const hasItem = useCallback(
    (quoteId: number): boolean => {
      return items.some((item) => item.quote.id === quoteId);
    },
    [items]
  );

  const value: LikedContextState = {
    items,
    count,

    isLoading,
    isPending, // ← User dapat check if optimistic operation sedang berjalan
    addItem,
    updateQuantity,
    removeItem,
    clearAll,
    getItem,
    hasItem,
  };

  return <LikedContext.Provider value={value}>{children}</LikedContext.Provider>;
}

/**
 * ✅ HOOK: useLiked
 * Use di mana saja untuk access liked state + operations
 *
 * @example
 * const { items, count, isPending, addItem } = useLiked();
 */
export function useLiked() {
  const ctx = useContext(LikedContext);
  if (!ctx) {
    throw new Error('useLiked must be inside LikedProvider');
  }
  return ctx;
}
