import { zodResolver } from '@hookform/resolvers/zod';
import {
  useForm,
  type FieldValues,
  type Path,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form';
import { z } from 'zod';

/**
 * Re-export Zod from the form port so features never import `zod` by package path.
 */
export { z };

/**
 * Builds a RHF resolver from a Zod schema without features importing resolvers.
 */
export function createZodResolver(schema: z.ZodType) {
  // Cast keeps the port stable across Zod 3/4 resolver overloads during foundation.
  return zodResolver(schema as never);
}

/**
 * App form hook — adapter over React Hook Form.
 * Feature ViewModels call this instead of `useForm` from `react-hook-form`.
 */
export function useAppForm<TFieldValues extends FieldValues = FieldValues>(
  props?: UseFormProps<TFieldValues>,
): UseFormReturn<TFieldValues> {
  return useForm<TFieldValues>(props);
}

/**
 * Maps mock-api 422 `{ field: message }` onto RHF field errors.
 * Prefer this over a generic toast for field-level failures.
 */
export function applyServerFieldErrors<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  errors: Record<string, string>,
): void {
  for (const [field, message] of Object.entries(errors)) {
    // Server may return fields the schema knows; cast keeps the port generic.
    form.setError(field as Path<TFieldValues>, { type: 'server', message });
  }
}
