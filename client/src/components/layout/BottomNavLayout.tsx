import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ClipboardList, Grid3X3, User } from 'lucide-react';

interface BottomNavLayoutProps {
  children: ReactNode;
  title: string;
  activeNav: 'orders' | 'tables' | 'profile';
}

export function BottomNavLayout({ children, title, activeNav }: BottomNavLayoutProps) {
  const { logout } = useAuth();

  const navItems = [
    { id: 'orders', label: 'Órdenes', icon: ClipboardList, href: '/mesero/orders' },
    { id: 'tables', label: 'Mesas', icon: Grid3X3, href: '/mesero/tables' },
    { id: 'profile', label: 'Perfil', icon: User, href: '#' },
  ] as const;

  return (
    <div className="flex flex-col h-dvh bg-white">
      <header className="h-14 bg-[#EBDCC4] border-b-4 border-[#6B1A2A] flex items-center px-4 shrink-0">
        <span className="font-['Playfair_Display'] font-black text-2xl text-[#6B1A2A]">Alfredo&apos;s</span>
        <h1 className="ml-4 font-['DM_Sans'] font-bold text-lg text-[#2C1810] uppercase tracking-tight">{title}</h1>
        <button
          onClick={logout}
          className="ml-auto font-['DM_Sans'] font-bold text-xs text-[#8B7355] uppercase tracking-[0.1em] py-2 px-3"
          aria-label="Cerrar sesión"
        >
          Salir
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4">{children}</main>

      <nav className="h-16 bg-[#EBDCC4] border-t-4 border-[#6B1A2A] flex items-center justify-around shrink-0">
        {navItems.map(({ id, label, icon: Icon, href }) => (
          <a
            key={id}
            href={id === 'profile' ? undefined : href}
            onClick={id === 'profile' ? logout : undefined}
            className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] px-4 py-2 font-['DM_Sans'] font-bold text-xs uppercase tracking-widest transition-colors duration-150 ${
              activeNav === id ? 'text-[#6B1A2A]' : 'text-[#8B7355]'
            }`}
            aria-label={label}
          >
            <Icon size={24} />
            <span className="mt-1">{label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
