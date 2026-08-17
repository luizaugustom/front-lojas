type Props = {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string | null;
    description?: string | null;
  };
  onContact?: () => void;
  whatsappMessage?: string;
};

export function ProductCard({ product, onContact, whatsappMessage }: Props) {
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(product.price);

  const link = whatsappMessage
    ? `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`
    : '#';

  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{ width: '100%', height: 180, objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: 180,
            background: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
          }}
        >
          Sem imagem
        </div>
      )}
      <div style={{ padding: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{product.name}</h3>
        {product.description && (
          <p
            style={{
              marginTop: 8,
              fontSize: 14,
              color: '#64748b',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.description}
          </p>
        )}
        <div
          style={{
            marginTop: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <strong>{formatted}</strong>
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            onClick={onContact}
            style={{
              background: '#2563eb',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: 6,
              textDecoration: 'none',
              fontSize: 14,
            }}
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
