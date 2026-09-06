import { httpGet } from '@/core/integrations/http';
import type { ApiSuccess, User } from '@/core/types';

/**
 * Fetches assignee options for the form Select.
 */
export function listUsers(): Promise<ApiSuccess<User[]>> {
  return httpGet<ApiSuccess<User[]>>('/users');
}
