import { useEffect } from "react";
import { CheckCircle, ShoppingCart, ArrowRight, X } from "lucide-react";
import { useLocation } from "wouter";

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: { title: string; price: string; coverImageUrl?: string };
  quantity: number;
  cartCount: number;
}

export function AddToCartModal({ isOpen, onClose, product, quantity, cartCount }: AddToCartModalProps) {
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        {/* Success icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-green-500" />
          </div>
          <div>
            <p className="font-bold text-gray-900">Ajouté au panier !</p>
            <p className="text-sm text-gray-500">{quantity} × {product.title}</p>
          </div>
        </div>

        {/* Prix */}
        <div className="bg-gray-50 rounded-xl p-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Prix unitaire</span>
            <span className="font-semibold">{Number(product.price).toLocaleString()} FCFA</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-600">Quantité</span>
            <span className="font-semibold">{quantity}</span>
          </div>
          <div className="flex justify-between font-bold mt-2 pt-2 border-t border-gray-200">
            <span>Total ajouté</span>
            <span className="text-[#005f8a]">{(Number(product.price) * quantity).toLocaleString()} FCFA</span>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Continuer mes achats
          </button>
          <button
            onClick={() => { onClose(); navigate("/cart"); }}
            className="flex-1 py-2.5 px-4 bg-[#005f8a] text-white rounded-xl text-sm font-semibold hover:bg-[#004a6b] transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Voir le panier ({cartCount})
          </button>
        </div>

        {/* Barre de progression */}
        <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-400 rounded-full animate-shrink-bar" />
        </div>
      </div>
    </div>
  );
}
