import { httpDelete } from '@/core/integrations/http';

/**
 * Deletes a work order. Mock-api returns 204 with empty body.
 */
export async function deleteWorkOrder(id: string): Promise<void> {
  await httpDelete<unknown>(`/work-orders/${id}`);
}
