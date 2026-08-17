import type { CatalogConfig } from '@/lib/storefront-types';
import { SectionHeader } from './shared/SectionHeader';
import { ProductCard } from './shared/ProductCard';
import { ContactBlock } from './shared/ContactBlock';
import type { CatalogCompany, CatalogProduct, CatalogCategory } from '../SimpleCatalogRenderer';

type Props = {
  config: CatalogConfig;
  company: CatalogCompany;
  products: CatalogProduct[];
  categories: CatalogCategory[];
};

export function ModernTemplate({ config, company, products, categories }: Props) {
  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        color: config.colors.text,
        background: config.colors.background,
      }}
    >
      <header
        style={{
          padding: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottom: `1px solid ${config.colors.border}`,
        }}
      >
        {config.logoUrl && (
          <img
            src={config.logoUrl}
            alt={company.name}
            style={{ height: 32 }}
          />
        )}
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>
          {company.fantasyName || company.name}
        </h1>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          minHeight: 400,
        }}
      >
        <div
          style={{
            padding: 64,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <h2 style={{ fontSize: 48, fontWeight: 700, margin: 0 }}>
            {config.texts.heroTitle}
          </h2>
          <p style={{ marginTop: 16, color: config.colors.textMuted }}>
            {config.texts.heroSubtitle}
          </p>
        </div>
        {config.heroImageUrl && (
          <img
            src={config.heroImageUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </section>

      {categories.length > 0 && (
        <section style={{ padding: 64, maxWidth: 1200, margin: '0 auto' }}>
          <SectionHeader title="Categorias" align="left" />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map((c) => (
              <span
                key={c.id}
                style={{
                  padding: '8px 16px',
                  background: config.colors.surface,
                  borderRadius: 4,
                  fontSize: 14,
                }}
              >
                {c.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section style={{ padding: 64, maxWidth: 1200, margin: '0 auto' }}>
          <SectionHeader title="Produtos em destaque" align="left" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 12,
            }}
          >
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                whatsappMessage={`Olá! Tenho interesse no produto ${p.name}`}
              />
            ))}
          </div>
        </section>
      )}

      <section style={{ padding: 64, maxWidth: 720, margin: '0 auto' }}>
        <SectionHeader title={config.texts.aboutTitle} align="left" />
        <p style={{ lineHeight: 1.7 }}>{config.texts.aboutBody}</p>
      </section>

      <section style={{ padding: 64, maxWidth: 1200, margin: '0 auto' }}>
        <SectionHeader title="Contato" align="left" />
        <ContactBlock
          phone={company.phone}
          email={company.email}
          zipCode={company.zipCode}
          state={company.state}
          city={company.city}
          district={company.district}
          street={company.street}
          number={company.number}
          complement={company.complement}
        />
      </section>

      <footer
        style={{
          padding: 32,
          textAlign: 'center',
          fontSize: 13,
          color: config.colors.textMuted,
        }}
      >
        {config.texts.footerText ||
          `© ${new Date().getFullYear()} ${company.fantasyName || company.name}`}
      </footer>
    </div>
  );
}
