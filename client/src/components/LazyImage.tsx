import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  onLoad?: () => void;
  width?: number;
  height?: number;
  sizes?: string;
}

/**
 * LazyImage component using Intersection Observer for performance
 * Loads images only when they're about to enter the viewport
 */
export function LazyImage({
  src,
  alt,
  className,
  placeholderClassName,
  onLoad,
  width,
  height,
  sizes,
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Start loading the image
          setImageSrc(src);
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
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
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    // Fallback to a placeholder
    setImageSrc(
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="600"%3E%3Crect fill="%23f0f0f0" width="400" height="600"/%3E%3Ctext x="50%25" y="50%25" font-size="24" fill="%23999" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E'
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn('overflow-hidden bg-gray-100', placeholderClassName)}
    >
      {imageSrc ? (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          width={width}
          height={height}
          sizes={sizes}
          loading="lazy"
        />
      ) : (
        <div
          className={cn(
            'w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse',
            className
          )}
        />
      )}
    </div>
  );
}

export default LazyImage;
