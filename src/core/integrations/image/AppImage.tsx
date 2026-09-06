import { Image, type ImageProps } from 'expo-image';
import { forwardRef } from 'react';

export type AppImageProps = ImageProps;

/**
 * Fast cached image adapter over `expo-image`.
 * Features import `AppImage` from this port — never `expo-image` directly.
 */
export const AppImage = forwardRef<Image, AppImageProps>(function AppImage(
  props,
  ref,
) {
  return <Image ref={ref} {...props} />;
});
