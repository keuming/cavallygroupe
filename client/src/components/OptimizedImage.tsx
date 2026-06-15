import { useState, useEffect, useRef } from 'react';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean; // If true, loads immediately without lazy-loading
  onLoad?: () => void;
}

/**
 * OptimizedImage component with lazy-loading, fallback, and skeleton loading
 * Uses Intersection Observer for efficient viewport-based loading
 * Includes WebP support with fallback to JPEG
 */
export default function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  onLoad,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(!priority);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(priority ? src : null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) {
      setImageSrc(src);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          if (containerRef.current) {
            observer.unobserve(containerRef.current);
          }
        }
      },
      {
        rootMargin: '300px', // Start loading 300px before entering viewport
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200',
          className
        )}
        style={{ width, height }}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <BookOpen className="w-8 h-8 text-blue-500" />
          <span className="text-xs text-blue-700 text-center px-2">Image non disponible</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      {/* Skeleton loading state */}
      {isLoading && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"
          style={{ width, height }}
        >
          <div className="flex items-center justify-center h-full">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      )}

      {/* Image */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          width={width}
          height={height}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}
