import CatalogPageClient from './CatalogPageClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Catálogo',
  description: 'Catálogo de produtos',
};

export default function CatalogPage() {
  return <CatalogPageClient />;
}
