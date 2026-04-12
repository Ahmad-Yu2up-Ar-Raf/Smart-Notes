// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/ui/core/haptic-tab';

import Ionicons from '@expo/vector-icons/Ionicons';
import HomeIcon from '@/components/ui/fragments/svg/icons/home';

import { UserAvatar } from '@/components/ui/core/feauture/auth/user-menu';
import { Icon } from '@/components/ui/fragments/shadcn-ui/icon';
import { FolderClosed, FolderIcon, FolderOpen, HeartIcon } from 'lucide-react-native';
import ArchiveIcon from '@/components/ui/fragments/svg/icons/archive-icon';

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const currentTheme = colorScheme ?? 'light';
  const tintColor = THEME[currentTheme].primary;
  const backgroundColor = THEME[currentTheme].card;
  const mutedForeground = THEME[currentTheme].mutedForeground;
  const inactiveTintColor = THEME[currentTheme].mutedForeground;

  const insets = useSafeAreaInsets(); // ✅ Dapetin safe area insets

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarButton: HapticTab,

          tabBarActiveTintColor: tintColor,

          tabBarInactiveTintColor: inactiveTintColor,
          tabBarStyle: {
            backgroundColor,

            height: 60 + insets.bottom,
            paddingTop: 10,
            display: 'flex',
            alignItems: 'center',
            paddingHorizontal: 0,
            borderTopWidth: 0.5,
            borderTopColor: THEME[currentTheme].background,
            shadowColor: mutedForeground,
            shadowOffset: {
              width: 2,
              height: 0,
            },
            shadowOpacity: 20.1,
            shadowRadius: 2.84,
            elevation: 3,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarShowLabel: false,
            tabBarButton: HapticTab,
            tabBarIcon: ({ color, focused }) => (
              <HomeIcon
                fill={focused ? tintColor : 'none'}
                stroke={focused ? 'none' : inactiveTintColor}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="archive"
          options={{
            headerShown: false,
            title: 'Archive',
            tabBarShowLabel: false,
            tabBarButton: HapticTab,
            tabBarIcon: ({ color, focused }) => {
              return (
                <>
                  {focused ? (
                    <ArchiveIcon
                      fill={focused ? tintColor : 'none'}
                      stroke={focused ? 'none' : inactiveTintColor}
                    />
                  ) : (
                    <Icon
                      as={focused ? FolderOpen : FolderClosed}
                      className="size-6"
                      fill={focused ? tintColor : 'none'}
                      stroke={focused ? tintColor : inactiveTintColor}
                    />
                  )}
                </>
              );
            },
          }}
        />
        <Tabs.Screen
          name="quotes"
          options={{
            headerShown: false,
            title: 'Quotes',
            tabBarShowLabel: false,
            tabBarButton: HapticTab,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'search' : 'search-outline'} size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="liked"
          options={{
            title: 'Liked',
            tabBarShowLabel: false,
            tabBarButton: HapticTab,
            tabBarIcon: ({ color, focused }) => (
              <Icon
                as={HeartIcon}
                className="size-6"
                fill={focused ? tintColor : 'none'}
                stroke={focused ? tintColor : inactiveTintColor}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarShowLabel: false,
            tabBarButton: HapticTab,
            tabBarIcon: ({ color, focused }) => <UserAvatar className="size-7" />,
          }}
        />

        {/* Tab lainnya... */}
      </Tabs>
    </>
  );
}
