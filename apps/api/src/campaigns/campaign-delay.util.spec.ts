import { randomDelaySeconds } from './campaign-delay.util';

describe('campaign-delay.util', () => {
  describe('randomDelaySeconds', () => {
    it('stays within the inclusive [min, max] range', () => {
      for (let i = 0; i < 200; i++) {
        const delay = randomDelaySeconds(5, 15);
        expect(delay).toBeGreaterThanOrEqual(5);
        expect(delay).toBeLessThanOrEqual(15);
      }
    });

    it('returns min when max <= min', () => {
      expect(randomDelaySeconds(10, 10)).toBe(10);
      expect(randomDelaySeconds(10, 5)).toBe(10);
    });

    it('never returns a negative delay', () => {
      expect(randomDelaySeconds(-5, -10)).toBe(0);
    });
  });
});
