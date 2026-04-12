import React from 'react';
import { Wrapper } from '../layout/wrapper';
import { useQuery } from '@tanstack/react-query';
import { Text } from '../../fragments/shadcn-ui/text';
import { QuotesListQueryOptions } from '@/lib/server/quotes/quotes-server-queris';
import LoadingIndicator from '../loading-indicator';
import { RefreshControl, View } from 'react-native';
import { LegendList } from '@legendapp/list';
import { QuoteCard } from '../../fragments/custom-ui/card/quote-card';
import { Button } from '../../fragments/shadcn-ui/button';
import LottieView from 'lottie-react-native';
import { Icon } from '../../fragments/shadcn-ui/icon';
import { RotateCwIcon } from 'lucide-react-native';
export default function QuotesBlock() {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery(QuotesListQueryOptions());
  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (isError) {
    return (
      <Wrapper
        className="flex-1 content-center items-center justify-center"
        edges={['bottom', 'left', 'right']}>
        <LottieView
          autoPlay
          style={{
            width: 200,
            height: 200,
          }}
          // Find more Lottie files at https://lottiefiles.com/featured
          source={require('@/assets/animations/error.json')}
        />
        <Text className="mb-2 text-center text-muted-foreground">Gagal memuat data Quotes</Text>
        <Button
          disabled={isRefetching}
          size={'lg'}
          className="gap-2"
          onPress={() => {
            refetch();
          }}>
          <View className="h-full w-fit flex-row items-center justify-center gap-3">
            <Text className="font-poppins_medium text-sm">Coba lagi</Text>
            {isRefetching ? (
              <LoadingIndicator />
            ) : (
              <Icon className="text-primary-foreground" as={RotateCwIcon} />
            )}
          </View>
        </Button>
      </Wrapper>
    );
  }
  return (
    <LegendList
      data={data ?? []}
      renderItem={({ item, index }) => <QuoteCard index={index} quote={item} />}
      keyExtractor={(item, index) => `quote-${item.id}-${index}`}
      numColumns={1}
      onEndReachedThreshold={1.5}
      contentContainerStyle={{ paddingTop: 30, gap: 60, paddingBottom: 100 }}
      className="px-7"
      // ListHeaderComponent={HeaderComponent}
      // ✅ Pull to refresh
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      maintainVisibleContentPosition
      recycleItems
      showsVerticalScrollIndicator={false}
    />
  );
}

function HeaderComponent() {
  return (
    <>
      <View className="mb-10 flex-row items-center justify-between gap-2">
        <Text variant={'h3'} className="font-poppins_semibold tracking-tighter text-foreground/95">
          New Quotes
        </Text>
      </View>
    </>
  );
}
