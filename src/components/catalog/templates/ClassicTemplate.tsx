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

export function ClassicTemplate({ config, company, products, categories }: Props) {
  return (
    <div
      style={{
        fontFamily: "'Lato', sans-serif",
        color: config.colors.text,
        background: config.colors.background,
      }}
    >
      <header
        style={{
          padding: 16,
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
            style={{ height: 40 }}
          />
        )}
        <h1
          style={{
            margin: 0,
            fontFamily: "'Playfair Display', serif",
            fontSize: 22,
          }}
        >
          {company.fantasyName || company.name}
        </h1>
      </header>

      <section
        style={{
          position: 'relative',
          minHeight: 320,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {config.heroImageUrl && (
          <img
            src={config.heroImageUrl}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.85,
            }}
          />
        )}
        <div
          style={{
            position: 'relative',
            padding: 32,
            background: 'rgba(255,255,255,0.85)',
            borderRadius: 8,
            maxWidth: 640,
          }}
        >
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 36,
              margin: 0,
            }}
          >
            {config.texts.heroTitle}
          </h2>
          <p style={{ marginTop: 8 }}>{config.texts.heroSubtitle}</p>
        </div>
      </section>

      {categories.length > 0 && (
        <section style={{ padding: 48, maxWidth: 1200, margin: '0 auto' }}>
          <SectionHeader title="Categorias" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 12,
            }}
          >
            {categories.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: 16,
                  background: config.colors.surface,
                  borderRadius: 8,
                  textAlign: 'center',
                }}
              >
                {c.name}
              </div>
            ))}
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section style={{ padding: 48, maxWidth: 1200, margin: '0 auto' }}>
          <SectionHeader title="Produtos em destaque" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 16,
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

      <section style={{ padding: 48, maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <SectionHeader title={config.texts.aboutTitle} />
        <p style={{ lineHeight: 1.7 }}>{config.texts.aboutBody}</p>
      </section>

      <section style={{ padding: 48, maxWidth: 800, margin: '0 auto' }}>
        <SectionHeader title="Contato" />
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
          padding: 24,
          textAlign: 'center',
          borderTop: `1px solid ${config.colors.border}`,
          fontSize: 14,
        }}
      >
        {config.texts.footerText ||
          `© ${new Date().getFullYear()} ${company.fantasyName || company.name}`}
      </footer>
    </div>
  );
}
