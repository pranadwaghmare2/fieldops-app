import { applyServerFieldErrors } from '@/core/integrations/form';

describe('applyServerFieldErrors', () => {
  it('maps each server field error onto setError', () => {
    const setError = jest.fn();
    const form = { setError } as never;

    applyServerFieldErrors(form, {
      title: 'Too short',
      site: 'Required',
    });

    expect(setError).toHaveBeenCalledWith('title', {
      type: 'server',
      message: 'Too short',
    });
    expect(setError).toHaveBeenCalledWith('site', {
      type: 'server',
      message: 'Required',
    });
  });
});
