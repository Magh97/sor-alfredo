import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/shared/StatusBadge';

describe('StatusBadge', () => {
  it('should render label text', () => {
    render(<StatusBadge label="Activo" />);

    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it.each([
    { variant: 'primary', expectedClass: 'text-[#6B1A2A]' },
    { variant: 'success', expectedClass: 'text-[#2D4A22]' },
    { variant: 'warning', expectedClass: 'text-[#C9A84C]' },
    { variant: 'error', expectedClass: 'text-[#8B1A1A]' },
    { variant: 'info', expectedClass: 'text-[#3A5068]' },
    { variant: 'muted', expectedClass: 'text-[#8B7355]' },
  ] as const)('should render with $variant variant', ({ variant, expectedClass }) => {
    render(<StatusBadge label="Test" variant={variant} />);

    const badge = screen.getByText('Test');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain(expectedClass);
  });

  it('should default to primary variant when none provided', () => {
    render(<StatusBadge label="Default" />);

    const badge = screen.getByText('Default');
    expect(badge.className).toContain('text-[#6B1A2A]');
  });
});
