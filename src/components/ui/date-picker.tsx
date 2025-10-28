"use client"

import * as React from "react"
import { format, parse, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePicker({
  date,
  onSelect,
  placeholder = "Selecione uma data",
  disabled = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  // Atualiza o input quando a data muda
  React.useEffect(() => {
    if (date) {
      setInputValue(format(date, "dd/MM/yyyy"))
    } else {
      setInputValue("")
    }
  }, [date])

  // Função para aplicar máscara de data
  const applyDateMask = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "")
    
    // Aplica a máscara dd/MM/yyyy
    let masked = numbers
    if (numbers.length > 2) {
      masked = numbers.slice(0, 2) + "/" + numbers.slice(2)
    }
    if (numbers.length > 4) {
      masked = numbers.slice(0, 2) + "/" + numbers.slice(2, 4) + "/" + numbers.slice(4, 8)
    }
    
    return masked
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyDateMask(e.target.value)
    setInputValue(masked)

    // Se a data está completa (10 caracteres), tenta fazer o parse
    if (masked.length === 10) {
      try {
        const parsedDate = parse(masked, "dd/MM/yyyy", new Date())
        if (isValid(parsedDate)) {
          onSelect?.(parsedDate)
        }
      } catch {
        // Ignora erros de parse enquanto o usuário digita
      }
    } else if (masked.length === 0) {
      onSelect?.(undefined)
    }
  }

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    onSelect?.(selectedDate)
    setOpen(false)
  }

  return (
    <div className="flex gap-2">
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn("flex-1 text-foreground", className)}
        maxLength={10}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn("px-3")}
            type="button"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleCalendarSelect}
            locale={ptBR}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

