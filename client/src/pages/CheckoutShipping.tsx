import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { CheckoutLayout } from '@/components/CheckoutLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ShippingData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export function CheckoutShipping() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState<ShippingData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const [errors, setErrors] = useState<Partial<ShippingData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Le nom complet est requis';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      newErrors.email = 'Un email valide est requis';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est requis';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'L\'adresse est requise';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'La ville est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name as keyof ShippingData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handlePrevious = () => {
    navigate('/checkout/cart');
  };

  const handleNext = () => {
    if (validateForm()) {
      // Store shipping data in session/context
      sessionStorage.setItem('shippingData', JSON.stringify(formData));
      navigate('/checkout/payment');
    }
  };

  const ivoirianCities = [
    'Abidjan',
    'Yamoussoukro',
    'Bouaké',
    'Daloa',
    'San-Pédro',
    'Gagnoa',
    'Korhogo',
    'Man',
    'Dimbokro',
    'Adzopé',
  ];

  return (
    <CheckoutLayout
      currentStep={2}
      onPrevious={handlePrevious}
      onNext={handleNext}
      canProceed={Object.keys(errors).length === 0}
    >
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Adresse de livraison
        </h2>

        {/* Shipping Form */}
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <Label htmlFor="fullName" className="block text-sm font-medium mb-2">
              Nom complet *
            </Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Jean Dupont"
              value={formData.fullName}
              onChange={handleInputChange}
              className={errors.fullName ? 'border-red-500' : ''}
            />
            {errors.fullName && (
              <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="block text-sm font-medium mb-2">
              Email *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="jean@example.com"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone" className="block text-sm font-medium mb-2">
              Numéro de téléphone *
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+225 07 12 34 56 78"
              value={formData.phone}
              onChange={handleInputChange}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address" className="block text-sm font-medium mb-2">
              Adresse de livraison *
            </Label>
            <Input
              id="address"
              name="address"
              type="text"
              placeholder="123 Rue de la Paix"
              value={formData.address}
              onChange={handleInputChange}
              className={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && (
              <p className="text-sm text-red-600 mt-1">{errors.address}</p>
            )}
          </div>

          {/* City */}
          <div>
            <Label htmlFor="city" className="block text-sm font-medium mb-2">
              Ville *
            </Label>
            <select
              id="city"
              name="city"
              value={formData.city}
              onChange={(e) =>
                handleInputChange({
                  target: { name: 'city', value: e.target.value },
                } as any)
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.city ? 'border-red-500' : 'border-slate-300'
              }`}
            >
              <option value="">Sélectionnez une ville</option>
              {ivoirianCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {errors.city && (
              <p className="text-sm text-red-600 mt-1">{errors.city}</p>
            )}
          </div>

          {/* Postal Code */}
          <div>
            <Label htmlFor="postalCode" className="block text-sm font-medium mb-2">
              Code postal (optionnel)
            </Label>
            <Input
              id="postalCode"
              name="postalCode"
              type="text"
              placeholder="01 BP 1234"
              value={formData.postalCode}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Shipping Options */}
        <Card className="p-4 bg-slate-50 border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">
            Options de livraison
          </h3>
          <div className="space-y-3">
            <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-white transition-colors">
              <input
                type="radio"
                name="shipping"
                value="standard"
                defaultChecked
                className="w-4 h-4 text-blue-600"
              />
              <div className="ml-3">
                <p className="font-medium text-slate-900">Livraison standard</p>
                <p className="text-sm text-slate-600">3-5 jours ouvrables</p>
              </div>
              <span className="ml-auto font-semibold text-slate-900">
                2 000 FCFA
              </span>
            </label>

            <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-white transition-colors">
              <input
                type="radio"
                name="shipping"
                value="express"
                className="w-4 h-4 text-blue-600"
              />
              <div className="ml-3">
                <p className="font-medium text-slate-900">Livraison express</p>
                <p className="text-sm text-slate-600">1-2 jours ouvrables</p>
              </div>
              <span className="ml-auto font-semibold text-slate-900">
                5 000 FCFA
              </span>
            </label>
          </div>
        </Card>
      </div>
    </CheckoutLayout>
  );
}
