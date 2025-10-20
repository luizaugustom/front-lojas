'use client';

import { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductImage } from '@/components/products/product-image';
import { useCartStore } from '@/store/cart-store';
import { formatCurrency, handleNumberInputChange } from '@/lib/utils';

interface CartProps {
  onCheckout: () => void;
}

export function Cart({ onCheckout }: CartProps) {
  const { items, discount, updateQuantity, removeItem, setDiscount, getSubtotal, getTotal, clearCart } = useCartStore();
  const [discountInput, setDiscountInput] = useState(discount.toString());

  const subtotal = getSubtotal();
  const total = getTotal();

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          Carrinho ({items.length})
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 pb-0">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <ShoppingCart className="h-8 w-8 sm:h-12 sm:w-12 mb-2" aria-hidden="true" />
            <p className="text-xs sm:text-sm">Carrinho vazio</p>
            <p className="text-xs">Adicione produtos para começar</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.product.id} className="flex gap-3 border-b pb-4">
              <ProductImage 
                photos={item.product.photos} 
                name={item.product.name} 
                size="sm"
                className="flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-2">{item.product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(item.product.price)} x {item.quantity}
                </p>
                <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => removeItem(item.product.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>

      {/* Seção fixa na parte inferior */}
      <div className="border-t bg-background">
        {/* Totais e desconto */}
        <div className="p-4 space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Desconto:</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount">Desconto</Label>
            <Input
              id="discount"
              type="text"
              value={discountInput}
              onChange={(e) => handleNumberInputChange(e, (value) => {
                setDiscountInput(value);
                setDiscount(Number(value) || 0);
              })}
              onBlur={() => {
                if (discountInput === '') {
                  setDiscountInput('0');
                  setDiscount(0);
                }
              }}
              placeholder="0.00"
              className="no-spinner"
            />
          </div>
        </div>

        {/* Botões fixos na parte inferior */}
        <div className="p-4 pt-0">
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={clearCart} disabled={items.length === 0}>
              Limpar
            </Button>
            <Button className="flex-1" onClick={onCheckout} disabled={items.length === 0}>
              Finalizar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
