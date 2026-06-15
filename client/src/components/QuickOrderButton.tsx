import { useLocation } from 'wouter';
import { ShoppingCart } from 'lucide-react';

interface QuickOrderButtonProps {
  isMobile?: boolean;
  isDarkMode?: boolean;
  onClose?: () => void;
}

export function QuickOrderButton({ isMobile = false, isDarkMode = false, onClose }: QuickOrderButtonProps) {
  const [, navigate] = useLocation();

  const handleClick = () => {
    navigate('/quick-order');
    onClose?.();
  };

  if (isMobile) {
    return (
      <button
        onClick={handleClick}
        className="col-span-2 sm:col-span-3 px-4 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
      >
        <ShoppingCart className="w-5 h-5" />
        Commande Rapide
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="font-bold transition-all duration-200 whitespace-nowrap text-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
      title="Passer une commande rapide"
    >
      <ShoppingCart className="w-5 h-5" />
      Commande Rapide
    </button>
  );
}
