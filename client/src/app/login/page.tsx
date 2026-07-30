import { useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginError, isLoginLoading } = useAuth();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    login({ email, password });
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-12 w-full max-w-md"
        style={{
          clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)',
        }}
      >
        <h1 className="font-['Playfair_Display'] font-black text-5xl text-[#6B1A2A] text-center tracking-tight">
          Alfredo&apos;s
        </h1>
        <p className="font-['Caveat'] text-xl text-[#8B7355] text-center mt-2">El buen servicio empieza aquí</p>

        <div className="mt-10 space-y-5">
          <div>
            <label className="font-['DM_Sans'] font-bold text-sm uppercase tracking-widest text-[#5C4030]">
              Correo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); }}
              className="mt-1 w-full border-2 border-[#8B7355] bg-white p-3 font-['JetBrains_Mono'] text-lg text-[#2C1810] focus:border-[#6B1A2A] focus:border-4 outline-none"
              placeholder="admin@restaurant.com"
              required
            />
          </div>

          <div>
            <label className="font-['DM_Sans'] font-bold text-sm uppercase tracking-widest text-[#5C4030]">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); }}
              className="mt-1 w-full border-2 border-[#8B7355] bg-white p-3 font-['JetBrains_Mono'] text-lg text-[#2C1810] focus:border-[#6B1A2A] focus:border-4 outline-none"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {loginError && (
          <div className="mt-6 bg-[#8B1A1A]/10 border-2 border-[#8B1A1A] p-3">
            <p className="font-['DM_Sans'] font-bold text-sm text-[#8B1A1A]">
              {loginError.message ?? 'Error al iniciar sesión'}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoginLoading}
          className="mt-8 w-full bg-[#6B1A2A] text-[#F0E6D3] font-['DM_Sans'] font-bold text-sm uppercase tracking-[0.1em] p-4 hover:bg-[#8B2535] active:bg-[#4A0F1B] transition-colors duration-150 disabled:opacity-50"
        >
          {isLoginLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
