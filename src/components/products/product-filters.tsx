'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface ProductFilters {
  expiringSoon: boolean;
  lowStock: boolean;
}

interface ProductFiltersProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  activeFiltersCount: number;
}

export function ProductFilters({ filters, onFiltersChange, activeFiltersCount }: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof ProductFilters, value: boolean) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      expiringSoon: false,
      lowStock: false,
    });
  };

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Filter className="mr-2 h-4 w-4" />
        Filtros
        {hasActiveFilters && (
          <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
            {activeFiltersCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full z-10 mt-2 w-80 p-4 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Filtros</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Produtos com validade próxima/vencidos</label>
                <Button
                  variant={filters.expiringSoon ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange('expiringSoon', !filters.expiringSoon)}
                >
                  {filters.expiringSoon ? 'Ativo' : 'Inativo'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Estoque baixo</label>
                <Button
                  variant={filters.lowStock ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange('lowStock', !filters.lowStock)}
                >
                  {filters.lowStock ? 'Ativo' : 'Inativo'}
                </Button>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
