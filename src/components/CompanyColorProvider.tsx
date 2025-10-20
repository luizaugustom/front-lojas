'use client';

import { useEffect } from 'react';
import { useCompany } from '@/hooks/useCompany';
import { useUIStore } from '@/store/ui-store';

export function CompanyColorProvider({ children }: { children: React.ReactNode }) {
  const setCompanyColor = useUIStore((state) => state.setCompanyColor);
  const { brandColor } = useCompany();

  // Atualiza a cor da empresa quando ela mudar
  useEffect(() => {
    setCompanyColor(brandColor);
  }, [brandColor, setCompanyColor]);

  return <>{children}</>;
}
