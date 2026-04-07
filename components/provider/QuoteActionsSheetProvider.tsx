import React, { createContext, useContext, useCallback, useState, useRef, ReactNode } from 'react';
import { Quote } from '@/type/quotes-type';

/**
 * ✅ GLOBAL QUOTE ACTIONS SHEET CONTEXT
 *
 * Satu instance global untuk semua quote cards
 * Tidak perlu mount berkali-kali di setiap card
 *
 * Features:
 * - Prevents rapid open/close flickering
 * - Handles state transitions smoothly
 * - Single source of truth for sheet state
 */

interface QuoteActionsSheetContextType {
  // State
  isOpen: boolean;
  currentQuote: Quote | null;

  // Actions
  openSheet: (quote: Quote) => void;
  closeSheet: () => void;
}

const QuoteActionsSheetContext = createContext<QuoteActionsSheetContextType | undefined>(undefined);

/**
 * ✅ PROVIDER: Wrap di top level (dalam layout atau app root)
 */
export function QuoteActionsSheetProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);

  /**
   * ✅ OPEN SHEET - SIMPLIFIED
   */
  const openSheet = useCallback((quote: Quote) => {
    console.log('🔓 Context: openSheet called for quote', quote.id);
    setCurrentQuote(quote);
    setIsOpen(true);
  }, []);

  /**
   * ✅ CLOSE SHEET - SIMPLIFIED
   */
  const closeSheet = useCallback(() => {
    console.log('🔐 Context: closeSheet called');
    setIsOpen(false);
    setTimeout(() => setCurrentQuote(null), 300);
  }, []);

  return (
    <QuoteActionsSheetContext.Provider
      value={{
        isOpen,
        currentQuote,
        openSheet,
        closeSheet,
      }}>
      {children}
    </QuoteActionsSheetContext.Provider>
  );
}

/**
 * ✅ HOOK: Use di QuoteCard untuk trigger sheet
 *
 * @example
 * const { openSheet } = useQuoteActionsSheet();
 * <Button onPress={() => openSheet(quote)} />
 */
export function useQuoteActionsSheet() {
  const context = useContext(QuoteActionsSheetContext);
  if (!context) {
    throw new Error('useQuoteActionsSheet must be used within QuoteActionsSheetProvider');
  }
  return context;
}
