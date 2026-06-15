import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { CheckoutLayout } from '@/components/CheckoutLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    title: string;
    price: string;
    coverImageUrl?: string;
  };
}

export function CheckoutCart() {
  const [, navigate] = useLocation();
  const [items, setItems] = useState<CartItem[]>([
    {
      id: 1,
      productId: 1,
      quantity: 2,
      product: {
        id: 1,
        title: 'Mathématiques 6ème',
        price: '12500',
        coverImageUrl: 'https://via.placeholder.com/100x150?text=Math',
      },
    },
    {
      id: 2,
      productId: 2,
      quantity: 1,
      product: {
        id: 2,
        title: 'Français 5ème',
        price: '11000',
        coverImageUrl: 'https://via.placeholder.com/100x150?text=Francais',
      },
    },
  ]);

  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
    } else {
      setItems(
        items.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (itemId: number) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  const handleApplyDiscount = () => {
    if (discountCode.trim()) {
      setDiscountApplied(true);
      // Here you would typically call an API to validate the discount code
    }
  };

  const handleProceed = () => {
    if (items.length > 0) {
      navigate('/checkout/shipping');
    }
  };

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  return (
    <CheckoutLayout
      currentStep={1}
      onNext={handleProceed}
      canProceed={items.length > 0}
    >
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Votre panier</h2>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">Votre panier est vide</p>
            <Button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Continuer vos achats
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="p-4 flex items-center gap-4 border-slate-200 hover:shadow-md transition-shadow"
                >
                  {/* Product Image */}
                  <img
                    src={item.product.coverImageUrl}
                    alt={item.product.title}
                    className="w-20 h-28 object-cover rounded border border-slate-200"
                  />

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {item.product.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {Number(item.product.price).toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-2">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                      className="p-1 hover:bg-slate-200 rounded transition-colors"
                    >
                      <Minus className="w-4 h-4 text-slate-600" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.id, parseInt(e.target.value) || 1)
                      }
                      className="w-12 text-center bg-transparent font-medium text-slate-900 border-0 focus:ring-0"
                      min="1"
                    />
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                      className="p-1 hover:bg-slate-200 rounded transition-colors"
                    >
                      <Plus className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right w-24">
                    <p className="font-semibold text-slate-900">
                      {(
                        Number(item.product.price) * item.quantity
                      ).toLocaleString('fr-FR')}{' '}
                      FCFA
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 hover:bg-red-50 rounded transition-colors text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </Card>
              ))}
            </div>

            {/* Discount Code Section */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <label className="block text-sm font-medium text-slate-900 mb-3">
                Code de réduction
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Entrez votre code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  disabled={discountApplied}
                  className="flex-1"
                />
                <Button
                  onClick={handleApplyDiscount}
                  disabled={!discountCode.trim() || discountApplied}
                  variant="outline"
                  className="px-6"
                >
                  {discountApplied ? 'Appliqué ✓' : 'Appliquer'}
                </Button>
              </div>
            </Card>

            {/* Pricing Summary */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Sous-total</span>
                <span className="font-medium text-slate-900">
                  {subtotal.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              {discountApplied && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Réduction</span>
                  <span className="font-medium">-2 500 FCFA</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Livraison</span>
                <span className="font-medium text-slate-900">2 000 FCFA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">TVA (18%)</span>
                <span className="font-medium text-slate-900">
                  {Math.round(
                    ((subtotal - (discountApplied ? 2500 : 0) + 2000) * 18) / 100
                  ).toLocaleString('fr-FR')}{' '}
                  FCFA
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </CheckoutLayout>
  );
}
