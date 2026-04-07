import React from 'react';
import { View } from 'react-native';
import { Text } from '../../fragments/shadcn-ui/text';
import { Button } from '../../fragments/shadcn-ui/button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { THEME } from '@/lib/theme';
import { useCart } from '@/components/provider/LikedProvider';
import LoadingIndicator from '../loading-indicator';

import { CartProductCard } from '../../fragments/custom-ui/card/cart-product-card';
import { LegendList } from '@legendapp/list';
import { PromoCart } from '../../fragments/custom-ui/card/promo-cart';
const CartBlock = () => {
  const insets = useSafeAreaInsets();

  const { colorScheme } = useColorScheme();
  const currentTheme = colorScheme ?? 'light';

  const bgColor = THEME[currentTheme].background;

  const { isLoading, items, total } = useCart(); // ✅ Get cart count

  if (isLoading) return <LoadingIndicator />;

  return (
    <>
      <LegendList
        data={items ?? []}
        renderItem={({ item, index }) => <CartProductCard cartItem={item} />}
        keyExtractor={(item, index) => `product-${item.product.id}-${index}`}
        numColumns={1}
        onEndReachedThreshold={1.5}
        contentContainerStyle={{ paddingTop: 30, gap: 60, paddingBottom: 350 }}
        className="px-7"
        maintainVisibleContentPosition
        recycleItems
        ListFooterComponent={ListFooter({ total: total })}
        // ListHeaderComponent={Checkout({ total: total })}
        showsVerticalScrollIndicator={false}
      />
      {/* <Wrapper className="relative flex-col gap-10 bg-background px-6 pt-10">
        {items.map((items, i) => (
          <CartProductCard cartItem={items} key={i} />
        ))}
      </Wrapper> */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: insets.bottom > 0 ? insets.bottom + 36 : 12,
          paddingTop: 11,

          backgroundColor: bgColor,

          zIndex: 100,
        }}
        className="items-center justify-center gap-9 px-8">
        <View className="relative w-full flex-row items-center justify-between gap-0">
          <Text
            variant={'large'}
            className="m-0 h-fit w-fit p-0 font-poppins_medium text-lg tracking-tighter">
            Total
          </Text>
          <Text
            variant={'small'}
            className="m-0 h-fit w-fit p-0 font-poppins_medium text-lg tracking-tighter">
            ${total.toFixed(2)}
          </Text>
        </View>
        <Button variant="default" size={'lg'} className="h-16 w-full rounded-full px-9">
          <Text variant={'large'} className="font-poppins_medium text-lg text-primary-foreground">
            Payment
          </Text>
        </Button>
      </View>
    </>
  );
};

export default CartBlock;

const ListFooter = ({ total }: { total: number }) => {
  return (
    <View className="mt-6 gap-16">
      <PromoCart />
      <View className="gap-7">
        <View className="h-fit w-full flex-row items-center justify-between">
          <Text className="text-justify text-lg leading-relaxed text-muted-foreground/65">
            Item total:
          </Text>
          <Text className="text-justify text-lg leading-relaxed text-muted-foreground/80">
            ${total.toFixed(2)}
          </Text>
        </View>
        <View className="h-fit w-full flex-row items-center justify-between">
          <Text className="text-justify text-lg leading-relaxed text-muted-foreground/65">
            Delivery:
          </Text>
          <Text className="text-justify text-lg leading-relaxed text-muted-foreground/80">
            Free
          </Text>
        </View>
      </View>
    </View>
  );
};
