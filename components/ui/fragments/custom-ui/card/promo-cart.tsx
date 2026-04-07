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
import { View, ViewProps } from 'react-native';

import { Icon } from '../../shadcn-ui/icon';
import { TicketPercent } from 'lucide-react-native';
import { Button } from '../../shadcn-ui/button';
import { Text } from '../../shadcn-ui/text';
import { Input } from '../../shadcn-ui/input';

type componentProps = ViewProps & {
  className?: string;
};

export function PromoCart({ className, ...props }: componentProps) {
  return (
    <Card
      className={cn(
        'h-full w-full flex-1 flex-row items-center gap-0 rounded-2xl border-0 p-0 transition-all duration-200',

        className
      )}
      {...props}>
      <CardContent className="h-full w-full flex-row items-center justify-between gap-8 rounded-none pr-2">
        <View className="flex-1 flex-row items-center gap-2">
          <Icon className="size-8 text-muted-foreground/30" as={TicketPercent} />
          <Input className="border-0" placeholder="Promo Code" />
        </View>
        <Button size={'lg'} className="h-11 px-8">
          <Text className="font-poppins_medium text-sm">Apply</Text>
        </Button>
      </CardContent>
    </Card>
  );
}
