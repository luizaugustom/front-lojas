import CatalogPageClient from './CatalogPageClient';

export async function generateStaticParams() {
  return [];
}

export default function CatalogPage() {
  return <CatalogPageClient />;
}
