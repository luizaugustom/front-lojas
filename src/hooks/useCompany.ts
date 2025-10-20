'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Company } from '@/types';

export function useCompany() {
  const { isAuthenticated, api, user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.companyId) {
      setCompany(null);
      return;
    }

    const fetchCompany = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.get('/company');
        setCompany(response.data);
      } catch (err: any) {
        console.error('Erro ao buscar dados da empresa:', err);
        setError(err?.response?.data?.message || 'Erro ao carregar dados da empresa');
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [isAuthenticated, user?.companyId, api]);

  return {
    company,
    loading,
    error,
    brandColor: company?.brandColor || null,
  };
}
