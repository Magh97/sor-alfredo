import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from '@/app/login/page';

const mockLogin = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

async function renderLoginPage(
  overrides: { loginError?: { message?: string } | null; isLoginLoading?: boolean } = {},
) {
  const { useAuth } = await import('@/hooks/useAuth');
  vi.mocked(useAuth).mockReturnValue({
    login: mockLogin,
    logout: vi.fn(),
    isAuthenticated: () => false,
    loginError: overrides.loginError ?? null,
    isLoginLoading: overrides.isLoginLoading ?? false,
  });

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <LoginPage />
    </QueryClientProvider>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render Alfredo's heading", async () => {
    await renderLoginPage();

    expect(screen.getByRole('heading', { name: "Alfredo's" })).toBeInTheDocument();
  });

  it('should render email input with placeholder "admin@restaurant.com"', async () => {
    await renderLoginPage();

    expect(screen.getByPlaceholderText('admin@restaurant.com')).toBeInTheDocument();
  });

  it('should render password input with placeholder "••••••••"', async () => {
    await renderLoginPage();

    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('should render "Entrar" button', async () => {
    await renderLoginPage();

    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('should show error message when loginError is provided', async () => {
    const error = { message: 'Credenciales inválidas' };
    await renderLoginPage({ loginError: error });

    expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
  });

  it('should show "Entrando..." on button when isLoading', async () => {
    await renderLoginPage({ isLoginLoading: true });

    expect(screen.getByRole('button', { name: 'Entrando...' })).toBeInTheDocument();
  });

  it('should call login with credentials on form submit', async () => {
    const user = userEvent.setup();
    await renderLoginPage();

    await user.type(screen.getByPlaceholderText('admin@restaurant.com'), 'a@b.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'pass123');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(mockLogin).toHaveBeenCalledWith({ email: 'a@b.com', password: 'pass123' });
  });
});
