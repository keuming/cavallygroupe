import React from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ShoppingCart, Truck, CreditCard, CheckCircle } from 'lucide-react';

interface CheckoutStep {
  id: number;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const CHECKOUT_STEPS: CheckoutStep[] = [
  { id: 1, label: 'Panier', icon: <ShoppingCart className="w-5 h-5" />, path: '/checkout/cart' },
  { id: 2, label: 'Livraison', icon: <Truck className="w-5 h-5" />, path: '/checkout/shipping' },
  { id: 3, label: 'Paiement', icon: <CreditCard className="w-5 h-5" />, path: '/checkout/payment' },
  { id: 4, label: 'Confirmation', icon: <CheckCircle className="w-5 h-5" />, path: '/checkout/confirmation' },
];

interface CheckoutLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  onPrevious?: () => void;
  onNext?: () => void;
  canProceed?: boolean;
}

export function CheckoutLayout({
  children,
  currentStep,
  onPrevious,
  onNext,
  canProceed = true,
}: CheckoutLayoutProps) {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Finaliser votre commande</h1>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            {CHECKOUT_STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => {
                    if (step.id <= currentStep) {
                      navigate(step.path);
                    }
                  }}
                  disabled={step.id > currentStep}
                  className={`flex flex-col items-center gap-2 transition-all ${
                    step.id <= currentStep
                      ? 'cursor-pointer'
                      : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      step.id < currentStep
                        ? 'bg-blue-600 text-white'
                        : step.id === currentStep
                          ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-600'
                          : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      step.id <= currentStep ? 'text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>

                {index < CHECKOUT_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded-full transition-all ${
                      step.id < currentStep ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            <Card className="p-8 shadow-sm border-slate-200">
              {children}
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 shadow-sm border-slate-200 sticky top-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Résumé de commande</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Sous-total</span>
                  <span className="font-medium text-slate-900">50 000 FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Livraison</span>
                  <span className="font-medium text-slate-900">2 000 FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">TVA (18%)</span>
                  <span className="font-medium text-slate-900">9 360 FCFA</span>
                </div>
                <div className="border-t border-slate-200 pt-4 flex justify-between">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="font-bold text-lg text-blue-600">61 360 FCFA</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 gap-4">
          <Button
            onClick={onPrevious}
            disabled={currentStep === 1}
            variant="outline"
            className="px-8"
          >
            ← Précédent
          </Button>

          <Button
            onClick={onNext}
            disabled={!canProceed}
            className="px-8 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Suivant →
          </Button>
        </div>
      </div>
    </div>
  );
}
