import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from '@/components/shared/Skeleton';

describe('Skeleton', () => {
  it('should render row variant by default', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('h-14');
  });

  it('should render card variant', () => {
    const { container } = render(<Skeleton variant="card" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('h-36');
  });

  it('should render kds variant', () => {
    const { container } = render(<Skeleton variant="kds" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('h-72');
  });
});
