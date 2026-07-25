'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sellerApi } from '@/lib/api-endpoints';
import { SellerScheduleEditor } from '@/components/sellers/seller-schedule-editor';

export default function SellerSchedulePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const sellerId = params.id;

  const { data: sellerResp } = useQuery({
    queryKey: ['seller', sellerId],
    queryFn: async () => (await sellerApi.get(sellerId)).data,
    enabled: !!sellerId,
    staleTime: 5 * 60_000,
  });

  const seller: any = (sellerResp as any)?.data ?? (sellerResp as any);
  const sellerName: string = seller?.name ?? sellerId;

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="space-y-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/sellers')}
          className="text-muted-foreground -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Jornada de {sellerName}
        </h1>
      </div>

      <SellerScheduleEditor sellerId={sellerId} sellerName={sellerName} />
    </div>
  );
}
