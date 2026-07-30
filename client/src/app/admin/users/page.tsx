import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ROLE_LABELS } from '@/lib/constants';
import type { Role } from '@/lib/constants';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: Role;
}

const EMPTY_FORM: UserForm = { name: '', email: '', password: '', role: 'waiter' };

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: () => api<{ data: User[] }>('/users'),
  });

  const createMutation = useMutation({
    mutationFn: (input: UserForm) =>
      api('/users', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowCreate(false);
      setForm(EMPTY_FORM);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<UserForm> }) =>
      api(`/users/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingUser(null);
      setForm(EMPTY_FORM);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => api(`/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  function openCreate() {
    setForm(EMPTY_FORM);
    setShowCreate(true);
  }

  function openEdit(user: User) {
    setForm({ name: user.name, email: user.email, password: '', role: user.role as Role });
    setEditingUser(user);
  }

  function closeModal() {
    setShowCreate(false);
    setEditingUser(null);
    setForm(EMPTY_FORM);
  }

  const isModalOpen = showCreate || editingUser !== null;
  const activeMutation = editingUser ? updateMutation : createMutation;
  const modalTitle = editingUser ? 'Editar Usuario' : 'Nuevo Usuario';

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 skeleton-shimmer" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-[#8B1A1A]/10 border-2 border-[#8B1A1A] p-4">
        <p className="font-['DM_Sans'] font-bold text-sm text-[#8B1A1A]">El tintero se ha volcado.</p>
        <button onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
          className="mt-2 font-['DM_Sans'] font-bold text-xs uppercase text-[#8B7355] hover:text-[#6B1A2A]">
          Reintentar
        </button>
      </div>
    );
  }

  const users = data?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-['Playfair_Display'] font-bold text-3xl text-[#2C1810]">
          {users.length} Usuarios
        </h2>
        <button
          onClick={openCreate}
          className="bg-[#6B1A2A] text-[#F0E6D3] font-['DM_Sans'] font-bold text-sm uppercase tracking-[0.1em] px-6 py-3 hover:bg-[#8B2535] active:bg-[#4A0F1B] transition-colors duration-150"
        >
          + Nuevo Usuario
        </button>
      </div>

      {users.length === 0 ? (
        <div className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-12 text-center"
          style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
          <p className="font-['Caveat'] text-2xl text-[#8B7355]">Esta hoja está en blanco.</p>
          <p className="font-['Caveat'] text-lg text-[#8B7355] mt-1">El primer trazo es el más importante.</p>
        </div>
      ) : (
        <div className="border-4 border-[#6B1A2A]">
          <table className="w-full">
            <thead>
              <tr className="bg-[#EBDCC4] border-b-4 border-[#6B1A2A]">
                <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#5C4030]">Nombre</th>
                <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#5C4030]">Email</th>
                <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#5C4030]">Rol</th>
                <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#5C4030]">Estado</th>
                <th className="text-right p-4 font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#5C4030]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b-2 border-[#8B7355]/30 last:border-0 bg-white hover:bg-[#EBDCC4]/30 transition-colors">
                  <td className="p-4 font-['Playfair_Display'] font-bold text-lg text-[#2C1810]">{user.name}</td>
                  <td className="p-4 font-['JetBrains_Mono'] text-sm text-[#5C4030]">{user.email}</td>
                  <td className="p-4">
                    <StatusBadge
                      label={ROLE_LABELS[user.role as Role] ?? user.role}
                      variant={user.role === 'admin' ? 'error' : user.role === 'cashier' ? 'info' : user.role === 'waiter' ? 'success' : 'warning'}
                    />
                  </td>
                  <td className="p-4">
                    <StatusBadge
                      label={user.isActive ? 'Activo' : 'Inactivo'}
                      variant={user.isActive ? 'success' : 'muted'}
                    />
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => { openEdit(user); }}
                      className="font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#8B7355] hover:text-[#6B1A2A] px-3 py-2"
                    >
                      Editar
                    </button>
                    {user.isActive && (
                      <button
                        onClick={() => { deactivateMutation.mutate(user.id); }}
                        className="font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#8B1A1A] hover:text-[#6B1A2A] px-3 py-2"
                      >
                        Desactivar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#2C1810]/50 flex items-center justify-center z-50 p-6">
          <div className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-8 w-full max-w-md"
            style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
            <h3 className="font-['Playfair_Display'] font-bold text-3xl text-[#6B1A2A]">{modalTitle}</h3>

            <div className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="Nombre"
                value={form.name}
                onChange={(e) => { setForm({ ...form, name: e.target.value }); }}
                className="w-full border-2 border-[#8B7355] bg-white p-3 font-['JetBrains_Mono'] text-lg text-[#2C1810] focus:border-[#6B1A2A] focus:border-4 outline-none"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); }}
                className="w-full border-2 border-[#8B7355] bg-white p-3 font-['JetBrains_Mono'] text-lg text-[#2C1810] focus:border-[#6B1A2A] focus:border-4 outline-none"
              />
              <input
                type="password"
                placeholder={editingUser ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                value={form.password}
                onChange={(e) => { setForm({ ...form, password: e.target.value }); }}
                className="w-full border-2 border-[#8B7355] bg-white p-3 font-['JetBrains_Mono'] text-lg text-[#2C1810] focus:border-[#6B1A2A] focus:border-4 outline-none"
              />
              <select
                value={form.role}
                onChange={(e) => { setForm({ ...form, role: e.target.value as Role }); }}
                className="w-full border-2 border-[#8B7355] bg-white p-3 font-['JetBrains_Mono'] text-lg text-[#2C1810] focus:border-[#6B1A2A] focus:border-4 outline-none"
              >
                <option value="waiter">Mesero</option>
                <option value="cashier">Cajero</option>
                <option value="admin">Administrador</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>

            {activeMutation.error && (
              <p className="mt-4 font-['DM_Sans'] font-bold text-sm text-[#8B1A1A]">
                {(activeMutation.error as { message?: string }).message ?? 'Error al guardar'}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 border-2 border-[#6B1A2A] text-[#6B1A2A] font-['DM_Sans'] font-bold text-sm uppercase tracking-[0.1em] p-3 hover:bg-[#EBDCC4]"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const payload = editingUser
                    ? Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ''))
                    : form;
                  if (editingUser) {
                    updateMutation.mutate({ id: editingUser.id, input: payload });
                  } else {
                    createMutation.mutate(form);
                  }
                }}
                disabled={activeMutation.isPending}
                className="flex-1 bg-[#6B1A2A] text-[#F0E6D3] font-['DM_Sans'] font-bold text-sm uppercase tracking-[0.1em] p-3 hover:bg-[#8B2535] disabled:opacity-50"
              >
                {activeMutation.isPending ? 'Guardando...' : editingUser ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
