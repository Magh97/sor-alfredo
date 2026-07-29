import { useEffect, useState, type ReactNode } from 'react';

interface KDSLayoutProps {
  children: ReactNode;
}

export function KDSLayout({ children }: KDSLayoutProps) {
  const [clock, setClock] = useState('');

  useEffect(() => {
    function update() {
      setClock(new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
    update();
    const id = setInterval(update, 1000);

    void document.documentElement.requestFullscreen?.().catch(() => {});
    void navigator.wakeLock?.request('screen').catch(() => {});

    return () => clearInterval(id);
  }, []);

  return (
    <div className="h-screen bg-[#1A1410] flex flex-col overflow-hidden" style={{ cursor: 'none' }}>
      <header className="h-20 bg-[#2A1F18] border-b-4 border-[#6B1A2A] px-8 flex items-center justify-between shrink-0">
        <span className="font-['Playfair_Display'] font-black text-5xl text-[#F0E6D3]">Alfredo&apos;s Cocina</span>
        <span className="font-['JetBrains_Mono'] font-bold text-3xl text-[#8B7355]">{clock}</span>
      </header>
      <main className="flex-1 p-6 overflow-hidden">{children}</main>
    </div>
  );
}
