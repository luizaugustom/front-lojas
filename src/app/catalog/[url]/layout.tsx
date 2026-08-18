import { CatalogLightTheme } from './CatalogLightTheme';

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="catalog-root min-h-screen">
      <CatalogLightTheme />
      {children}
    </div>
  );
}
