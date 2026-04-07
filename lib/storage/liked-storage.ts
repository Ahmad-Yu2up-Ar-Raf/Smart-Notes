import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quote } from '@/type/quotes-type';

const CART_KEY = 'TESATE_CART';

/**
 * LikedItem: Quote dengan quantity
 * Jika user add quote yang sama 2x, quantity = 2 (bukan 2 liked items)
 */
export interface LikedItem {
  quote: Quote;
  quantity: number;
}

/**
 * ✅ MUTEX LOCK untuk prevent race condition
 * Jika user click "Add" 3x cepat-cepat, hanya eksekusi sequential, bukan parallel
 * Generic: support any return type (void, LikedItem[], etc)
 */
let isProcessing = false;
const processingQueue: Array<() => Promise<any>> = [];

async function executeWithLock<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise((resolve) => {
    processingQueue.push(async () => {
      const result = await fn();
      resolve(result);
    });

    if (!isProcessing) {
      processQueue();
    }
  });
}

async function processQueue(): Promise<void> {
  if (processingQueue.length === 0 || isProcessing) return;

  isProcessing = true;
  while (processingQueue.length > 0) {
    const fn = processingQueue.shift();
    if (fn) {
      try {
        await fn();
      } catch (error) {
        console.error('❌ Queue processing error:', error);
      }
    }
  }
  isProcessing = false;
}

/**
 * ✅ UPSERT LOGIC: Handle quote duplikasi
 * - Jika quote sudah ada di liked → increment quantity
 * - Jika quote baru → add ke liked dengan quantity 1
 * - Sequential execution: protect dari race condition
 */
export async function addToLiked(quote: Quote, quantity: number = 1): Promise<LikedItem[]> {
  return executeWithLock(async () => {
    try {
      const liked = await getLiked();

      // Cari apakah quote sudah ada
      const existingIndex = liked.findIndex((item) => item.quote.id === quote.id);

      if (existingIndex >= 0) {
        // ✅ Quote sudah ada → increment quantity
        liked[existingIndex].quantity += quantity;
      } else {
        // ✅ Quote baru → add ke liked
        liked.push({ quote, quantity });
      }

      await saveLiked(liked);
      return liked;
    } catch (error) {
      console.error('❌ addToLiked error:', error);
      throw error;
    }
  });
}

/**
 * ✅ UPDATE QUANTITY: Set quantity ke value tertentu
 * - Jika quantity <= 0 → remove dari liked
 */
export async function updateLikedQuantity(quoteId: number, quantity: number): Promise<LikedItem[]> {
  return executeWithLock(async () => {
    try {
      let liked = await getLiked();

      if (quantity <= 0) {
        // Hapus dari liked
        liked = liked.filter((item) => item.quote.id !== quoteId);
      } else {
        // Update quantity
        const item = liked.find((item) => item.quote.id === quoteId);
        if (item) {
          item.quantity = quantity;
        }
      }

      await saveLiked(liked);
      return liked;
    } catch (error) {
      console.error('❌ updateLikedQuantity error:', error);
      throw error;
    }
  });
}

/**
 * ✅ REMOVE DARI CART
 */
export async function removeFromLiked(quoteId: number): Promise<LikedItem[]> {
  return executeWithLock(async () => {
    try {
      const liked = await getLiked();
      const filtered = liked.filter((item) => item.quote.id !== quoteId);
      await saveLiked(filtered);
      return filtered;
    } catch (error) {
      console.error('❌ removeFromLiked error:', error);
      throw error;
    }
  });
}

/**
 * ✅ GET CART: Retrieve semua items
 */
export async function getLiked(): Promise<LikedItem[]> {
  try {
    const data = await AsyncStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('❌ getLiked error:', error);
    return [];
  }
}

/**
 * ✅ SAVE CART: Save ke storage
 */
export async function saveLiked(liked: LikedItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(liked));
  } catch (error) {
    console.error('❌ saveLiked error:', error);
    throw error;
  }
}

/**
 * ✅ CLEAR CART: Hapus semua items
 */
export async function clearLiked(): Promise<void> {
  return executeWithLock(async () => {
    try {
      await AsyncStorage.removeItem(CART_KEY);
    } catch (error) {
      console.error('❌ clearLiked error:', error);
      throw error;
    }
  });
}

/**
 * ✅ GET CART COUNT: Total jumlah items (sum of quantities)
 * Misal: [{id:1, qty:2}, {id:2, qty:1}] → total = 3
 */
export async function getLikedCount(): Promise<number> {
  try {
    const liked = await getLiked();
    return liked.reduce((sum, item) => sum + item.quantity, 0);
  } catch (error) {
    console.error('❌ getLikedCount error:', error);
    return 0;
  }
}
