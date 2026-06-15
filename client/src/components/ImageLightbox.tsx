import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
  sourceRect?: DOMRect; // Position de l'image source pour l'animation
}

export function ImageLightbox({
  images,
  initialIndex = 0,
  onClose,
  sourceRect,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Terminer l'animation d'ouverture après un court délai
    const timer = setTimeout(() => setIsAnimating(false), 50);
    return () => clearTimeout(timer);
  }, []);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
  };

  // Calculer les positions initiales pour l'animation
  const initialX = sourceRect ? sourceRect.left + sourceRect.width / 2 : 0;
  const initialY = sourceRect ? sourceRect.top + sourceRect.height / 2 : 0;
  const initialScale = sourceRect ? 0.1 : 1;

  return (
    <>
      {/* Backdrop avec animation de fade */}
      <div
        className={`fixed inset-0 z-50 transition-colors duration-300 ${
          isAnimating ? "bg-black/0" : "bg-black/80"
        }`}
        onClick={onClose}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
      />

      {/* Conteneur principal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-4xl max-h-[90vh] flex items-center justify-center pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
          style={{
            transform: isAnimating
              ? `translate(calc(-50% + ${initialX}px), calc(-50% + ${initialY}px)) scale(${initialScale})`
              : "translate(-50%, -50%) scale(1)",
            left: "50%",
            top: "50%",
            transition: isAnimating
              ? "none"
              : "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            transformOrigin: "center center",
          }}
        >
          {/* Image avec animation de fade */}
          <div
            className={`relative w-full h-full flex items-center justify-center transition-opacity duration-300 ${
              isAnimating ? "opacity-0" : "opacity-100"
            }`}
          >
            <img
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 ${
              isAnimating ? "opacity-0 scale-75" : "opacity-100 scale-100"
            }`}
            aria-label="Fermer"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Navigation buttons - only show if multiple images */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 ${
                  isAnimating ? "opacity-0 -translate-x-4" : "opacity-100 translate-x-0"
                }`}
                aria-label="Image précédente"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              <button
                onClick={handleNext}
                className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 ${
                  isAnimating ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
                }`}
                aria-label="Image suivante"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>

              {/* Image counter */}
              <div
                className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 rounded-full text-white text-sm transition-all duration-300 ${
                  isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
                }`}
              >
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
