import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Buscar...' }: SearchBarProps) {
  return (
    <div className="relative">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B7355]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border-2 border-[#8B7355] bg-white pl-10 pr-3 py-3 font-['JetBrains_Mono'] text-sm text-[#2C1810] focus:border-[#6B1A2A] focus:border-4 outline-none"
      />
    </div>
  );
}
