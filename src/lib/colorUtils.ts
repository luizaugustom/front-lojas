/**
 * Converte uma cor hex para HSL
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  // Remove o # se existir
  const cleanHex = hex.replace('#', '');
  
  // Verifica se é um hex válido
  if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
    return null;
  }

  // Converte para RGB
  const r = parseInt(cleanHex.substr(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substr(2, 2), 16) / 255;
  const b = parseInt(cleanHex.substr(4, 2), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Converte uma cor hex para o formato HSL usado pelo Tailwind CSS
 * Retorna no formato "h s% l%" para uso em variáveis CSS
 */
export function hexToTailwindHsl(hex: string): string | null {
  const hsl = hexToHsl(hex);
  if (!hsl) return null;
  
  return `${hsl.h} ${hsl.s}% ${hsl.l}%`;
}

/**
 * Aplica uma cor da empresa com intensidade adequada
 * Retorna a cor no formato HSL para uso em variáveis CSS
 */
export function applyCompanyColor(brandColor: string | null): string {
  if (!brandColor) {
    // Retorna a cor azul padrão (primary atual)
    return '221.2 83.2% 53.3%';
  }

  const hsl = hexToHsl(brandColor);
  if (!hsl) {
    // Se a cor não for válida, retorna a cor azul padrão
    return '221.2 83.2% 53.3%';
  }

  // Mantém a cor com boa intensidade (70% da saturação e ajuste suave de luminosidade)
  const adjustedS = Math.max(hsl.s * 0.7, 20); // Mínimo 20% de saturação
  const adjustedL = Math.max(Math.min(hsl.l, 60), 40); // Entre 40-60% de luminosidade

  return `${hsl.h} ${adjustedS}% ${adjustedL}%`;
}

/**
 * Aplica uma cor da empresa com opacidade customizada
 */
export function applyCompanyColorWithOpacity(brandColor: string | null, opacity: number = 0.1): string {
  if (!brandColor) {
    return '221.2 83.2% 53.3%';
  }

  const hsl = hexToHsl(brandColor);
  if (!hsl) {
    return '221.2 83.2% 53.3%';
  }

  // Aplica a opacidade especificada
  const adjustedS = Math.max(hsl.s * opacity, 5);
  const adjustedL = Math.min(hsl.l + (100 - hsl.l) * (1 - opacity), 95);

  return `${hsl.h} ${adjustedS}% ${adjustedL}%`;
}
