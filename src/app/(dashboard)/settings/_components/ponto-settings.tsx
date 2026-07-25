'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Clock, MapPin, QrCode, Search, UserCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TimeClockConfigForm } from '@/components/time-clock/TimeClockConfigForm';
import { QrCodeDisplay } from '@/components/time-clock/QrCodeDisplay';
import { SellerScheduleEditor } from '@/components/sellers/seller-schedule-editor';
import { useAuth } from '@/hooks/useAuth';
import { sellerApi } from '@/lib/api-endpoints';
import type { Seller } from '@/types';

type SectionKey = 'localizacao' | 'qr' | 'jornadas';

const SECTIONS: { key: SectionKey; label: string; icon: typeof MapPin }[] = [
  { key: 'localizacao', label: 'Localização e regras', icon: MapPin },
  { key: 'qr', label: 'QR da loja', icon: QrCode },
  { key: 'jornadas', label: 'Jornadas', icon: Clock },
];

function parseSellers(response: unknown): Seller[] {
  if (Array.isArray(response)) return response as Seller[];
  if (!response || typeof response !== 'object') return [];
  const data = (response as { data?: unknown }).data ?? response;
  if (Array.isArray(data)) return data as Seller[];
  if (data && typeof data === 'object' && Array.isArray((data as { sellers?: unknown }).sellers)) {
    return (data as { sellers: Seller[] }).sellers;
  }
  return [];
}

export function PontoSettings() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const requested = searchParams.get('section') as SectionKey | null;
  const activeSection =
    requested && SECTIONS.some((s) => s.key === requested) ? requested : 'localizacao';
  const [section, setSection] = useState<SectionKey>(activeSection);
  const [search, setSearch] = useState('');
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);

  useEffect(() => {
    setSection(activeSection);
  }, [activeSection]);

  const handleSectionChange = (value: string) => {
    const next = value as SectionKey;
    setSection(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'localizacao') {
      params.delete('section');
    } else {
      params.set('section', next);
    }
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
  };

  const { data: sellersResponse, isLoading: loadingSellers } = useQuery({
    queryKey: ['sellers', 'ponto-settings', search, user?.companyId],
    queryFn: async () =>
      (
        await sellerApi.list({
          search: search || undefined,
          companyId: user?.companyId || undefined,
          limit: 100,
        })
      ).data,
    enabled: section === 'jornadas' && !!user?.companyId,
  });

  const sellers = useMemo(() => parseSellers(sellersResponse), [sellersResponse]);

  return (
    <>
      <Tabs value={section} onValueChange={handleSectionChange}>
        <div className="overflow-x-auto -mx-1 mb-4">
          <TabsList className="inline-flex w-auto min-w-full sm:min-w-0">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <TabsTrigger key={s.key} value={s.key} className="flex items-center gap-1.5">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{s.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <TabsContent value="localizacao" className="mt-0">
          <TimeClockConfigForm companyId={user?.companyId || undefined} />
        </TabsContent>

        <TabsContent value="qr" className="mt-0">
          <QrCodeDisplay />
        </TabsContent>

        <TabsContent value="jornadas" className="mt-0 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Jornadas dos vendedores
              </CardTitle>
              <CardDescription>
                Defina dias e horários individuais. Sem jornada própria, o vendedor usa a da
                empresa.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar vendedor..."
                  className="pl-9"
                />
              </div>

              {loadingSellers ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : sellers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  Nenhum vendedor encontrado.
                </p>
              ) : (
                <ul className="divide-y rounded-md border">
                  {sellers.map((seller) => (
                    <li
                      key={seller.id}
                      className="flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{seller.name}</p>
                        {seller.email ? (
                          <p className="text-xs text-muted-foreground truncate">{seller.email}</p>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingSeller(seller)}
                      >
                        Editar jornada
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!editingSeller}
        onOpenChange={(open) => {
          if (!open) setEditingSeller(null);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Jornada{editingSeller?.name ? ` de ${editingSeller.name}` : ''}
            </DialogTitle>
          </DialogHeader>
          {editingSeller ? (
            <SellerScheduleEditor
              sellerId={editingSeller.id}
              sellerName={editingSeller.name}
              onSaved={() => setEditingSeller(null)}
              onRemoved={() => setEditingSeller(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
