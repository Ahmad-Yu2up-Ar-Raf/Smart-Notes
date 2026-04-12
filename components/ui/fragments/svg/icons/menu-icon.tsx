import * as React from 'react';
import Svg, { SvgProps, G, Path } from 'react-native-svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const MenuSheetIcon = ({ title, titleId, ...props }: SvgProps & SVGRProps) => (
  <Svg opacity={0.7} fill="none" viewBox="0 0 24 24" width={24} height={24} {...props}>
    <Path
      fill={props.fill ?? 'currentColor'}
      fillRule="evenodd"
      d="M2 7a1 1 0 0 1 1-1h18a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1zm0 5a1 1 0 0 1 1-1h18a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1zm1 4a1 1 0 1 0 0 2h18a1 1 0 1 0 0-2H3z"
      clipRule="evenodd"
    />
  </Svg>
);
export default MenuSheetIcon;
