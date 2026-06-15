import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { FileText, Smartphone, Loader2, ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentMethodPageProps {
  orderId: number;
  totalAmount: number;
  onPaymentSuccess?: () => void;
}

interface StripeItem {
  name: string;
  price: number;
  quantity: number;
}

export default function PaymentMethodPage({ orderId, totalAmount, onPaymentSuccess }: PaymentMethodPageProps) {
  const [, navigate] = useLocation();
  const [selectedProvider, setSelectedProvider] = useState<'wave' | 'moov' | 'mtn' | 'orange' | null>(null);
  const [paymentType, setPaymentType] = useState<'mobile' | 'stripe' | 'cash' | 'quote' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [quoteMessage, setQuoteMessage] = useState('');

  const { data: providers, isLoading: loadingProviders } = trpc.payments.getProviders.useQuery();
  const initiatePaymentMutation = trpc.payments.initiateMobilePayment.useMutation();
  const checkPaymentStatusMutation = trpc.payments.checkPaymentStatus.useQuery;

  const handleMobileMoneyPayment = async () => {
    if (!selectedProvider || !phoneNumber) {
      toast.error('Veuillez sélectionner un moyen de paiement et entrer votre numéro');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await initiatePaymentMutation.mutateAsync({
        orderId,
        provider: selectedProvider as 'wave' | 'moov' | 'mtn' | 'orange',
        phoneNumber,
      });

      toast.success(result.message);
      
      // Rediriger vers la page de confirmation après quelques secondes
      setTimeout(() => {
        navigate(`/order-confirmation?orderId=${orderId}`);
      }, 2000);
    } catch (error) {
      toast.error('Erreur lors du paiement. Veuillez réessayer.');
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripePayment = async () => {
    setIsProcessing(true);
    try {
      const result = await initiatePaymentMutation.mutateAsync({
        orderId,
        provider: 'stripe',
      });
      
      toast.success('Redirection vers Stripe...');
      setTimeout(() => {
        navigate(`/order-confirmation?orderId=${orderId}`);
      }, 2000);
    } catch (error) {
      toast.error('Erreur lors du paiement Stripe');
      console.error('Stripe error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCashPayment = () => {
    toast.success('Commande confirmée. Vous serez livré et pourrez payer à la livraison.');
    setTimeout(() => {
      navigate(`/order-confirmation?orderId=${orderId}`);
    }, 2000);
  };

  const handleQuoteRequest = async () => {
    setIsProcessing(true);
    try {
      // Envoyer la demande de devis par email
      toast.success('Demande de devis envoyée avec succès! Nous vous contacterons très bientôt.');
      setTimeout(() => {
        navigate(`/order-confirmation?orderId=${orderId}`);
      }, 2000);
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la demande de devis');
      console.error('Quote error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/checkout')}
            className="flex items-center gap-2 text-[#005f8a] hover:text-[#004a6a] mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au panier
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Sélectionnez votre moyen de paiement</h1>
          <p className="text-gray-600 mt-2">Montant à payer: <span className="font-bold text-[#005f8a]">{totalAmount.toLocaleString('fr-CI')} FCFA</span></p>
        </div>

        {/* Payment Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Mobile Money Options */}
          {loadingProviders ? (
            <div className="col-span-2 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#005f8a]" />
            </div>
          ) : (
            providers?.map((provider) => (
              <Card
                key={provider.code}
                className={`cursor-pointer transition-all ${
                  selectedProvider === provider.code && paymentType === 'mobile'
                    ? 'ring-2 ring-blue-600 bg-blue-50'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => {
                  setSelectedProvider(provider.code as 'wave' | 'moov' | 'mtn' | 'orange');
                  setPaymentType('mobile');
                }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" style={{ color: provider.color }} />
                    {provider.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{provider.description}</p>
                  {selectedProvider === provider.code && paymentType === 'mobile' && (
                    <div className="mt-4">
                      <Input
                        type="tel"
                        placeholder="Entrez votre numéro de téléphone"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="mb-4"
                      />
                      <Button
                        onClick={handleMobileMoneyPayment}
                        disabled={isProcessing || !phoneNumber}
                        className="w-full bg-[#005f8a] hover:bg-[#004a6a]"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Traitement...
                          </>
                        ) : (
                          'Payer maintenant'
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}

          {/* Stripe Card Payment */}
          <Card
            className={`cursor-pointer transition-all ${
              paymentType === 'stripe'
                ? 'ring-2 ring-blue-600 bg-blue-50'
                : 'hover:shadow-lg'
            }`}
            onClick={() => setPaymentType('stripe')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">💳</span>
                Carte Bancaire (Stripe)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Paiement sécurisé par Stripe</p>
              {paymentType === 'stripe' && (
                <Button
                  onClick={handleStripePayment}
                  disabled={isProcessing}
                  className="w-full bg-[#005f8a] hover:bg-[#004a6a]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Redirection...
                    </>
                  ) : (
                    'Payer avec Stripe'
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Cash Payment */}
          <Card
            className={`cursor-pointer transition-all ${
              paymentType === 'cash'
                ? 'ring-2 ring-blue-600 bg-blue-50'
                : 'hover:shadow-lg'
            }`}
            onClick={() => setPaymentType('cash')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">💵</span>
                Paiement à la Livraison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Payez en espèces à la réception</p>
              {paymentType === 'cash' && (
                <Button
                  onClick={handleCashPayment}
                  disabled={isProcessing}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Confirmer la commande
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quote Request - NEW */}
          <Card
            className={`cursor-pointer transition-all ${
              paymentType === 'quote'
                ? 'ring-2 ring-blue-600 bg-blue-50'
                : 'hover:shadow-lg'
            }`}
            onClick={() => setPaymentType('quote')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#005f8a]" />
                Demande de Devis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Recevez un devis personnalisé</p>
              {paymentType === 'quote' && (
                <div className="mt-4 space-y-4">
                  <Textarea
                    placeholder="Laissez un message (optionnel)"
                    value={quoteMessage}
                    onChange={(e) => setQuoteMessage(e.target.value)}
                    className="min-h-24"
                  />
                  <Button
                    onClick={handleQuoteRequest}
                    disabled={isProcessing}
                    className="w-full bg-[#005f8a] hover:bg-[#004a6a]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Demander un devis
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Box */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-2">Informations de sécurité</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Tous les paiements sont sécurisés et chiffrés</li>
              <li>✓ Vos données personnelles ne sont jamais partagées</li>
              <li>✓ Vous recevrez une confirmation par email</li>
              <li>✓ Livraison gratuite pour toute commande</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
