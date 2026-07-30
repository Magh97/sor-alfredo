import { useState, useEffect } from 'react';

type AgeLevel = 'normal' | 'attention' | 'warning' | 'critical';

function getAgeLevel(minutes: number): AgeLevel {
  if (minutes < 5) return 'normal';
  if (minutes < 10) return 'attention';
  if (minutes < 15) return 'warning';
  return 'critical';
}

export function useOrderAge(createdAt: string): { minutes: number; level: AgeLevel } {
  const calc = () => {
    const diff = Date.now() - new Date(createdAt).getTime();
    return Math.floor(diff / 60000);
  };

  const [minutes, setMinutes] = useState(calc);
  const level = getAgeLevel(minutes);

  useEffect(() => {
    const id = setInterval(() => { setMinutes(calc); }, 10000);
    return () => { clearInterval(id); };
  }, [createdAt]);

  return { minutes, level };
}
