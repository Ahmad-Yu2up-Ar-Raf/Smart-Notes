// components/LastReadCard.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/fragments/shadcn-ui/card';
import React from 'react';
import { cn } from '@/lib/utils';
import { Dimensions, View, ViewProps } from 'react-native';

import { batasiKata } from '@/hooks/useWord';

import { Text } from '../../shadcn-ui/text';
import { Button } from '../../shadcn-ui/button';
import { Icon } from '../../shadcn-ui/icon';

import { ShoppingCartIcon, Star, Check, MinusIcon, PlusIcon } from 'lucide-react-native';
import { Image } from '../../shadcn-ui/image';

import { CartItem } from '@/lib/storage/liked-storage';

type componentProps = ViewProps & {
  className?: string;
  cartItem: CartItem;
};

export function CartProductCard({ className, cartItem, ...props }: componentProps) {
  const product = cartItem.product;

  const Title = batasiKata(product.title, 2);

  const quantity = cartItem.quantity;
  const SCREEN_WIDTH = Dimensions.get('window').width;
  const CARD_WIDTH = SCREEN_WIDTH / 4;
  const totalCartProduct = product.price * quantity;
  const IMAGE_HEIGHT = CARD_WIDTH * (4 / 4);
  return (
    <Card
      className={cn(
        'h-full w-full flex-1 flex-row items-center gap-0 rounded-2xl border-0 p-0 transition-all duration-200',
        className
      )}
      {...props}>
      <CardContent className="h-full w-full flex-row items-center gap-8 rounded-none p-0">
        <CardHeader className="relative w-fit content-center items-center justify-center rounded-xl bg-transparent px-0">
          <View className="m-auto" style={{ width: CARD_WIDTH, height: IMAGE_HEIGHT }}>
            <Image
              source={{ uri: product.thumbnail }}
              contentFit="cover"
              className="h-full w-full bg-transparent"
            />
          </View>
        </CardHeader>
        <View className="w-full flex-1 gap-4">
          <CardTitle className="mb-2.5 mt-1 line-clamp-1 w-fit flex-1 font-source_serif_semibold text-[1.35rem] tracking-tighter text-foreground/85">
            {Title}
          </CardTitle>

          <CardFooter className="flex w-full justify-between p-0">
            <View className="flex-1 flex-row items-center gap-1">
              <Text variant={'large'} className="pb-0.5 font-source_serif_bold text-xl">
                $
              </Text>
              <CardDescription
                variant={'large'}
                className="line-clamp-1 w-full font-source_serif_bold text-[1.4rem] leading-relaxed tracking-tighter text-foreground">
                {totalCartProduct.toFixed(2)}
              </CardDescription>
            </View>
            <View className="h-fit flex-row items-center justify-between gap-3 rounded-full px-4 py-2.5">
              <Button
                disabled={quantity == 1}
                // onPress={() => setQuantity(quantity - 1)}
                variant={'outline'}
                size="icon"
                className="size-fit rounded-md p-1">
                <Icon as={MinusIcon} className="size-5" />
              </Button>
              <Text className="font-source_serif_semibold text-lg">{quantity}</Text>
              <Button
                disabled={quantity == 100}
                // onPress={() => setQuantity(quantity + 1)}
                variant={'ghost'}
                size="icon"
                className="size-fit rounded-full p-0">
                <Icon as={PlusIcon} className="size-5" />
              </Button>
            </View>
          </CardFooter>
        </View>
      </CardContent>
    </Card>
  );
}
