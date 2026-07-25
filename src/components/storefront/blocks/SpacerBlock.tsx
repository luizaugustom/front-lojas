'use client';

import { Block } from '@/lib/storefront-types';

interface SpacerBlockProps {
  block: Block;
}

export function SpacerBlock({ block }: SpacerBlockProps) {
  const { height = 40 } = block.props || {};
  const safeHeight = Math.min(Math.max(Number(height) || 40, 8), 200);

  return <div style={{ height: `${safeHeight}px` }} aria-hidden="true" />;
}
