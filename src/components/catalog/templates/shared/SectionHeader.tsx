import type { CSSProperties } from 'react';

type Props = {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  style?: CSSProperties;
};

export function SectionHeader({ title, subtitle, align = 'center', style }: Props) {
  return (
    <div style={{ textAlign: align, marginBottom: 32, ...style }}>
      <h2
        style={{
          margin: 0,
          fontSize: 28,
          fontWeight: 600,
          textTransform: align === 'center' ? 'uppercase' : 'none',
          letterSpacing: align === 'center' ? 1 : 0,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p style={{ marginTop: 8, color: '#64748b' }}>{subtitle}</p>
      )}
    </div>
  );
}
