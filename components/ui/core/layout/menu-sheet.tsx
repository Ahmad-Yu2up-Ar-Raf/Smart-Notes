// components/ui/core/layout/menu-sheet.tsx
//
// ✅ Self-contained drawer trigger.
// Tidak perlu props apapun dari header.
// DrawerActions.openDrawer() bubble up ke Drawer navigator
// terdekat di atas tree — works dari (tabs), doa, maupun article.

import { Button } from '@/components/ui/fragments/shadcn-ui/button';

import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import MenuSheetIcon from '../../fragments/svg/icons/menu-icon';
import { useColorScheme } from 'nativewind';
import { THEME } from '@/lib/theme';

export function MenuSheet() {
  const navigation = useNavigation();
  const { colorScheme } = useColorScheme();
  const currentTheme = colorScheme ?? 'light';

  const tintColor = THEME[currentTheme].primary;
  return (
    <Button
      size="icon"
      variant={'ghost'}
      className="size-12 rounded-full  "
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
      <MenuSheetIcon stroke={tintColor} className="size-5" />
    </Button>
  );
}
