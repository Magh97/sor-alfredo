import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SidebarLayout } from '@/components/layout/SidebarLayout';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ logout: vi.fn(), login: vi.fn(), isAuthenticated: vi.fn(), loginError: null, isLoginLoading: false })),
}));

const mockNavItems = [
  { label: 'Usuarios', icon: <span data-testid="icon-users">U</span>, href: '/admin/users' },
  { label: 'Catálogo', icon: <span data-testid="icon-catalog">C</span>, href: '/admin/catalog' },
];

function renderSidebar(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('SidebarLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render title text', () => {
    renderSidebar(
      <SidebarLayout title="Administración" navItems={mockNavItems}>
        <p>Content</p>
      </SidebarLayout>,
    );

    expect(screen.getByRole('heading', { name: 'Administración' })).toBeInTheDocument();
  });

  it('should render nav items from props', () => {
    renderSidebar(
      <SidebarLayout title="Test" navItems={mockNavItems}>
        <p>Content</p>
      </SidebarLayout>,
    );

    expect(screen.getByText('Usuarios')).toBeInTheDocument();
    expect(screen.getByText('Catálogo')).toBeInTheDocument();
  });

  it('should render children content', () => {
    renderSidebar(
      <SidebarLayout title="Test" navItems={mockNavItems}>
        <p>Hello World</p>
      </SidebarLayout>,
    );

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should have logout button with aria-label "Cerrar sesión"', () => {
    renderSidebar(
      <SidebarLayout title="Test" navItems={mockNavItems}>
        <p>Content</p>
      </SidebarLayout>,
    );

    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument();
  });
});
