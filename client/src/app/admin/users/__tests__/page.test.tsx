import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminUsersPage } from '@/app/admin/users/page';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: () => true,
    loginError: null,
    isLoginLoading: false,
  })),
}));

const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();
const mockInvalidateQueries = vi.fn();

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: (...args: unknown[]) => mockUseQuery(...args),
    useMutation: (...args: unknown[]) => mockUseMutation(...args),
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  };
});

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>,
  );
}

describe('AdminUsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMutation.mockReturnValue({ mutate: vi.fn(), isPending: false, error: null });
    mockInvalidateQueries.mockResolvedValue(undefined);
  });

  it('should show skeleton while loading', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    renderWithProviders(<AdminUsersPage />);

    const skeletons = document.querySelectorAll('.skeleton-shimmer');
    expect(skeletons.length).toBe(4);
  });

  it('should show error message with retry button on error', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    renderWithProviders(<AdminUsersPage />);

    expect(screen.getByText('El tintero se ha volcado.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  it('should show poetic empty state when no users', () => {
    mockUseQuery.mockReturnValue({
      data: { data: [] },
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<AdminUsersPage />);

    expect(screen.getByText('Esta hoja está en blanco.')).toBeInTheDocument();
    expect(screen.getByText('El primer trazo es el más importante.')).toBeInTheDocument();
  });

  it('should render "+ Nuevo Usuario" button', () => {
    mockUseQuery.mockReturnValue({
      data: { data: [] },
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<AdminUsersPage />);

    expect(screen.getByRole('button', { name: '+ Nuevo Usuario' })).toBeInTheDocument();
  });

  it('should show create user modal when button is clicked', async () => {
    const user = userEvent.setup();
    mockUseQuery.mockReturnValue({
      data: { data: [] },
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<AdminUsersPage />);

    await user.click(screen.getByRole('button', { name: '+ Nuevo Usuario' }));

    expect(screen.getByRole('heading', { name: 'Nuevo Usuario' })).toBeInTheDocument();
  });

  it('should render users table with data', () => {
    const mockUsers = {
      data: [
        { id: 1, name: 'Juan Pérez', email: 'juan@test.com', role: 'waiter', isActive: true },
        { id: 2, name: 'María López', email: 'maria@test.com', role: 'admin', isActive: false },
      ],
    };
    mockUseQuery.mockReturnValue({
      data: mockUsers,
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<AdminUsersPage />);

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('María López')).toBeInTheDocument();
    expect(screen.getByText('juan@test.com')).toBeInTheDocument();
    expect(screen.getByText('maria@test.com')).toBeInTheDocument();
  });
});
