import { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function ImageWithFallback({
  src,
  alt,
  className = '',
  width,
  height,
}: ImageWithFallbackProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 ${className}`}
        style={{ width, height }}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <BookOpen className="w-8 h-8 text-blue-500" />
          <span className="text-xs text-[#005f8a] text-center px-2">Image non disponible</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div
          className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
          style={{ width, height }}
        >
          <BookOpen className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : ''}`}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
  );
}
