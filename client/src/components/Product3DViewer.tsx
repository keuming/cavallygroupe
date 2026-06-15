import { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDarkMode } from '@/hooks/useDarkMode';

interface Product3DViewerProps {
  productName: string;
  images: string[]; // Multiple angles of the product
  onViewChange?: (angle: number) => void;
}

export function Product3DViewer({ productName, images, onViewChange }: Product3DViewerProps) {
  const { isDarkMode } = useDarkMode();
  const [currentAngle, setCurrentAngle] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Auto-rotate effect
  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setCurrentAngle((prev) => (prev + 2) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [autoRotate]);

  // Notify parent of angle change
  useEffect(() => {
    onViewChange?.(currentAngle);
  }, [currentAngle, onViewChange]);

  // Handle mouse drag for rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX);
    setAutoRotate(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const diff = e.clientX - dragStart;
    const angleDiff = (diff / 300) * 360; // Normalize drag distance to angle
    setCurrentAngle((prev) => (prev + angleDiff) % 360);
    setDragStart(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle touch for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientX);
    setAutoRotate(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const diff = e.touches[0].clientX - dragStart;
    const angleDiff = (diff / 300) * 360;
    setCurrentAngle((prev) => (prev + angleDiff) % 360);
    setDragStart(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Get current image based on angle
  const imageIndex = Math.round((currentAngle / 360) * images.length) % images.length;
  const currentImage = images[imageIndex];

  // Handle zoom
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));
  const handleResetZoom = () => setZoom(100);

  // Handle angle buttons
  const handleAngleChange = (angle: number) => {
    setCurrentAngle(angle);
    setAutoRotate(false);
  };

  return (
    <div className={`rounded-lg overflow-hidden border ${
      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
    }`}>
      {/* Viewer Container */}
      <div
        ref={containerRef}
        className={`relative aspect-square cursor-grab active:cursor-grabbing overflow-hidden ${
          isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Product Image */}
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
          <img
            ref={imageRef}
            src={currentImage}
            alt={`${productName} - ${currentAngle}°`}
            className="max-w-full max-h-full transition-transform duration-150"
            style={{
              transform: `scale(${zoom / 100})`,
            }}
          />
        </div>

        {/* Angle Indicator */}
        <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {Math.round(currentAngle)}°
        </div>

        {/* Zoom Indicator */}
        <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {zoom}%
        </div>

        {/* Drag Hint */}
        {!isDragging && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs">
            Glissez pour tourner
          </div>
        )}
      </div>

      {/* Controls */}
      <div className={`p-4 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
        {/* Zoom Controls */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Button
            onClick={handleZoomOut}
            size="sm"
            variant="outline"
            className={isDarkMode ? 'border-gray-600 text-gray-300' : ''}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className={`text-sm font-semibold min-w-12 text-center ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {zoom}%
          </span>
          <Button
            onClick={handleZoomIn}
            size="sm"
            variant="outline"
            className={isDarkMode ? 'border-gray-600 text-gray-300' : ''}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleResetZoom}
            size="sm"
            variant="outline"
            className={isDarkMode ? 'border-gray-600 text-gray-300' : ''}
          >
            <RotateCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Angle Presets */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[0, 90, 180, 270].map((angle) => (
            <Button
              key={angle}
              onClick={() => handleAngleChange(angle)}
              size="sm"
              variant={Math.round(currentAngle) === angle ? 'default' : 'outline'}
              className={`text-xs ${
                isDarkMode && Math.round(currentAngle) !== angle
                  ? 'border-gray-600 text-gray-300'
                  : ''
              }`}
            >
              {angle}°
            </Button>
          ))}
        </div>

        {/* Auto-Rotate Toggle */}
        <Button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`w-full ${
            autoRotate
              ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
              : isDarkMode ? 'bg-gray-600 hover:bg-gray-700 text-gray-100' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          <RotateCw className={`w-4 h-4 mr-2 ${autoRotate ? 'animate-spin' : ''}`} />
          {autoRotate ? 'Rotation en cours' : 'Rotation auto'}
        </Button>

        {/* Image Navigation */}
        {images.length > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
            <Button
              onClick={() => handleAngleChange((currentAngle - 360 / images.length + 360) % 360)}
              size="sm"
              variant="outline"
              className={isDarkMode ? 'border-gray-600 text-gray-300' : ''}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {imageIndex + 1} / {images.length}
            </span>
            <Button
              onClick={() => handleAngleChange((currentAngle + 360 / images.length) % 360)}
              size="sm"
              variant="outline"
              className={isDarkMode ? 'border-gray-600 text-gray-300' : ''}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className={`p-3 border-t text-xs ${
        isDarkMode
          ? 'bg-gray-600 border-gray-600 text-gray-300'
          : 'bg-gray-50 border-gray-200 text-gray-600'
      }`}>
        <p>💡 Conseil: Glissez pour tourner le produit, utilisez les boutons pour zoomer ou activer la rotation automatique.</p>
      </div>
    </div>
  );
}
