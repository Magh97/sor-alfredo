import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BottomNavLayout } from '@/components/layout/BottomNavLayout';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ logout: vi.fn(), login: vi.fn(), isAuthenticated: vi.fn(), loginError: null, isLoginLoading: false })),
}));

function renderBottomNav(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('BottomNavLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render title text', () => {
    renderBottomNav(
      <BottomNavLayout title="Órdenes" activeNav="orders">
        <p>Content</p>
      </BottomNavLayout>,
    );

    expect(screen.getByRole('heading', { name: 'Órdenes' })).toBeInTheDocument();
  });

  it('should show 3 nav tabs: Órdenes, Mesas, Perfil', () => {
    renderBottomNav(
      <BottomNavLayout title="Mesero" activeNav="orders">
        <p>Content</p>
      </BottomNavLayout>,
    );

    expect(screen.getByText('Órdenes')).toBeInTheDocument();
    expect(screen.getByText('Mesas')).toBeInTheDocument();
    expect(screen.getByText('Perfil')).toBeInTheDocument();
  });

  it('should highlight active tab', () => {
    renderBottomNav(
      <BottomNavLayout title="Órdenes" activeNav="orders">
        <p>Content</p>
      </BottomNavLayout>,
    );

    const links = screen.getAllByRole('link');
    expect(links.length).toBe(2);
  });

  it('should have logout button with aria-label "Cerrar sesión"', () => {
    renderBottomNav(
      <BottomNavLayout title="Mesero" activeNav="orders">
        <p>Content</p>
      </BottomNavLayout>,
    );

    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument();
  });
});
