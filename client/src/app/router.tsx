import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/app/login/page';
import { AdminSidebar } from '@/components/layout/SidebarLayout';
import { AdminUsersPage } from '@/app/admin/users/page';
import { CajeroSidebar } from '@/components/layout/SidebarLayout';
import { BottomNavLayout } from '@/components/layout/BottomNavLayout';
import { KDSLayout } from '@/components/layout/KDSLayout';
import { getAccessToken, getStoredUser } from '@/lib/api';

type Role = 'waiter' | 'cashier' | 'admin' | 'superadmin';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: Role[] }) {
  const token = getAccessToken();
  if (!token) return <Navigate to="/login" replace />;

  if (roles) {
    const user = getStoredUser();
    if (!user || !roles.includes(user.role as Role)) {
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}

function Placeholder({ text }: { text: string }) {
  return (
    <div className="p-12 text-center font-['Caveat'] text-2xl text-[#8B7355]">{text} — Próximamente</div>
  );
}

const ADMIN_ROLES: Role[] = ['admin', 'superadmin'];
const CASHIER_ROLES: Role[] = ['cashier', 'admin', 'superadmin'];
const WAITER_ROLES: Role[] = ['waiter'];
const ALL_ROLES: Role[] = ['waiter', 'cashier', 'admin', 'superadmin'];

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
        <Route path="/admin/users" element={<ProtectedRoute roles={ADMIN_ROLES}>
          <AdminSidebar><AdminUsersPage /></AdminSidebar>
        </ProtectedRoute>} />
        <Route path="/admin/catalog" element={<ProtectedRoute roles={ADMIN_ROLES}>
          <AdminSidebar><Placeholder text="Catálogo" /></AdminSidebar>
        </ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute roles={ADMIN_ROLES}>
          <AdminSidebar><Placeholder text="Reportes" /></AdminSidebar>
        </ProtectedRoute>} />
        <Route path="/admin/config" element={<ProtectedRoute roles={ADMIN_ROLES}>
          <AdminSidebar><Placeholder text="Configuración" /></AdminSidebar>
        </ProtectedRoute>} />

        <Route path="/caja" element={<Navigate to="/caja/orders" replace />} />
        <Route path="/caja/orders" element={<ProtectedRoute roles={CASHIER_ROLES}>
          <CajeroSidebar><Placeholder text="Órdenes" /></CajeroSidebar>
        </ProtectedRoute>} />
        <Route path="/caja/register" element={<ProtectedRoute roles={CASHIER_ROLES}>
          <CajeroSidebar><Placeholder text="Caja" /></CajeroSidebar>
        </ProtectedRoute>} />
        <Route path="/caja/reports" element={<ProtectedRoute roles={CASHIER_ROLES}>
          <CajeroSidebar><Placeholder text="Reportes" /></CajeroSidebar>
        </ProtectedRoute>} />

        <Route path="/mesero" element={<Navigate to="/mesero/orders" replace />} />
        <Route path="/mesero/orders" element={<ProtectedRoute roles={WAITER_ROLES}>
          <BottomNavLayout title="Órdenes" activeNav="orders">
            <Placeholder text="Órdenes" />
          </BottomNavLayout>
        </ProtectedRoute>} />
        <Route path="/mesero/tables" element={<ProtectedRoute roles={WAITER_ROLES}>
          <BottomNavLayout title="Mesas" activeNav="tables">
            <Placeholder text="Mesas" />
          </BottomNavLayout>
        </ProtectedRoute>} />

        <Route path="/kds" element={<ProtectedRoute roles={ALL_ROLES}>
          <KDSLayout>
            <div className="flex items-center justify-center h-full">
              <p className="font-['JetBrains_Mono'] font-bold text-5xl text-[#F0E6D3] opacity-30">Esperando órdenes...</p>
            </div>
          </KDSLayout>
        </ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
