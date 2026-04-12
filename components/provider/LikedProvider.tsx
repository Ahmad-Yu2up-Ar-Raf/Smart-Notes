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
  toggleLike: (quote: Quote) => void; // ⚡ INSTANT FEEDBACK - Fire & Forget!
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
   * ✅ TOGGLE LIKE - BEST PRACTICE FOR INSTANT FEEDBACK
   *
   * This is the KEY function for instant heart ❤️ button feedback!
   *
   * How it works:
   * 1. Instantly check if already liked (0ms)
   * 2. Immediately update UI (optimistic) (0ms)
   * 3. Fire storage sync in background (non-blocking)
   * 4. Auto-rollback on error
   *
   * NO AWAITING = NO DELAY! User sees heart change instantly ⚡
   */
  const toggleLike = useCallback(
    (quote: Quote) => {
      // ✅ STEP 1: Check current state (instant, from memory)
      const hasLiked = items.some((item) => item.quote.id === quote.id);

      // ✅ STEP 2: Update UI immediately (optimistic)
      startTransition(() => {
        if (hasLiked) {
          // ❌ Remove from liked
          const updatedItems = items.filter((item) => item.quote.id !== quote.id);
          setItems(updatedItems);
          setCount(updatedItems.reduce((sum, item) => sum + item.quantity, 0));
        } else {
          // ✅ Add to liked
          const updatedItems = [...items, { quote, quantity: 1 }];
          setItems(updatedItems);
          setCount(updatedItems.reduce((sum, item) => sum + item.quantity, 0));
        }
      });

      // ✅ STEP 3: Sync to storage IN BACKGROUND (fire & forget!)
      // This runs AFTER UI is updated, doesn't block heart button
      requestAnimationFrame(async () => {
        try {
          console.log('⚡ Optimistic update complete, syncing to storage...');
          if (hasLiked) {
            await removeFromLiked(quote.id);
            console.log('✅ Removed from storage');
          } else {
            await addToLiked(quote, 1);
            console.log('✅ Added to storage');
          }
        } catch (error) {
          console.error('❌ Storage sync failed:', error);

          // ↩️ STEP 4: Rollback if error
          try {
            console.log('↩️ Rolling back to storage state...');
            const freshLiked = await getLiked();
            const freshCount = await getLikedCount();
            setItems(freshLiked);
            setCount(freshCount);
            console.log('✅ Rollback complete');
          } catch (rollbackError) {
            console.error('❌ Rollback failed:', rollbackError);
          }
        }
      });
    },
    [items]
  );

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
    toggleLike, // ⚡ NEW: Fire & Forget for instant feedback
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
