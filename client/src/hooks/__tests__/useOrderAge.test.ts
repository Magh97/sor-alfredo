import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOrderAge } from '@/hooks/useOrderAge';

describe('useOrderAge', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return "normal" for order less than 5 min old', () => {
    vi.setSystemTime(new Date('2026-01-01T12:00:00'));
    const threeMinAgo = '2026-01-01T11:57:00.000Z';

    const { result } = renderHook(() => useOrderAge(threeMinAgo));

    expect(result.current.level).toBe('normal');
    expect(result.current.minutes).toBe(3);
  });

  it('should advance to "attention" after 5 minutes', () => {
    vi.setSystemTime(new Date('2026-01-01T12:00:00'));
    const eightMinAgo = '2026-01-01T11:52:00.000Z';

    const { result } = renderHook(() => useOrderAge(eightMinAgo));

    expect(result.current.level).toBe('attention');
    expect(result.current.minutes).toBe(8);
  });

  it('should return "critical" for order older than 15 min', () => {
    vi.setSystemTime(new Date('2026-01-01T12:00:00'));
    const sixteenMinAgo = '2026-01-01T11:44:00.000Z';

    const { result } = renderHook(() => useOrderAge(sixteenMinAgo));

    expect(result.current.level).toBe('critical');
    expect(result.current.minutes).toBe(16);
  });
});
