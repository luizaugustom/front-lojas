'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { taskApi } from '@/lib/api-endpoints';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { TaskItemType } from './CalendarPanel';

interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  task?: TaskItemType | null;
  sellers?: Array<{ id: string; name: string }>;
}

export function TaskDialog({ open, onClose, onSave, task, sellers = [] }: TaskDialogProps) {
  const { user } = useAuth();
  const isCompany = user?.role === 'empresa';
  const isSeller = user?.role === 'vendedor';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [type, setType] = useState<'PERSONAL' | 'WORK'>('WORK');
  const [assignedToId, setAssignedToId] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setDueDate(new Date(task.dueDate));
        setType(task.type);
        setAssignedToId(task.assignedToType === 'company' ? 'company' : task.assignedToId);
      } else {
        setTitle('');
        setDescription('');
        setDueDate(new Date());
        setType('WORK');
        setAssignedToId('');
      }
    }
  }, [open, task]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }
    if (!dueDate) {
      toast.error('Data de vencimento é obrigatória');
      return;
    }

    setSaving(true);
    try {
      const data: any = {
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate.toISOString(),
        type,
      };

      if (isCompany) {
        // Se for 'company' ou vazio, não envia assignedToId (atribui à empresa)
        if (assignedToId && assignedToId !== 'company') {
          data.assignedToId = assignedToId;
        }
      } else if (isSeller) {
        // Vendedor sempre cria para si mesmo
        data.assignedToId = user?.id;
      }

      if (task) {
        await taskApi.update(task.id, data);
        toast.success('Tarefa atualizada');
      } else {
        await taskApi.create(data);
        toast.success('Tarefa criada');
      }
      onSave();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erro ao salvar tarefa');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
          <DialogDescription>
            {task
              ? 'Atualize os dados da tarefa'
              : 'Preencha os dados da nova tarefa'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Título *</Label>
            <Input
              id="task-title"
              placeholder="Título da tarefa"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Descrição</Label>
            <Textarea
              id="task-description"
              placeholder="Descrição da tarefa (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-due-date">Data de Vencimento *</Label>
            <div className="flex justify-center">
              <DatePicker
                date={dueDate}
                onSelect={setDueDate}
                placeholder="Selecione a data"
                disabled={saving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-type">Tipo *</Label>
            <Select value={type} onValueChange={(v) => setType(v as 'PERSONAL' | 'WORK')} disabled={saving}>
              <SelectTrigger id="task-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERSONAL">Pessoal</SelectItem>
                <SelectItem value="WORK">Trabalho</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isCompany && (
            <div className="space-y-2">
              <Label htmlFor="task-assigned">Atribuir para</Label>
              <Select
                value={assignedToId || 'company'}
                onValueChange={(value) => setAssignedToId(value === 'company' ? '' : value)}
                disabled={saving}
              >
                <SelectTrigger id="task-assigned">
                  <SelectValue placeholder="Empresa (padrão)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">Empresa</SelectItem>
                  {sellers.map((seller) => (
                    <SelectItem key={seller.id} value={seller.id}>
                      {seller.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Salvando...' : task ? 'Salvar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
