import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CajeroRegisterPage } from '@/app/caja/register/page';
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

describe('CajeroRegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show open turno when no active register', () => {
    useQueryMock.mockImplementation(({ queryKey }: { queryKey: unknown[] }) => {
      const key = queryKey as string[];
      if (key[0] === 'cash-register' && key[1] === 'current') return { data: null, isLoading: false };
      return { data: null, isLoading: true };
    });

    renderWithProviders(<CajeroRegisterPage />);
    expect(screen.getByText('No hay turno de caja abierto.')).toBeInTheDocument();
    expect(screen.getByText('Abrir Turno')).toBeInTheDocument();
  });

  it('should show register info when active', () => {
    useQueryMock.mockImplementation(({ queryKey }: { queryKey: unknown[] }) => {
      const key = queryKey as string[];
      if (key[0] === 'cash-register' && key[1] === 'current') return {
        data: { data: { id: 1, status: 'open', totalSales: '500', totalTips: '50', initialAmount: '200', openedAt: new Date().toISOString(), payments: [] } },
        isLoading: false,
      };
      return { data: null, isLoading: true };
    });

    renderWithProviders(<CajeroRegisterPage />);
    expect(screen.getByText('Cerrar Turno')).toBeInTheDocument();
    expect(screen.getByText('$500.00')).toBeInTheDocument();
  });
});
