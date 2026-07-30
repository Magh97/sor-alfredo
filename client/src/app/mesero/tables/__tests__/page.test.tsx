import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MeseroTablesPage } from '@/app/mesero/tables/page';

vi.mock('@/lib/api', () => ({
  api: vi.fn(),
  getStoredUser: vi.fn(() => ({ id: 2, role: 'waiter', restaurantId: 1 })),
  getAccessToken: vi.fn(() => 'token'),
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
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

describe('MeseroTablesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show skeleton while loading', () => {
    useQueryMock.mockReturnValue({ data: null, isLoading: true, isError: false });

    renderWithProviders(<MeseroTablesPage />);

    const skeletons = document.querySelectorAll('.skeleton-shimmer');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should show tables grid when loaded', () => {
    useQueryMock.mockReturnValue({
      data: { data: [{ id: 1, number: 1, name: null, capacity: 4, positionX: 0, positionY: 0, status: 'free' }] },
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<MeseroTablesPage />);

    expect(screen.getByText('1 Mesas')).toBeInTheDocument();
    expect(screen.getByText('Libre')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    useQueryMock.mockReturnValue({ data: null, isLoading: false, isError: true });

    renderWithProviders(<MeseroTablesPage />);

    expect(screen.getByText('El tintero se ha volcado.')).toBeInTheDocument();
  });
});
