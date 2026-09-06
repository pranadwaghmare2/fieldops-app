import { colours } from '@/core/theme';

describe('FieldOps theme tokens', () => {
  it('keeps primary colour aligned with the brief / UI preset', () => {
    expect(colours.primary).toBe('#1D4ED8');
  });
});
