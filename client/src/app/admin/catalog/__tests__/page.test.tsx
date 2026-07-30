import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminCatalogPage } from '@/app/admin/catalog/page';

vi.mock('@/lib/api', () => ({
  api: vi.fn(),
  getStoredUser: vi.fn(() => null),
  getAccessToken: vi.fn(() => null),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: vi.fn(() => vi.fn()) };
});

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ login: vi.fn(), logout: vi.fn(), isAuthenticated: () => true, loginError: null, isLoginLoading: false })),
}));

const { useQueryMock, useMutationMock, invalidateMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  useMutationMock: vi.fn(),
  invalidateMock: vi.fn(),
}));

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: (...args: unknown[]) => useQueryMock(...args),
    useMutation: (...args: unknown[]) => useMutationMock(...args),
    useQueryClient: () => ({ invalidateQueries: invalidateMock }),
  };
});

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {ui}
    </QueryClientProvider>,
  );
}

describe('AdminCatalogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMutationMock.mockReturnValue({ mutate: vi.fn(), isPending: false, error: null });
    useQueryMock.mockImplementation(({ queryKey }: { queryKey: string[] }) => {
      if (queryKey[0] === 'catalog' && queryKey[1] === 'categories') return { data: { data: [] }, isLoading: false };
      if (queryKey[0] === 'catalog' && queryKey[1] === 'products') return { data: { data: [] }, isLoading: false };
      if (queryKey[0] === 'catalog' && queryKey[1] === 'modifiers') return { data: { data: [] }, isLoading: false };
      return { data: null, isLoading: true };
    });
  });

  it('should render three tabs', () => {
    renderWithProviders(<AdminCatalogPage />);

    expect(screen.getByText(/Productos/)).toBeInTheDocument();
    expect(screen.getByText(/Categorías/)).toBeInTheDocument();
    expect(screen.getByText(/Modificadores/)).toBeInTheDocument();
  });

  it('should show products tab by default', async () => {
    renderWithProviders(<AdminCatalogPage />);

    expect(screen.getByText('Nuevo Producto')).toBeInTheDocument();
  });

  it('should switch to categories tab', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminCatalogPage />);

    await user.click(screen.getByText(/Categorías/));

    expect(screen.getByText('Sin categorías aún.')).toBeInTheDocument();
  });

  it('should switch to modifiers tab', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminCatalogPage />);

    await user.click(screen.getByText(/Modificadores/));

    expect(screen.getByText('Sin modificadores aún.')).toBeInTheDocument();
  });
});
