import { THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Svg, { SvgProps, G, Path } from 'react-native-svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const QuoteIcon = ({ title, titleId, ...props }: SvgProps & SVGRProps) => {
  // ✅ Hook aman di sini karena ini adalah proper React component

  const { colorScheme } = useColorScheme();
  const currentTheme = colorScheme ?? 'light';

  const primaryColor = THEME[currentTheme].primary;
  return (
    <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} width={24} height={24} {...props}>
      <G fill={props.fill}>
        <Path d="M15.91 12.37h4.69c-.08 4.67-1 5.44-3.87 7.14-.33.2-.44.62-.24.96.2.33.62.44.96.24 3.38-2 4.56-3.22 4.56-9.04V6.28c0-1.71-1.39-3.09-3.09-3.09h-3c-1.76 0-3.09 1.33-3.09 3.09v3c-.01 1.76 1.32 3.09 3.08 3.09Z" />
        <Path d="M5.09 12.37h4.69c-.08 4.67-1 5.44-3.87 7.14-.33.2-.44.62-.24.96.2.33.62.44.96.24 3.38-2 4.56-3.22 4.56-9.04V6.28c0-1.71-1.39-3.09-3.09-3.09h-3c-1.76 0-3.09 1.33-3.09 3.09v3c-.01 1.76 1.32 3.09 3.08 3.09Z" />
      </G>
    </Svg>
  );
};
export default QuoteIcon;
