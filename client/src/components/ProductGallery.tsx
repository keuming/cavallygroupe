import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface GalleryImage {
  id: number;
  imageUrl: string;
  altText?: string | null;
  imageType: 'front_cover' | 'back_cover' | 'spine' | 'interior' | 'other';
  displayOrder: number;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  productTitle: string;
}

export function ProductGallery({ images, productTitle }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!images || images.length === 0) {
    return (
      <div className="w-full bg-gray-100 rounded-lg flex items-center justify-center h-96">
        <p className="text-gray-500">Aucune image disponible</p>
      </div>
    );
  }

  const currentImage = images[selectedIndex];
  const hasMultipleImages = images.length > 1;

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
  };

  const getImageTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      front_cover: 'Couverture avant',
      back_cover: 'Couverture arrière',
      spine: 'Dos du livre',
      interior: 'Intérieur',
      other: 'Autre',
    };
    return labels[type] || type;
  };

  return (
    <div className="w-full">
      {/* Main Image Display */}
      <div className="relative bg-white rounded-lg overflow-hidden mb-4 border border-gray-200">
        <div 
          className="relative w-full aspect-square bg-gray-100 cursor-pointer group"
          onClick={() => setIsFullscreen(true)}
        >
          <img
            src={currentImage.imageUrl}
            alt={currentImage.altText || productTitle}
            className="w-full h-full object-cover"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
          
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Zoom Hint */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-sm font-medium">Cliquer pour agrandir</span>
          </div>

          {/* Navigation Arrows */}
          {hasMultipleImages && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors z-10"
                aria-label="Image précédente"
              >
                <ChevronLeft className="w-5 h-5 text-gray-800" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors z-10"
                aria-label="Image suivante"
              >
                <ChevronRight className="w-5 h-5 text-gray-800" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {hasMultipleImages && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Image Type Label */}
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-800">{getImageTypeLabel(currentImage.imageType)}</span>
          </p>
        </div>
      </div>

      {/* Thumbnails */}
      {hasMultipleImages && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => handleThumbnailClick(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                selectedIndex === index
                  ? 'border-blue-500 ring-2 ring-blue-300'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              aria-label={`Voir ${getImageTypeLabel(image.imageType)}`}
            >
              <img
                src={image.imageUrl}
                alt={image.altText || `${productTitle} - ${getImageTypeLabel(image.imageType)}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={currentImage.imageUrl}
              alt={currentImage.altText || productTitle}
              className="max-w-full max-h-full object-contain"
            />

            {hasMultipleImages && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors"
                  aria-label="Image précédente"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors"
                  aria-label="Image suivante"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            {/* Fullscreen Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium">
              {selectedIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
