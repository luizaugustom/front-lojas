'use client';

import { WhatsAppConnectionCard } from '@/components/whatsapp/whatsapp-connection-card';
import { WhatsAppGlobalStatus } from '@/components/whatsapp/whatsapp-global-status';
import { useAuth } from '@/hooks/useAuth';

export function WhatsAppSettings() {
  const { user } = useAuth();
  const role = user?.role;

  if (role === 'admin') {
    return (
      <WhatsAppConnectionCard />
    );
  }

  return (
    <WhatsAppGlobalStatus />
  );
}

export default WhatsAppSettings;
