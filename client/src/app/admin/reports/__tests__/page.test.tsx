import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminReportsPage } from '@/app/admin/reports/page';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/lib/api', () => ({
  api: vi.fn(),
  getStoredUser: vi.fn(() => ({ id: 1, role: 'admin', restaurantId: 1 })),
  getAccessToken: vi.fn(() => 'token'),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: vi.fn(() => vi.fn()) };
});

const { useQueryMock } = vi.hoisted(() => ({ useQueryMock: vi.fn() }));

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: (...args: unknown[]) => useQueryMock(...args),
    useMutation: () => ({ mutate: vi.fn(), isPending: false, error: null }),
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

describe('AdminReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQueryMock.mockReturnValue({ data: null, isLoading: true });
  });

  it('should render four tabs', () => {
    renderWithProviders(<AdminReportsPage />);
    expect(screen.getByText('Ventas')).toBeInTheDocument();
    expect(screen.getByText('Productos')).toBeInTheDocument();
    expect(screen.getByText('Meseros')).toBeInTheDocument();
    expect(screen.getByText('Caja')).toBeInTheDocument();
  });

  it('should show sales tab by default', () => {
    useQueryMock.mockReturnValue({ data: { data: [{ period: '2026-01-01', totalSales: '500', totalTips: '50', paymentCount: 3 }] }, isLoading: false });
    renderWithProviders(<AdminReportsPage />);
    expect(screen.getByText('$500.00')).toBeInTheDocument();
  });

  it('should switch to products tab', async () => {
    const user = userEvent.setup();
    useQueryMock.mockReturnValue({ data: { data: [] }, isLoading: false });
    renderWithProviders(<AdminReportsPage />);

    await user.click(screen.getByText('Productos'));

    expect(screen.getByText('Sin productos vendidos en este período.')).toBeInTheDocument();
  });

  it('should switch to meseros tab', async () => {
    const user = userEvent.setup();
    useQueryMock.mockReturnValue({ data: { data: [] }, isLoading: false });
    renderWithProviders(<AdminReportsPage />);

    await user.click(screen.getByText('Meseros'));

    expect(screen.getByText('Sin actividad de meseros en este período.')).toBeInTheDocument();
  });
});
