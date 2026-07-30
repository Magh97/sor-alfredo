import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CajeroOrdersPage } from '@/app/caja/orders/page';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/lib/api', () => ({
  api: vi.fn(),
  getStoredUser: vi.fn(() => ({ id: 3, role: 'cashier', restaurantId: 1 })),
  getAccessToken: vi.fn(() => 'token'),
}));

vi.mock('@/hooks/useSocket', () => ({ useSocket: vi.fn() }));

const { useQueryMock } = vi.hoisted(() => ({ useQueryMock: vi.fn() }));

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: (...args: unknown[]) => useQueryMock(...args),
    useMutation: (...args: unknown[]) => ({ mutate: vi.fn(), isPending: false, error: null }),
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  };
});

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        {ui}
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('CajeroOrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQueryMock.mockImplementation(({ queryKey }: { queryKey: unknown[] }) => {
      const key = queryKey as string[];
      if (key[0] === 'orders') return { data: { data: [] }, isLoading: false };
      if (key[0] === 'tables') return { data: { data: [] }, isLoading: false };
      if (key[0] === 'cash-register') return { data: { data: { id: 1, status: 'open' } }, isLoading: false };
      return { data: null, isLoading: true };
    });
  });

  it('should show empty state', () => {
    renderWithProviders(<CajeroOrdersPage />);
    expect(screen.getByText('Sin órdenes para mostrar.')).toBeInTheDocument();
  });

  it('should show orders in table', () => {
    useQueryMock.mockImplementation(({ queryKey }: { queryKey: unknown[] }) => {
      const key = queryKey as string[];
      if (key[0] === 'orders') return { data: { data: [{ id: 1, tableId: 1, userId: 2, status: 'delivered', totalAmount: '100', createdAt: '', table: { number: 1 }, user: { name: 'Mesero' } }] }, isLoading: false };
      if (key[0] === 'tables') return { data: { data: [] }, isLoading: false };
      if (key[0] === 'cash-register') return { data: { data: { id: 1, status: 'open' } }, isLoading: false };
      return { data: null, isLoading: true };
    });

    renderWithProviders(<CajeroOrdersPage />);
    expect(screen.getByText(/M1/)).toBeInTheDocument();
    const badges = screen.getAllByText('Entregado');
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });
});
