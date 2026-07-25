'use client';

import { Block } from '@/lib/storefront-types';

interface Props {
  block: Block;
}

const STYLE_CLASS: Record<string, string> = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
};

/**
 * Linha divisora horizontal entre seções.
 */
export function DividerBlock({ block }: Props) {
  const { style = 'solid', color = '#E5E7EB', width = 100 } = block.props || {};

  return (
    <div
      className="mx-auto"
      style={{
        marginTop: 'var(--sf-section-spacing)',
        marginBottom: 'var(--sf-section-spacing)',
        width: `${width}%`,
      }}
    >
      <hr
        className={`border-t-2 ${STYLE_CLASS[style] || STYLE_CLASS.solid}`}
        style={{ borderColor: color }}
      />
    </div>
  );
}
