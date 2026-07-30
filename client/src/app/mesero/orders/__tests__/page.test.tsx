import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MeseroOrdersPage } from '@/app/mesero/orders/page';

vi.mock('@/lib/api', () => ({
  api: vi.fn(),
  getStoredUser: vi.fn(() => ({ id: 2, role: 'waiter', restaurantId: 1 })),
  getAccessToken: vi.fn(() => 'token'),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: vi.fn(() => vi.fn()) };
});

vi.mock('@/hooks/useSocket', () => ({
  useSocket: vi.fn(),
}));

const { useQueryMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
}));

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
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {ui}
    </QueryClientProvider>,
  );
}

describe('MeseroOrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQueryMock.mockImplementation(({ queryKey }: { queryKey: unknown[] }) => {
      const key = queryKey as [string, Record<string, unknown>?];
      if (key[0] === 'orders') return { data: { data: [] }, isLoading: false, isError: false };
      if (key[0] === 'tables') return { data: { data: [] }, isLoading: false, isError: false };
      if (key[0] === 'catalog') return { data: { data: [] }, isLoading: false, isError: false };
      return { data: null, isLoading: true, isError: false };
    });
  });

  it('should show empty state when no orders', () => {
    renderWithProviders(<MeseroOrdersPage />);

    expect(screen.getByText('Ninguna orden activa.')).toBeInTheDocument();
  });

  it('should show orders list when orders exist', () => {
    useQueryMock.mockImplementation(({ queryKey }: { queryKey: unknown[] }) => {
      const key = queryKey as [string, Record<string, unknown>?];
      if (key[0] === 'orders') return { data: { data: [{ id: 1, tableId: 1, status: 'draft', totalAmount: '100' }] }, isLoading: false, isError: false };
      if (key[0] === 'tables') return { data: { data: [{ id: 1, number: 1, name: null, status: 'occupied' }] }, isLoading: false, isError: false };
      return { data: null, isLoading: true, isError: false };
    });

    renderWithProviders(<MeseroOrdersPage />);

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('Borrador')).toBeInTheDocument();
  });

  it('should have new order button', () => {
    renderWithProviders(<MeseroOrdersPage />);

    expect(screen.getByText('Nueva Orden')).toBeInTheDocument();
  });
});
