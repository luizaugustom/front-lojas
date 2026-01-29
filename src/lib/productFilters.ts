import type { Product } from '@/types';

export interface ProductFilters {
  expiringSoon: boolean;
  lowStock: boolean;
}

export function applyProductFilters(products: Product[], filters: ProductFilters): Product[] {
  if (!filters.expiringSoon && !filters.lowStock) {
    return products;
  }

  return products.filter(product => {
    let matches = true;

    // Filtro de validade próxima/vencidos
    if (filters.expiringSoon) {
      const hasExpirationDate = product.expirationDate && product.expirationDate !== 'null';
      if (hasExpirationDate && product.expirationDate) {
        const expirationDate = new Date(product.expirationDate);
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        // Produto vencido ou com validade próxima (30 dias)
        const isExpiringSoon = expirationDate <= thirtyDaysFromNow;
        matches = matches && isExpiringSoon;
      } else {
        // Se não tem data de validade, não inclui no filtro
        matches = false;
      }
    }

    // Filtro de estoque baixo (3 ou menos unidades)
    if (filters.lowStock) {
      const stockNum = Number(product.stockQuantity ?? 0);
      const threshold = product.lowStockAlertThreshold ?? 3;
      const isLowStock = !Number.isNaN(stockNum) && stockNum <= threshold;
      matches = matches && isLowStock;
    }

    return matches;
  });
}

export function getActiveFiltersCount(filters: ProductFilters): number {
  let count = 0;
  if (filters.expiringSoon) count++;
  if (filters.lowStock) count++;
  return count;
}
