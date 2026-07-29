import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-12"
        style={{
          clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)',
        }}>
        <h1 className="font-['Playfair_Display'] font-black text-[8vw] text-[#6B1A2A] tracking-tight">
          Alfredo's
        </h1>
        <p className="font-['JetBrains_Mono'] text-[#2D4A22] text-2xl mt-4">
          Sistema listo.
        </p>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
