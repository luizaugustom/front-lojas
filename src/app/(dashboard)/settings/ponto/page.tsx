import { Suspense } from 'react';
import { PontoSettings } from '../_components/ponto-settings';

export default function PontoSettingsPage() {
  return (
    <Suspense fallback={null}>
      <PontoSettings />
    </Suspense>
  );
}
