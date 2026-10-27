import { describe, expect, it } from 'vitest';
import { canTransition, money, transitionMap } from './domain';

describe('contract lifecycle', () => {
  it('allows only explicitly declared transitions', () => {
    expect(canTransition('draft','proposed')).toBe(true);
    expect(canTransition('proposed','active')).toBe(true);
    expect(canTransition('active','submitted')).toBe(true);
    expect(canTransition('submitted','accepted')).toBe(true);
    expect(canTransition('active','disputed')).toBe(true);
  });

  it('rejects impossible or unsafe transitions', () => {
    expect(canTransition('draft','accepted')).toBe(false);
    expect(canTransition('accepted','active')).toBe(false);
    expect(canTransition('cancelled','proposed')).toBe(false);
    expect(canTransition('active','accepted')).toBe(false);
  });

  it('keeps accepted and cancelled states terminal', () => {
    expect(transitionMap.accepted).toEqual([]);
    expect(transitionMap.cancelled).toEqual([]);
  });
});

describe('money formatting', () => {
  it('formats RUB amounts without fractional digits', () => {
    expect(money(1000)).toContain('1');
    expect(money(1000)).toContain('₽');
  });
});
