import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SearchBar } from '@/components/shared/SearchBar';
import userEvent from '@testing-library/user-event';

describe('SearchBar', () => {
  it('should render placeholder text', () => {
    render(<SearchBar value="" onChange={() => {}} placeholder="Buscar productos..." />);

    expect(screen.getByPlaceholderText('Buscar productos...')).toBeInTheDocument();
  });

  it('should call onChange when typing', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<SearchBar value="" onChange={onChange} />);

    await user.type(screen.getByPlaceholderText('Buscar...'), 'guacamole');

    expect(onChange).toHaveBeenCalled();
  });
});
