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

export function BoldTemplate({ config, company, products, categories }: Props) {
  const heroStyle = config.heroImageUrl
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${config.heroImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#fff',
      }
    : {
        background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.accent})`,
        color: '#fff',
      };

  return (
    <div
      style={{
        fontFamily: "'Open Sans', sans-serif",
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
        }}
      >
        {config.logoUrl && (
          <img src={config.logoUrl} alt={company.name} style={{ height: 48 }} />
        )}
        <h1
          style={{
            margin: 0,
            fontFamily: "'Montserrat', sans-serif",
            textTransform: 'uppercase',
            fontSize: 20,
            letterSpacing: 1,
          }}
        >
          {company.fantasyName || company.name}
        </h1>
      </header>

      <section
        style={{
          ...heroStyle,
          padding: '120px 24px',
          textAlign: 'center',
          borderRadius: 0,
        }}
      >
        <h2
          style={{
            fontFamily: "'Montserrat', sans-serif",
            textTransform: 'uppercase',
            fontSize: 56,
            fontWeight: 800,
            margin: 0,
            letterSpacing: 2,
          }}
        >
          {config.texts.heroTitle}
        </h2>
        <p style={{ marginTop: 16, fontSize: 18 }}>{config.texts.heroSubtitle}</p>
      </section>

      {categories.length > 0 && (
        <section style={{ padding: 64, maxWidth: 1200, margin: '0 auto' }}>
          <SectionHeader title="CATEGORIAS" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 16,
            }}
          >
            {categories.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: 24,
                  background: config.colors.surface,
                  borderRadius: 16,
                  textAlign: 'center',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: 14,
                }}
              >
                {c.name}
              </div>
            ))}
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section style={{ padding: 64, maxWidth: 1200, margin: '0 auto' }}>
          <SectionHeader title="DESTAQUES" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 20,
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

      <section style={{ padding: 64, maxWidth: 800, margin: '0 auto' }}>
        <SectionHeader title={config.texts.aboutTitle.toUpperCase()} />
        <p style={{ lineHeight: 1.8, fontSize: 16 }}>{config.texts.aboutBody}</p>
      </section>

      <section style={{ padding: 64, maxWidth: 1200, margin: '0 auto' }}>
        <SectionHeader title="CONTATO" />
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
          background: config.colors.surface,
          fontSize: 14,
        }}
      >
        {config.texts.footerText ||
          `© ${new Date().getFullYear()} ${company.fantasyName || company.name}`}
      </footer>
    </div>
  );
}
