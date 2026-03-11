'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { NotificationPanel } from './NotificationPanel';
import { api } from '@/lib/api';
import { requestNotificationPermission, showNotification } from '@/lib/electron-adapter';

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [lastNotifiedAt, setLastNotifiedAt] = useState<string | null>(null);
  const desktopNotificationsEnabledRef = useRef(false);

  const loadUnreadCount = async () => {
    try {
      const data = await api.getUnreadNotificationsCount();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Erro ao carregar contador de notificações:', error);
    }
  };

  const checkNewNotifications = async (initialAt?: string) => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('lastNotificationAt') : null;
      const since = initialAt || stored || lastNotifiedAt || new Date().toISOString();
      const data = await api.getNotifications(true);
      const notifications = Array.isArray(data) ? data : data?.notifications || [];

      const newOnes = notifications
        .filter((notification: any) => new Date(notification.createdAt) > new Date(since))
        .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      if (newOnes.length > 0) {
        if (desktopNotificationsEnabledRef.current) {
          newOnes.forEach((notification: any) => {
            showNotification(notification.title, notification.message);
          });
        }
        const latest = newOnes[newOnes.length - 1].createdAt;
        setLastNotifiedAt(latest);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lastNotificationAt', latest);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar novas notificações:', error);
    }
  };

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('lastNotificationAt') : null;
    const initial = stored || new Date().toISOString();
    setLastNotifiedAt(initial);

    let mounted = true;
    (async () => {
      try {
        const prefs = await api.getNotificationPreferences();
        const enabled = prefs?.desktopNotificationsEnabled === true;
        if (mounted) {
          desktopNotificationsEnabledRef.current = enabled;
          if (enabled) {
            await requestNotificationPermission();
          }
        }
      } catch {
        if (mounted) desktopNotificationsEnabledRef.current = false;
      }

      loadUnreadCount();
      checkNewNotifications(initial);
    })();

    const interval = setInterval(() => {
      loadUnreadCount();
      checkNewNotifications();
    }, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      // Quando abrir, recarregar o contador
      setTimeout(loadUnreadCount, 1000);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          title={`${unreadCount} notificação${unreadCount !== 1 ? 'ões' : ''} não lida${unreadCount !== 1 ? 's' : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <>
              <span className="absolute top-1 right-1 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 items-center justify-center">
                  <span className="text-[10px] font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                </span>
              </span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        className="w-[min(500px,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] p-0 max-h-[85vh] overflow-hidden flex flex-col"
        sideOffset={8}
        alignOffset={0}
        collisionPadding={12}
      >
        <div className="p-3 sm:p-4 overflow-auto flex-1 min-h-0">
          <NotificationPanel />
        </div>
      </PopoverContent>
    </Popover>
  );
}

