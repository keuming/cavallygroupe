import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Loader2, Send, X, Minimize2, Maximize2, MessageCircle } from 'lucide-react';
import { Streamdown } from 'streamdown';
import { ChatbotSuggestions, generateCategoryBasedSuggestions } from '@/components/ChatbotSuggestions';

export type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type ChatbotWidgetProps = {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  title?: string;
  subtitle?: string;
  suggestedPrompts?: string[];
  knowledgeBase?: string; // Base de connaissances pour le chatbot
};

/**
 * Professional chatbot widget with minimize/maximize functionality
 * Displays as a floating widget in the bottom-right corner
 */
export function ChatbotWidget({
  messages,
  onSendMessage,
  isLoading = false,
  placeholder = 'Posez votre question...',
  title = 'Assistant Cavally',
  subtitle = 'Comment puis-je vous aider ?',
  suggestedPrompts = [
    'Comment passer une commande rapide ?',
    'Je veux télécharger ma liste de fournitures',
    'Comment partager une liste avec d\'autres parents ?',
    'Où trouver mes commandes ?',
  ],
  knowledgeBase = '',
}: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [categoryBasedSuggestions] = useState(() => generateCategoryBasedSuggestions());
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Filter out system messages
  const displayMessages = messages.filter((msg) => msg.role !== 'system');

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isOpen && !isMinimized) {
      const viewport = scrollAreaRef.current?.querySelector(
        '[data-radix-scroll-area-viewport]'
      ) as HTMLDivElement;

      if (viewport) {
        requestAnimationFrame(() => {
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: 'smooth',
          });
        });
      }
    }
  }, [displayMessages, isOpen, isMinimized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    onSendMessage(trimmedInput);
    setInput('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    onSendMessage(prompt);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-[#005f8a] to-[#0080b8] text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
        title="Ouvrir le chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed z-50 flex flex-col bg-white shadow-2xl overflow-hidden border border-gray-200 rounded-2xl bottom-0 right-0 left-0 h-[85vh] sm:bottom-6 sm:right-6 sm:left-auto sm:w-96 sm:h-[500px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#005f8a] to-[#0080b8] text-white p-4 flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-base">{title}</h3>
          <p className="text-xs text-blue-100">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            title={isMinimized ? 'Agrandir' : 'Réduire'}
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Minimize2 className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              setIsMinimized(false);
            }}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div ref={scrollAreaRef} className="flex-1 overflow-hidden bg-gray-50">
            {displayMessages.length === 0 ? (
              <div className="flex h-full flex-col p-4">
                <div className="flex flex-1 flex-col items-center justify-center gap-4 text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <MessageCircle className="w-10 h-10 opacity-30" />
                    <p className="text-sm text-center">Bienvenue ! Comment puis-je vous aider aujourd'hui ?</p>
                  </div>

                  {categoryBasedSuggestions.length > 0 && (
                    <ChatbotSuggestions
                      suggestions={categoryBasedSuggestions}
                      onSelectSuggestion={handleSuggestedPrompt}
                      isLoading={isLoading}
                    />
                  )}
                  {suggestedPrompts.length > 0 && categoryBasedSuggestions.length === 0 && (
                    <div className="flex flex-col gap-2 w-full">
                      {suggestedPrompts.map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestedPrompt(prompt)}
                          disabled={isLoading}
                          className="text-left px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-3 p-4">
                  {displayMessages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex gap-2',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[75%] rounded-lg px-3 py-2 text-sm',
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-[#005f8a] to-[#0080b8] text-white rounded-br-none'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                        )}
                      >
                        {message.role === 'assistant' ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <Streamdown>{message.content}</Streamdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-2 justify-start">
                      <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none px-3 py-2">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 p-4 border-t border-gray-200 bg-white"
          >
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 max-h-20 resize-none min-h-9 text-sm"
              rows={1}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="shrink-0 h-9 w-9 bg-gradient-to-r from-[#005f8a] to-[#0080b8] hover:from-[#004a6a] hover:to-[#006a98]"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
