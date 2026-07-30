import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOptimisticOrder } from '@/hooks/useOptimisticOrder';

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useOptimisticOrder', () => {
  it('should return mutation object', () => {
    const { result } = renderHook(() => useOptimisticOrder(['orders']), { wrapper: createWrapper() });

    expect(result.current).toBeDefined();
    expect(typeof result.current.mutate).toBe('function');
    expect(typeof result.current.mutateAsync).toBe('function');
  });

  it('should execute mutation function', async () => {
    const mutationFn = vi.fn().mockResolvedValue({ id: 1 });

    const { result } = renderHook(() => useOptimisticOrder(['orders']), { wrapper: createWrapper() });

    await result.current.mutateAsync(mutationFn);

    expect(mutationFn).toHaveBeenCalled();
  });
});
