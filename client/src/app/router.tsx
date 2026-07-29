import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/app/login/page';
import { AdminSidebar } from '@/components/layout/SidebarLayout';
import { AdminUsersPage } from '@/app/admin/users/page';
import { CajeroSidebar } from '@/components/layout/SidebarLayout';
import { BottomNavLayout } from '@/components/layout/BottomNavLayout';
import { KDSLayout } from '@/components/layout/KDSLayout';
import { getAccessToken } from '@/lib/api';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = getAccessToken();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<ProtectedRoute><AdminSidebar /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute>
          <AdminSidebar><AdminUsersPage /></AdminSidebar>
        </ProtectedRoute>} />
        <Route path="/admin/catalog" element={<ProtectedRoute>
          <AdminSidebar><div className="p-12 text-center font-['Caveat'] text-2xl text-[#8B7355]">Catálogo — Próximamente</div></AdminSidebar>
        </ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute>
          <AdminSidebar><div className="p-12 text-center font-['Caveat'] text-2xl text-[#8B7355]">Reportes — Próximamente</div></AdminSidebar>
        </ProtectedRoute>} />
        <Route path="/caja" element={<ProtectedRoute><CajeroSidebar /></ProtectedRoute>} />
        <Route path="/caja/orders" element={<ProtectedRoute>
          <CajeroSidebar><div className="p-12 text-center font-['Caveat'] text-2xl text-[#8B7355]">Órdenes — Próximamente</div></CajeroSidebar>
        </ProtectedRoute>} />
        <Route path="/caja/register" element={<ProtectedRoute>
          <CajeroSidebar><div className="p-12 text-center font-['Caveat'] text-2xl text-[#8B7355]">Caja — Próximamente</div></CajeroSidebar>
        </ProtectedRoute>} />
        <Route path="/mesero" element={<ProtectedRoute>
          <BottomNavLayout title="Mesero" activeNav="orders">
            <div className="p-12 text-center font-['Caveat'] text-2xl text-[#8B7355]">Órdenes — Próximamente</div>
          </BottomNavLayout>
        </ProtectedRoute>} />
        <Route path="/mesero/orders" element={<ProtectedRoute>
          <BottomNavLayout title="Órdenes" activeNav="orders">
            <div className="p-12 text-center font-['Caveat'] text-2xl text-[#8B7355]">Órdenes — Próximamente</div>
          </BottomNavLayout>
        </ProtectedRoute>} />
        <Route path="/mesero/tables" element={<ProtectedRoute>
          <BottomNavLayout title="Mesas" activeNav="tables">
            <div className="p-12 text-center font-['Caveat'] text-2xl text-[#8B7355]">Mesas — Próximamente</div>
          </BottomNavLayout>
        </ProtectedRoute>} />
        <Route path="/kds" element={
          <KDSLayout>
            <div className="flex items-center justify-center h-full">
              <p className="font-['JetBrains_Mono'] font-bold text-5xl text-[#F0E6D3] opacity-30">Esperando órdenes...</p>
            </div>
          </KDSLayout>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
