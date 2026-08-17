type Props = {
  phone?: string | null;
  email?: string | null;
  zipCode?: string | null;
  state?: string | null;
  city?: string | null;
  district?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
};

export function ContactBlock({
  phone,
  email,
  zipCode,
  state,
  city,
  district,
  street,
  number,
  complement,
}: Props) {
  const addressParts = [street, number, complement, district, city, state, zipCode].filter(
    Boolean,
  );
  const address = addressParts.length ? addressParts.join(', ') : null;

  return (
    <div
      style={{
        padding: 24,
        background: '#f8fafc',
        borderRadius: 8,
        display: 'grid',
        gap: 8,
      }}
    >
      {phone && (
        <p style={{ margin: 0 }}>
          <span style={{ marginRight: 8 }}>📞</span>
          <a href={`tel:${phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            {phone}
          </a>
        </p>
      )}
      {email && (
        <p style={{ margin: 0 }}>
          <span style={{ marginRight: 8 }}>�️</span>
          <a href={`mailto:${email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            {email}
          </a>
        </p>
      )}
      {address && (
        <p style={{ margin: 0 }}>
          <span style={{ marginRight: 8 }}>📍</span>
          {address}
        </p>
      )}
    </div>
  );
}
