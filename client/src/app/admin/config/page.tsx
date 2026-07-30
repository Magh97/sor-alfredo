import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getStoredUser } from '@/lib/api';
import { Building2, Phone, MapPin, Calendar, KeyRound } from 'lucide-react';

interface Restaurant {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  createdAt: string;
}

export function AdminConfigPage() {
  const queryClient = useQueryClient();
  const user = getStoredUser();
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['restaurant'],
    queryFn: () => api<{ data: Restaurant }>('/restaurant'),
  });

  const passwordMutation = useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) =>
      api('/users/me/password', { method: 'PUT', body: JSON.stringify(input) }),
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordError(null);
      setTimeout(() => setPasswordSuccess(false), 3000);
    },
    onError: (err: { message?: string }) => {
      setPasswordError(err.message ?? 'Error al cambiar contraseña');
    },
  });

  function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    passwordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  }

  const restaurant = data?.data;

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="font-['Playfair_Display'] font-bold text-3xl text-[#2C1810]">Configuración</h2>

      <div className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-6"
        style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
        <h3 className="font-['DM_Sans'] font-bold text-sm uppercase tracking-[0.1em] text-[#5C4030] mb-4">Información del Restaurante</h3>

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-8 skeleton-shimmer" />
            <div className="h-5 skeleton-shimmer" />
            <div className="h-5 skeleton-shimmer" />
          </div>
        ) : restaurant ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Building2 size={20} className="text-[#6B1A2A]" />
              <span className="font-['Playfair_Display'] font-bold text-xl text-[#2C1810]">{restaurant.name}</span>
            </div>
            {restaurant.address && (
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-[#8B7355]" />
                <span className="font-['JetBrains_Mono'] text-sm text-[#5C4030]">{restaurant.address}</span>
              </div>
            )}
            {restaurant.phone && (
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-[#8B7355]" />
                <span className="font-['JetBrains_Mono'] text-sm text-[#5C4030]">{restaurant.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-[#8B7355]" />
              <span className="font-['JetBrains_Mono'] text-xs text-[#8B7355]">
                Creado: {new Date(restaurant.createdAt).toLocaleDateString('es-MX')}
              </span>
            </div>
          </div>
        ) : (
          <p className="font-['Caveat'] text-lg text-[#8B7355]">No se pudo cargar la información.</p>
        )}
      </div>

      <div className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-6"
        style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
        <h3 className="font-['DM_Sans'] font-bold text-sm uppercase tracking-[0.1em] text-[#5C4030] mb-4">Cambiar Contraseña</h3>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <p className="font-['JetBrains_Mono'] text-xs text-[#8B7355]">
            Sesión: {user?.name} ({user?.email})
          </p>

          <input
            type="password"
            placeholder="Contraseña actual"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            className="w-full border-2 border-[#8B7355] bg-white p-3 font-['JetBrains_Mono'] text-sm text-[#2C1810] focus:border-[#6B1A2A] focus:border-4 outline-none"
            required
          />
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            className="w-full border-2 border-[#8B7355] bg-white p-3 font-['JetBrains_Mono'] text-sm text-[#2C1810] focus:border-[#6B1A2A] focus:border-4 outline-none"
            required
            minLength={6}
          />
          <input
            type="password"
            placeholder="Confirmar nueva contraseña"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            className="w-full border-2 border-[#8B7355] bg-white p-3 font-['JetBrains_Mono'] text-sm text-[#2C1810] focus:border-[#6B1A2A] focus:border-4 outline-none"
            required
          />

          {passwordError && (
            <div className="bg-[#8B1A1A]/10 border-2 border-[#8B1A1A] p-3">
              <p className="font-['DM_Sans'] font-bold text-sm text-[#8B1A1A]">{passwordError}</p>
            </div>
          )}

          {passwordSuccess && (
            <div className="bg-[#2D4A22]/10 border-2 border-[#2D4A22] p-3">
              <p className="font-['DM_Sans'] font-bold text-sm text-[#2D4A22]">Contraseña actualizada correctamente.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={passwordMutation.isPending}
            className="bg-[#6B1A2A] text-[#F0E6D3] font-['DM_Sans'] font-bold text-sm uppercase tracking-[0.1em] px-6 py-3 hover:bg-[#8B2535] disabled:opacity-50"
          >
            <KeyRound size={16} className="inline mr-2" />
            {passwordMutation.isPending ? 'Cambiando...' : 'Cambiar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
