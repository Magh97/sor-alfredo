import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BottomNavLayout } from '@/components/layout/BottomNavLayout';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ logout: vi.fn(), login: vi.fn(), isAuthenticated: vi.fn(), loginError: null, isLoginLoading: false })),
}));

describe('BottomNavLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render title text', () => {
    render(
      <BottomNavLayout title="Órdenes" activeNav="orders">
        <p>Content</p>
      </BottomNavLayout>,
    );

    expect(screen.getByRole('heading', { name: 'Órdenes' })).toBeInTheDocument();
  });

  it('should show 3 nav tabs: Órdenes, Mesas, Perfil', () => {
    render(
      <BottomNavLayout title="Mesero" activeNav="orders">
        <p>Content</p>
      </BottomNavLayout>,
    );

    expect(screen.getByText('Órdenes')).toBeInTheDocument();
    expect(screen.getByText('Mesas')).toBeInTheDocument();
    expect(screen.getByText('Perfil')).toBeInTheDocument();
  });

  it('should highlight active tab', () => {
    render(
      <BottomNavLayout title="Órdenes" activeNav="orders">
        <p>Content</p>
      </BottomNavLayout>,
    );

    const ordenesLink = screen.getByRole('link', { name: 'Órdenes' });
    expect(ordenesLink.className).toContain('text-[#6B1A2A]');

    const mesasLink = screen.getByRole('link', { name: 'Mesas' });
    expect(mesasLink.className).toContain('text-[#8B7355]');
  });

  it('should have logout button with aria-label "Cerrar sesión"', () => {
    render(
      <BottomNavLayout title="Mesero" activeNav="orders">
        <p>Content</p>
      </BottomNavLayout>,
    );

    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument();
    expect(screen.getByText('Salir')).toBeInTheDocument();
  });
});
