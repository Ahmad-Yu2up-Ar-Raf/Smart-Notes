// components/ui/fragments/custom-ui/card/quote-card.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/fragments/shadcn-ui/card';
import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Pressable, ViewProps } from 'react-native';
import { batasiKata } from '@/hooks/useWord';
import { Quote } from '@/type/quotes-type';
import { router } from 'expo-router';
import QuoteIcon from '../../svg/icons/quotes-icon';
import { useColorScheme } from 'nativewind';
import { THEME } from '@/lib/theme';
import { Button } from '../../shadcn-ui/button';
import { Icon } from '../../shadcn-ui/icon';
import { Text } from '../../shadcn-ui/text';
import { MoreHorizontalIcon } from 'lucide-react-native';
import { useQuoteActionsSheet } from '@/components/provider/QuoteActionsSheetProvider';

type componentProps = ViewProps & {
  className?: string;
  quote: Quote;
  index: number;
};

/**
 * ✅ QUOTE CARD COMPONENT
 *
 * Features:
 * - Tap to view quote detail
 * - Tap "..." to trigger GLOBAL bottom drawer
 * - Save/unsave quotes with smooth animations
 * - Swipeable drawer dismiss
 *
 * NOTE: Uses global QuoteActionsSheet (mounted once at top level)
 * No local state, just triggers context
 */
export function QuoteCard({ className, index, quote, ...props }: componentProps) {
  // ✅ Get global sheet controller
  const { openSheet } = useQuoteActionsSheet();

  // ✅ Theme
  const { colorScheme } = useColorScheme();
  const currentTheme = colorScheme ?? 'light';
  const tintColor = THEME[currentTheme].mutedForeground;

  const Author = batasiKata(quote.author, 2);

  /**
   * ✅ NAVIGATE TO QUOTE DETAIL
   */
  const navigateToQuote = useCallback(() => {
    router.push({
      pathname: '/(drawer)/(tabs)/quotes/[id]',
      params: { id: quote.id, name: quote.author },
    });
  }, [quote.id, quote.author]);

  /**
   * ✅ OPEN GLOBAL ACTIONS SHEET - SIMPLIFIED
   */
  const handleOpenActionsSheet = useCallback(() => {
    console.log('📌 Button tapped! Opening sheet for quote:', quote.id);
    openSheet(quote);
  }, [quote, openSheet]);

  return (
    <Card
      className={cn(
        'h-full w-full flex-1 flex-row items-center gap-0 rounded-2xl border-0 p-2 transition-all duration-200',
        className
      )}
      {...props}>
      <Pressable onPress={navigateToQuote} key={`quote-${quote.id}`} className="flex-1">
        {/* ✅ HEADER: Quote icon + More button */}
        <CardHeader className="relative w-full flex-row content-center items-center justify-between rounded-xl bg-transparent px-0">
          <QuoteIcon width={20} height={20} fill={tintColor} stroke={tintColor} />

          {/* ✅ MORE ACTIONS BUTTON: Triggers global drawer */}
          <Button
            variant="ghost"
            size="icon"
            onPress={handleOpenActionsSheet}
            className="absolute right-0 top-0">
            <Icon as={MoreHorizontalIcon} className="size-5 text-muted-foreground" />
          </Button>
        </CardHeader>

        {/* ✅ QUOTE CONTENT */}
        <CardContent className="h-full w-full gap-1 rounded-none px-5">
          <CardDescription
            variant="p"
            className={cn('my-4 text-justify text-sm leading-relaxed text-muted-foreground')}>
            "{quote.quote}"
          </CardDescription>
          <Text className="line-clamp-1 w-fit flex-1 font-poppins_semibold text-lg tracking-tighter text-foreground/85">
            ─ {Author}
          </Text>
        </CardContent>
      </Pressable>
    </Card>
  );
}
