# ✅ LIKED SYSTEM - BEST PRACTICES IMPLEMENTATION

## 1. 🏗️ ARCHITECTURE OVERVIEW

### Component Hierarchy

```
LikedProvider (Global State)
  ├─ quote-card.tsx
  │   └─ QuoteActionsSheet (Bottom Sheet Modal)
  │       ├─ Save/Unsave Button
  │       └─ Liked Status Display
  └─ (Other components using useLiked hook)

Storage Layer
  └─ liked-storage.ts (AsyncStorage + MUTEX Lock)
      ├─ addToLiked()
      ├─ removeFromLiked()
      ├─ updateLikedQuantity()
      └─ getLiked()
```

## 2. 🎯 KEY FEATURES IMPLEMENTED

### ✅ OPTIMISTIC UI

```typescript
// User sees instant feedback (no waiting for async operation)
startTransition(() => {
  // 1. Update local state immediately
  setItems(updatedItems);
  setCount(newCount);

  // 2. Sync to storage in background (non-blocking)
  requestAnimationFrame(async () => {
    try {
      await removeFromLiked(quoteId);
    } catch (error) {
      // 3. Rollback if error
      const fresh = await getLiked();
      setItems(fresh);
    }
  });
});
```

**Benefit**: Instant feedback while data syncs in background

### ✅ MUTEX LOCK (Prevent Race Condition)

```typescript
// Jika user click save 3x cepat-cepat:
// ❌ BEFORE: Parallel execution → potential data corruption
// ✅ AFTER: Sequential queue → safe & predictable

let isProcessing = false;
const processingQueue = [];

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
```

**Benefit**: Safe concurrent operations without conflicts

### ✅ NO DUPLICATE SAVES

```typescript
// UPSERT Logic: Check if quote exists
const existingIndex = liked.findIndex((item) => item.quote.id === quote.id);

if (existingIndex >= 0) {
  // Quote exists → increment quantity (instead of saving duplicate)
  liked[existingIndex].quantity += quantity;
} else {
  // New quote → add to liked
  liked.push({ quote, quantity });
}
```

**Benefit**: Efficient storage (1 data per quote, not duplicates)

## 3. 📱 UI/UX BEST PRACTICES

### ✅ Bottom Sheet Design

```typescript
<Modal
  visible={isOpen}
  transparent
  animationType="fade"
  onRequestClose={onClose}
  statusBarTranslucent>
  {/* Backdrop for dismissal */}
  <Pressable onPress={handleBackdropPress}>
    {/* Sheet content - non-dismissable */}
    <Pressable onPress={(e) => e.stopPropagation()}>
      {/* Content here */}
    </Pressable>
  </Pressable>
</Modal>
```

### ✅ Button State Management

```typescript
const isLiked = hasItem(quote.id);

<Button
  disabled={isPending}
  variant={isLiked ? 'destructive' : 'default'}
  onPress={handleToggleLike}>
  {isPending ? 'Processing...' : isLiked ? 'Remove from Liked' : 'Save to Liked'}
</Button>
```

### ✅ Loading States

```typescript
// Use isPending from useTransition to show loading state
{isPending && <Spinner />}

// Button disabled during async operation
<Button disabled={isPending}>
  {isPending ? 'Processing...' : 'Save'}
</Button>
```

## 4. 🔧 TECHNICAL IMPLEMENTATION

### Memory Usage Optimization

```typescript
// ✅ Memoize expensive computations
const themeColors = useMemo(
  () => ({
    background: THEME[currentTheme].background,
    primary: THEME[currentTheme].primary,
  }),
  [currentTheme]
);

// ✅ Memoize callbacks
const handleToggleLike = useCallback(async () => {
  // handler logic
}, [isLiked, quote, addItem, removeItem, onClose]);
```

### State Management

```typescript
// ❌ DON'T: Update state with side effects
const [items, setItems] = useState([]);
useEffect(() => {
  setItems(updatedItems); // Causes re-render cycle
  setCount(newCount); // Causes another re-render
}, [dependency]);

// ✅ DO: Batch updates with startTransition
const [isPending, startTransition] = useTransition();
startTransition(() => {
  setItems(updatedItems); // Batched
  setCount(newCount); // Batched → single re-render
});
```

## 5. 🛡️ ERROR HANDLING PATTERN

```typescript
try {
  // Optimistic update
  startTransition(() => {
    setItems(updatedItems);
  });

  // Background sync
  await asyncStorageOperation();
} catch (error) {
  console.error('❌ Error:', error);

  // Rollback to fresh data
  const fresh = await getLiked();
  setItems(fresh);

  // Optionally show toast notification
  // showErrorToast('Failed to save quote');
}
```

## 6. 📊 ASYNC STORAGE BEST PRACTICES

### ✅ Mutex Lock Pattern

```typescript
// Prevents simultaneous reads/writes
executeWithLock(async () => {
  const current = await getLiked();
  // Modify
  await saveLiked(modified);
});
```

### ✅ Error Boundaries

```typescript
async function getLiked(): Promise<LikedItem[]> {
  try {
    const data = await AsyncStorage.getItem('TESATE_CART');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('❌ getLiked error:', error);
    return []; // Return empty instead of crashing
  }
}
```

## 7. 🚀 PERFORMANCE OPTIMIZATIONS

### Batch Operations

```typescript
// ✅ Single state update per operation
startTransition(() => {
  setItems(updated); // Single re-render trigger
  setCount(newCount); // Batched with above
});

// ❌ AVOID: Multiple separate state updates
setItems(updated); // Re-render #1
setCount(newCount); // Re-render #2
```

### Memory Efficient Filtering

```typescript
// ✅ Immutable update without object spread
const filtered = items.filter((item) => item.quote.id !== quoteId);

// ✅ Efficient quantity increment
const updated = items.map((item) =>
  item.quote.id === quoteId ? { ...item, quantity: item.quantity + 1 } : item
);
```

## 8. 📋 FLOW DIAGRAM

```
User Taps "..." Button
    ↓
QuoteActionsSheet Opens (Modal)
    ↓
User Clicks "Save" or "Remove"
    ↓
handleToggleLike() Called
    ├─ Optimistic State Update (Instant UI feedback)
    ├─ Show Loading State (isPending)
    └─ Call addItem() or removeItem()
         ↓
    LikedProvider.addItem/removeItem()
         ├─ Optimistic UI Update (Instant)
         └─ Background Sync via requestAnimationFrame
              ├─ Fetch Current Data (Mutex Lock)
              ├─ Modify (Check duplicates, Add/Remove)
              ├─ Save to AsyncStorage
              └─ On Error: Rollback from Fresh Data
    ↓
Sheet Auto-closes
    ↓
Quote Card Re-renders with New Liked Status
```

## 9. ✨ KEY TAKEAWAYS

| Feature            | Benefit               |
| ------------------ | --------------------- |
| **Optimistic UI**  | ⚡ Instant feedback   |
| **MUTEX Lock**     | 🛡️ No race conditions |
| **Batch Updates**  | 📊 Better performance |
| **Error Rollback** | ↩️ Data consistency   |
| **No Duplicates**  | 💾 Efficient storage  |
| **Memoization**    | 🚀 Prevent re-renders |

## 10. 🧪 TESTING CHECKLIST

- [ ] Save quote → appears in liked
- [ ] Unsave quote → removed from liked
- [ ] Click save multiple times quickly → no duplicates
- [ ] Close app → data persists in AsyncStorage
- [ ] Network issue → rollback happens correctly
- [ ] Button shows loading state during operation
- [ ] Sheet closes after successful save/unsave
- [ ] Liked status badge updates correctly

---

**Architecture**: Clean separation of concerns  
**Storage**: AsyncStorage with MUTEX protection  
**UI**: Optimistic updates with instant feedback  
**Performance**: Batched state updates & memoization  
**Reliability**: Error handling & rollback mechanism
