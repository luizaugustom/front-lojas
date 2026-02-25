'use client';

import { useEffect, useState } from 'react';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { CheckCheck, Trash2, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  category?: string;
  actionUrl?: string;
  actionLabel?: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationPanel() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showClearReadConfirm, setShowClearReadConfirm] = useState(false);
  const [clearReadLoading, setClearReadLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (error: any) {
      console.error('Erro ao carregar notificações:', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error: any) {
      console.error('Erro ao marcar como lida:', error);
      toast.error('Erro ao marcar como lida');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('Todas as notificações marcadas como lidas');
    } catch (error: any) {
      console.error('Erro ao marcar todas como lidas:', error);
      toast.error('Erro ao marcar todas como lidas');
    }
  };

  const handleDeleteRead = () => {
    setShowClearReadConfirm(true);
  };

  const confirmDeleteRead = async () => {
    try {
      setClearReadLoading(true);
      await api.deleteReadNotifications();
      setNotifications(prev => prev.filter(n => !n.isRead));
      setShowClearReadConfirm(false);
      toast.success('Notificações lidas removidas');
    } catch (error: any) {
      console.error('Erro ao remover notificações lidas:', error);
      toast.error('Erro ao remover notificações lidas');
    } finally {
      setClearReadLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notificação removida');
    } catch (error: any) {
      console.error('Erro ao remover notificação:', error);
      toast.error('Erro ao remover notificação');
    }
  };

  const handleAction = (url: string) => {
    router.push(url);
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'read') return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const readCount = notifications.length - unreadCount;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-sm text-muted-foreground">Carregando notificações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Notificações</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadNotifications}
            title="Atualizar"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              title="Marcar todas como lidas"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Marcar todas
            </Button>
          )}
          {readCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteRead}
              title="Remover notificações lidas"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remover lidas
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            Todas {notifications.length > 0 && `(${notifications.length})`}
          </TabsTrigger>
          <TabsTrigger value="unread">
            Não lidas {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
          <TabsTrigger value="read">
            Lidas {notifications.length - unreadCount > 0 && `(${notifications.length - unreadCount})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {activeTab === 'unread'
                  ? 'Nenhuma notificação não lida'
                  : activeTab === 'read'
                  ? 'Nenhuma notificação lida'
                  : 'Nenhuma notificação'}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {filteredNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={handleMarkAsRead}
                    onDelete={handleDelete}
                    onAction={handleAction}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>

      <ConfirmationModal
        open={showClearReadConfirm}
        onClose={() => !clearReadLoading && setShowClearReadConfirm(false)}
        onConfirm={confirmDeleteRead}
        title="Remover notificações lidas?"
        description="Todas as notificações marcadas como lidas serão removidas. Esta ação não pode ser desfeita."
        variant="destructive"
        confirmText="Remover"
        cancelText="Cancelar"
        loading={clearReadLoading}
      />
    </div>
  );
}

// Import necessário
function Bell(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

