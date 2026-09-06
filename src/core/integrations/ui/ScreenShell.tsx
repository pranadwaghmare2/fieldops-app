import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colours, radius, spacing } from '@/core/theme';

type ScreenShellProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /**
   * Extra NativeWind classes merged after the responsive shell recipe.
   * Uses fieldops-ui preset screens: sm 390 / md 768 / lg 1024.
   */
  className?: string;
};

/**
 * Responsive content column for screens.
 * Phone: full width + pad-4. md+: centered max width. lg: tighter column.
 * Features use this port — do not import `nativewind` in features.
 */
export function ScreenShell({ children, style, className }: ScreenShellProps) {
  return (
    <View
      className={[
        'w-full flex-1 px-4 md:px-6 lg:px-8 md:max-w-3xl lg:max-w-2xl md:mx-auto md:self-center',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={[styles.shell, style]}
    >
      {children}
    </View>
  );
}

type SurfaceCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
};

/**
 * Token card surface — hairline border, radius 10, no shadow (brief).
 */
export function SurfaceCard({ children, style, className }: SurfaceCardProps) {
  return (
    <View
      className={['bg-surface border border-border rounded-md p-4', className]
        .filter(Boolean)
        .join(' ')}
      style={[styles.card, style]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    backgroundColor: colours.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colours.border,
    borderRadius: radius,
    padding: spacing[4],
    gap: spacing[3],
  },
});
