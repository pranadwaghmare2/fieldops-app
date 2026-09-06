/**
 * UI integration — re-export fieldops-ui so features never import the package path.
 * Swap or wrap components here if the library API changes.
 * Host layout helpers (`ScreenShell`, `SurfaceCard`) use preset screens / tokens.
 */
export {
  Badge,
  Button,
  Select,
  Text,
  TextField,
} from '@pranadwaghmare2/fieldops-ui';

export type {
  BadgeProps,
  ButtonProps,
  SelectProps,
  TextFieldProps,
  TextProps,
} from '@pranadwaghmare2/fieldops-ui';

export { ScreenShell, SurfaceCard } from './ScreenShell';
