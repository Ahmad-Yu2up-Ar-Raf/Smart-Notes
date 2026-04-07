import { cn } from '@/lib/utils';
import { Icon } from './icon';
import { Loader2Icon, LucideIcon, LucideProps } from 'lucide-react-native';

type IconProps = LucideProps & {
  as?: LucideIcon;
  className?: string;
  size?: number | 'sm' | 'md' | 'lg';
};

// Map size variants to pixel values
const sizeVariants: Record<string | number, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

function Spinner({ className, as, size = 'md', ...props }: IconProps) {
  // Convert size variant to pixel value if needed
  const pixelSize = typeof size === 'number' ? size : sizeVariants[size] || 20;

  return (
    <Icon
      as={as ?? Loader2Icon}
      size={pixelSize}
      aria-label="Loading"
      className={cn('animate-spin', className)}
      {...props}
    />
  );
}

export { Spinner };
