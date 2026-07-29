import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KDSLayout } from '@/components/layout/KDSLayout';

describe('KDSLayout', () => {
  let requestFullscreenMock: ReturnType<typeof vi.fn>;
  let wakeLockMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    requestFullscreenMock = vi.fn().mockResolvedValue(undefined);
    wakeLockMock = vi.fn().mockResolvedValue({});

    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      value: requestFullscreenMock,
      configurable: true,
      writable: true,
    });

    Object.defineProperty(navigator, 'wakeLock', {
      value: { request: wakeLockMock },
      configurable: true,
      writable: true,
    });

    vi.useFakeTimers({ shouldAdvanceTime: false });
  });

  it('should render "Alfredo\'s Cocina" title', () => {
    render(
      <KDSLayout>
        <p>Content</p>
      </KDSLayout>,
    );

    expect(screen.getByText("Alfredo's Cocina")).toBeInTheDocument();
  });

  it('should have dark background', () => {
    render(
      <KDSLayout>
        <p>Content</p>
      </KDSLayout>,
    );

    const container = screen.getByText("Alfredo's Cocina").closest('div.h-screen');
    expect(container).not.toBeNull();
    expect(container!.className).toContain('bg-[#1A1410]');
  });

  it('should display a clock element', () => {
    render(
      <KDSLayout>
        <p>Content</p>
      </KDSLayout>,
    );

    const header = screen.getByText("Alfredo's Cocina").closest('header');
    const timeRegex = /\d{2}:\d{2}:\d{2}/;
    expect(header?.textContent).toMatch(timeRegex);
  });

  it('should attempt requestFullscreen on mount', () => {
    render(
      <KDSLayout>
        <p>Content</p>
      </KDSLayout>,
    );

    expect(requestFullscreenMock).toHaveBeenCalled();
  });

  it('should attempt wakeLock request on mount', () => {
    render(
      <KDSLayout>
        <p>Content</p>
      </KDSLayout>,
    );

    expect(wakeLockMock).toHaveBeenCalledWith('screen');
  });
});
