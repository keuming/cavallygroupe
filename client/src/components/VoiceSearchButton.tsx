import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { useDarkMode } from '@/hooks/useDarkMode';

interface VoiceSearchButtonProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function VoiceSearchButton({ onSearch, placeholder = 'Dites votre recherche...' }: VoiceSearchButtonProps) {
  const { isListening, transcript, interimTranscript, isSupported, error, startListening, stopListening, resetTranscript } = useVoiceSearch(onSearch);
  const { isDarkMode } = useDarkMode();

  if (!isSupported) {
    return null;
  }

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleClick}
        variant={isListening ? 'default' : 'outline'}
        size="sm"
        className={`flex items-center gap-2 ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
            : isDarkMode ? 'border-gray-600 text-gray-300' : ''
        }`}
        title={isListening ? 'Arrêter l\'écoute' : 'Démarrer la recherche vocale'}
      >
        {isListening ? (
          <>
            <MicOff className="w-4 h-4" />
            <span className="hidden sm:inline">Écoute...</span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">Voix</span>
          </>
        )}
      </Button>

      {/* Transcript Display */}
      {(transcript || interimTranscript) && (
        <div className={`p-3 rounded-lg text-sm ${
          isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'
        }`}>
          <p className="font-semibold mb-1">Vous avez dit:</p>
          <p>
            {transcript}
            <span className={`italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {interimTranscript}
            </span>
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-100 text-red-800 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Placeholder */}
      {isListening && !transcript && !interimTranscript && (
        <div className={`p-3 rounded-lg text-sm text-center italic ${
          isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
        }`}>
          {placeholder}
        </div>
      )}
    </div>
  );
}
