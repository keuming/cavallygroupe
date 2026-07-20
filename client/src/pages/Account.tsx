import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  LogOut,
  ChevronRight,
  Edit2,
  Save,
  X,
} from 'lucide-react';

export function Account() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
  });

  const logoutMutation = trpc.auth.logout.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-gray-600 mb-4">Veuillez vous connecter pour accéder à votre compte</p>
          <Button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Retour à l'accueil
          </Button>
        </Card>
      </div>
    );
  }

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem('cavally_token');
        localStorage.removeItem('cavally_cart');
        if ('caches' in window) {
          caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
        }
        setTimeout(() => { window.location.href = '/'; }, 100);
      },
    });
  };

  const handleSaveProfile = () => {
    // Here you would typically call an API to save the profile
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Mon Compte</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile */}
          <div className="lg:col-span-2">
            {/* Profile Card */}
            <Card className="p-6 mb-6 border-slate-200">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Informations Personnelles</h2>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="outline"
                  className="gap-2"
                >
                  {isEditing ? (
                    <>
                      <X className="w-4 h-4" />
                      Annuler
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4" />
                      Modifier
                    </>
                  )}
                </Button>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="block text-sm font-medium mb-2">
                      Nom Complet
                    </Label>
                    <Input
                      id="name"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={(e) =>
                        setEditData({ ...editData, email: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="block text-sm font-medium mb-2">
                      Téléphone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+225 07 12 34 56 78"
                      value={editData.phone}
                      onChange={(e) =>
                        setEditData({ ...editData, phone: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address" className="block text-sm font-medium mb-2">
                      Adresse
                    </Label>
                    <Input
                      id="address"
                      placeholder="123 Rue de la Paix"
                      value={editData.address}
                      onChange={(e) =>
                        setEditData({ ...editData, address: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Enregistrer les modifications
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-slate-600">Nom</p>
                      <p className="font-medium text-slate-900">{user?.name || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-slate-600">Email</p>
                      <p className="font-medium text-slate-900">{user?.email || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-slate-600">Téléphone</p>
                      <p className="font-medium text-slate-900">{editData.phone || 'Non renseigné'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-slate-600">Adresse</p>
                      <p className="font-medium text-slate-900">{editData.address || 'Non renseignée'}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Orders Section */}
            <Card className="p-6 border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Mes Commandes</h2>

              <div className="space-y-4">
                <div className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">ORD-20260406-12345</p>
                      <p className="text-sm text-slate-600">6 avril 2026</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      Livrée
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-slate-600">2 articles - 61 360 FCFA</p>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">ORD-20260405-54321</p>
                      <p className="text-sm text-slate-600">5 avril 2026</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      En livraison
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-slate-600">1 article - 28 000 FCFA</p>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>

                <div className="text-center py-8 text-slate-600">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>Vous n'avez pas encore de commandes</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Quick Actions */}
          <div>
            <Card className="p-6 border-slate-200 sticky top-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Actions Rapides</h3>

              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/products')}
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Continuer vos achats
                </Button>

                <Button
                  onClick={() => navigate('/track-order')}
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <ChevronRight className="w-4 h-4" />
                  Suivre une commande
                </Button>

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Se déconnecter
                </Button>
              </div>
            </Card>

            {/* Support Card */}
            <Card className="p-6 border-slate-200 mt-6 bg-blue-50">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Besoin d'aide?</h3>
              <p className="text-sm text-slate-600 mb-4">
                Notre équipe de support est disponible pour vous aider
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-slate-900 font-medium">
                  📞 +225 05 86 00 01 03
                </p>
                <p className="text-slate-900 font-medium">
                  📧 online@cavallylivres.com
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
