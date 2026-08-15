// Funções utilitárias de formatação para o time-clock.
// Mantidas fora dos componentes para reuso e testabilidade.

/** Converte minutos em "XhYY" (ex: 90 → "1h30", 480 → "8h00") */
export function formatMinutesAsHM(min: number | null | undefined): string {
  if (min === null || min === undefined || isNaN(min) || min < 0) return '0h00';
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${h}h${m < 10 ? '0' : ''}${m}`;
}

/** Converte minutos em "Xh Ymin" (ex: 90 → "1h 30min") */
export function formatMinutesLong(min: number | null | undefined): string {
  if (min === null || min === undefined || isNaN(min) || min < 0) return '0h';
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

/** Dias trabalhados no formato "completos/total", sem undefined. */
export function formatWorkedDays(stats?: {
  workedDays?: number | null;
  totalDays?: number | null;
  completedDays?: number | null;
  incompleteDays?: number | null;
} | null): string {
  const worked = Number(stats?.workedDays ?? stats?.completedDays ?? 0);
  const incomplete = Number(stats?.incompleteDays ?? 0);
  const total = Number(
    stats?.totalDays ??
      (stats?.completedDays != null ? Number(stats.completedDays) + incomplete : 0),
  );
  const safeWorked = Number.isFinite(worked) ? worked : 0;
  const safeTotal = Number.isFinite(total) ? total : 0;
  return `${safeWorked}/${safeTotal}`;
}

/** Formata distância em metros com unidade adequada */
export function formatDistance(meters: number | null | undefined): string {
  if (meters === null || meters === undefined || isNaN(meters)) return '—';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}
