import { TrendingDown, TrendingUp, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  infoTooltip?: string;
  onInfoClick?: () => void;
  subtitle?: string;
  valueClassName?: string;
  iconClassName?: string;
  iconWrapperClassName?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  trend = 'neutral',
  infoTooltip,
  onInfoClick,
  subtitle,
  valueClassName,
  iconClassName,
  iconWrapperClassName,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn('p-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            {title}
            {onInfoClick && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onInfoClick();
                }}
                title={infoTooltip ?? 'Ver detalhes'}
                className="inline-flex shrink-0 rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                aria-label={infoTooltip ?? 'Ver detalhes do cálculo'}
              >
                <Info className="h-3 w-3" />
              </button>
            )}
          </p>
          <p className={cn('text-lg font-bold mt-0.5 truncate', valueClassName)}>{value}</p>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{subtitle}</p>
          )}
          {change !== undefined && (
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
              {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500 shrink-0" />}
              {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500 shrink-0" />}
              <span className={trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : ''}>
                {change > 0 ? '+' : ''}
                {change}%
              </span>
              <span>vs. mês anterior</span>
            </p>
          )}
        </div>
        <div
          className={cn(
            'h-8 w-8 shrink-0 rounded-full bg-muted flex items-center justify-center',
            iconWrapperClassName
          )}
        >
          <Icon className={cn('h-3.5 w-3.5 text-muted-foreground', iconClassName)} />
        </div>
      </div>
    </Card>
  );
}
