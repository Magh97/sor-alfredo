import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Users, Package, BarChart3, Settings } from 'lucide-react';

interface SidebarLayoutProps {
  children: ReactNode;
  title: string;
  navItems: Array<{ label: string; icon: ReactNode; href: string; active?: boolean }>;
}

export function SidebarLayout({ children, title, navItems }: SidebarLayoutProps) {
  const { logout } = useAuth();

  return (
    <div className="flex h-screen bg-white">
      <aside className="w-64 bg-[#EBDCC4] border-r-4 border-[#6B1A2A] flex flex-col shrink-0">
        <div className="h-14 px-5 border-b-4 border-[#6B1A2A] flex items-center">
          <span className="font-['Playfair_Display'] font-black text-2xl text-[#6B1A2A]">Alfredo&apos;s</span>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-3">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-3 font-[\'DM_Sans\'] font-bold text-sm uppercase tracking-widest transition-colors duration-150',
                item.active
                  ? 'bg-[#6B1A2A] text-[#F0E6D3]'
                  : 'text-[#5C4030] hover:bg-[#E5D4B8]',
              )}
            >
              <span className={item.active ? 'text-[#F0E6D3]' : 'text-[#6B1A2A]'}>
                {item.icon}
              </span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="p-4 border-t-4 border-[#6B1A2A]">
          <button
            onClick={logout}
            className="w-full font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#8B7355] hover:text-[#6B1A2A] py-2 text-left"
            aria-label="Cerrar sesión"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-[#EBDCC4] border-b-4 border-[#6B1A2A] px-5 flex items-center shrink-0">
          <h1 className="font-['DM_Sans'] font-bold text-2xl text-[#2C1810] uppercase tracking-tight">{title}</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-5">{children}</main>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const navItems = [
    { label: 'Usuarios', icon: <Users size={18} />, href: '/admin/users', active: true },
    { label: 'Catálogo', icon: <Package size={18} />, href: '/admin/catalog' },
    { label: 'Reportes', icon: <BarChart3 size={18} />, href: '/admin/reports' },
    { label: 'Configuración', icon: <Settings size={18} />, href: '/admin/config' },
  ];

  return <SidebarLayout title="Administración" navItems={navItems}>
    <div className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-12 text-center"
      style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
      <h2 className="font-['Playfair_Display'] font-bold text-4xl text-[#6B1A2A]">Panel de Administración</h2>
      <p className="font-['Caveat'] text-xl text-[#8B7355] mt-2">Selecciona una sección para comenzar</p>
    </div>
  </SidebarLayout>;
}

export function CajeroSidebar() {
  const navItems = [
    { label: 'Órdenes', icon: <Package size={18} />, href: '/caja/orders', active: true },
    { label: 'Caja', icon: <BarChart3 size={18} />, href: '/caja/register' },
    { label: 'Reportes', icon: <BarChart3 size={18} />, href: '/caja/reports' },
  ];

  return <SidebarLayout title="Caja" navItems={navItems}>
    <div className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-12 text-center"
      style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
      <h2 className="font-['Playfair_Display'] font-bold text-4xl text-[#6B1A2A]">Panel de Caja</h2>
      <p className="font-['Caveat'] text-xl text-[#8B7355] mt-2">Selecciona una sección para comenzar</p>
    </div>
  </SidebarLayout>;
}
