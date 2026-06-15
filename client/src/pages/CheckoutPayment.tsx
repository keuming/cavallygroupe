import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { CheckoutLayout } from '@/components/CheckoutLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Smartphone,
  CreditCard,
  Banknote,
  Check,
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  requiresPhone: boolean;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'wave',
    name: 'Wave Money',
    description: 'Portefeuille numérique Wave',
    icon: <Smartphone className="w-6 h-6" />,
    requiresPhone: true,
  },
  {
    id: 'moov',
    name: 'Moov Money',
    description: 'Portefeuille numérique Moov',
    icon: <Smartphone className="w-6 h-6" />,
    requiresPhone: true,
  },
  {
    id: 'mtn',
    name: 'MTN Money',
    description: 'Portefeuille numérique MTN',
    icon: <Smartphone className="w-6 h-6" />,
    requiresPhone: true,
  },
  {
    id: 'orange',
    name: 'Orange Money',
    description: 'Portefeuille numérique Orange',
    icon: <Smartphone className="w-6 h-6" />,
    requiresPhone: true,
  },
  {
    id: 'stripe',
    name: 'Carte Bancaire',
    description: 'Visa, Mastercard',
    icon: <CreditCard className="w-6 h-6" />,
    requiresPhone: false,
  },
  {
    id: 'cash',
    name: 'Paiement à la Livraison',
    description: 'Paiement en espèces',
    icon: <Banknote className="w-6 h-6" />,
    requiresPhone: false,
  },
];

export function CheckoutPayment() {
  const [, navigate] = useLocation();
  const [selectedMethod, setSelectedMethod] = useState<string>('wave');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState<string>('');

  const selectedPaymentMethod = PAYMENT_METHODS.find(
    (m) => m.id === selectedMethod
  );

  const validateForm = (): boolean => {
    if (
      selectedPaymentMethod?.requiresPhone &&
      !phoneNumber.trim()
    ) {
      setErrors('Le numéro de téléphone est requis');
      return false;
    }
    setErrors('');
    return true;
  };

  const handlePrevious = () => {
    navigate('/checkout/shipping');
  };

  const handleNext = () => {
    if (validateForm()) {
      // Store payment data in session/context
      sessionStorage.setItem(
        'paymentData',
        JSON.stringify({
          method: selectedMethod,
          phoneNumber,
        })
      );
      navigate('/checkout/confirmation');
    }
  };

  return (
    <CheckoutLayout
      currentStep={3}
      onPrevious={handlePrevious}
      onNext={handleNext}
      canProceed={!errors}
    >
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Méthode de paiement
        </h2>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PAYMENT_METHODS.map((method) => (
            <label
              key={method.id}
              className={`cursor-pointer transition-all ${
                selectedMethod === method.id
                  ? 'ring-2 ring-blue-600'
                  : ''
              }`}
            >
              <Card
                className={`p-4 border-2 transition-all hover:shadow-md ${
                  selectedMethod === method.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="payment-method"
                    value={method.id}
                    checked={selectedMethod === method.id}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="w-5 h-5 mt-1 text-blue-600 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`${
                          selectedMethod === method.id
                            ? 'text-blue-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {method.icon}
                      </div>
                      <h3 className="font-semibold text-slate-900">
                        {method.name}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600">
                      {method.description}
                    </p>
                  </div>
                  {selectedMethod === method.id && (
                    <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              </Card>
            </label>
          ))}
        </div>

        {/* Phone Number Input for Mobile Money */}
        {selectedPaymentMethod?.requiresPhone && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <Label htmlFor="phone" className="block text-sm font-medium mb-2">
              Numéro de téléphone {selectedPaymentMethod.name}
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+225 07 12 34 56 78"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                if (e.target.value.trim()) {
                  setErrors('');
                }
              }}
              className={errors ? 'border-red-500' : ''}
            />
            {errors && (
              <p className="text-sm text-red-600 mt-1">{errors}</p>
            )}
            <p className="text-xs text-slate-600 mt-2">
              Vous recevrez une notification sur votre téléphone pour confirmer le paiement
            </p>
          </Card>
        )}

        {/* Payment Security Info */}
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex gap-3">
            <div className="text-green-600 flex-shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 mb-1">
                Paiement sécurisé
              </h3>
              <p className="text-sm text-green-800">
                Vos données de paiement sont chiffrées et sécurisées. Nous
                n'enregistrons jamais vos informations de carte bancaire.
              </p>
            </div>
          </div>
        </Card>

        {/* Order Summary */}
        <Card className="p-4 bg-slate-50 border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">
            Résumé du paiement
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Sous-total</span>
              <span className="font-medium">50 000 FCFA</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Livraison</span>
              <span className="font-medium">2 000 FCFA</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">TVA (18%)</span>
              <span className="font-medium">9 360 FCFA</span>
            </div>
            <div className="border-t border-slate-300 pt-3 flex justify-between">
              <span className="font-semibold text-slate-900">Total à payer</span>
              <span className="font-bold text-lg text-blue-600">
                61 360 FCFA
              </span>
            </div>
          </div>
        </Card>

        {/* Terms and Conditions */}
        <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg">
          <input
            type="checkbox"
            defaultChecked
            className="w-4 h-4 mt-1 text-blue-600"
          />
          <span className="text-sm text-slate-600">
            J'accepte les conditions générales de vente et la politique de
            confidentialité
          </span>
        </label>
      </div>
    </CheckoutLayout>
  );
}
