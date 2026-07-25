'use client';

import { Block } from '@/lib/storefront-types';

interface Props {
  block: Block;
  onUpdate: (props: Record<string, any>) => void;
}

export function SpacerBlockEditor({ block, onUpdate }: Props) {
  const { height = 40 } = block.props || {};

  return (
    <div className="space-y-3">
      <div>
        <label className="flex items-center justify-between text-xs font-medium text-gray-700 mb-1">
          <span>Altura</span>
          <span className="text-gray-500 font-mono">{height}px</span>
        </label>
        <input
          type="range"
          min={8}
          max={200}
          step={4}
          value={height}
          onChange={(e) => onUpdate({ height: Number(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  );
}
