import { TrendingUp, TrendingDown, Zap, Clock } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';
import { DynamicPrice } from '@/hooks/useDynamicPricing';

interface PricingBadgeProps {
  price: DynamicPrice;
  showReason?: boolean;
}

export function PricingBadge({ price, showReason = true }: PricingBadgeProps) {
  const { isDarkMode } = useDarkMode();

  const getReasonIcon = () => {
    switch (price.reason) {
      case 'demand':
        return price.discountPercent > 0 ? (
          <TrendingDown className="w-4 h-4" />
        ) : (
          <TrendingUp className="w-4 h-4" />
        );
      case 'inventory':
        return <Clock className="w-4 h-4" />;
      case 'flash':
        return <Zap className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getReasonLabel = () => {
    const labels: Record<DynamicPrice['reason'], string> = {
      demand: 'Prix selon la demande',
      inventory: 'Stock limité',
      seasonal: 'Prix saisonnier',
      flash: 'Vente éclair',
      loyalty: 'Tarif fidélité',
      none: '',
    };
    return labels[price.reason];
  };

  const getReasonColor = () => {
    const colors: Record<DynamicPrice['reason'], string> = {
      demand: isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800',
      inventory: isDarkMode ? 'bg-orange-900 text-orange-200' : 'bg-orange-100 text-orange-800',
      seasonal: isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800',
      flash: isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800',
      loyalty: isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800',
      none: '',
    };
    return colors[price.reason];
  };

  return (
    <div className="space-y-2">
      {/* Price Display */}
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
          {price.currentPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
        </span>
        {price.discountPercent > 0 && (
          <>
            <span className={`text-sm line-through ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {price.basePrice.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
            </span>
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{price.discountPercent}%
            </span>
          </>
        )}
      </div>

      {/* Reason Badge */}
      {showReason && price.reason !== 'none' && (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold w-fit ${getReasonColor()}`}>
          {getReasonIcon()}
          <span>{getReasonLabel()}</span>
        </div>
      )}

      {/* Flash Sale Timer */}
      {price.reason === 'flash' && price.expiresAt && (
        <div className={`text-xs font-semibold flex items-center gap-1 ${
          isDarkMode ? 'text-red-300' : 'text-red-600'
        }`}>
          <Zap className="w-3 h-3" />
          Expire dans {Math.round((price.expiresAt - Date.now()) / 60000)} min
        </div>
      )}

      {/* Savings Amount */}
      {price.discount > 0 && (
        <div className={`text-xs ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>
          💰 Vous économisez {price.discount.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
        </div>
      )}
    </div>
  );
}
