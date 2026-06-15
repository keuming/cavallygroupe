import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, ShoppingCart, Users, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDarkMode } from '@/hooks/useDarkMode';

interface LiveProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  discount: number;
  code: string;
  quantity: number;
}

interface LiveMessage {
  id: string;
  author: string;
  message: string;
  timestamp: number;
  isLike?: boolean;
}

interface LiveShoppingStreamProps {
  title: string;
  host: string;
  viewerCount: number;
  products: LiveProduct[];
  onAddToCart: (product: LiveProduct) => void;
  onClose: () => void;
}

export function LiveShoppingStream({
  title,
  host,
  viewerCount,
  products,
  onAddToCart,
  onClose,
}: LiveShoppingStreamProps) {
  const { isDarkMode } = useDarkMode();
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLive, setIsLive] = useState(true);
  const [likes, setLikes] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<LiveProduct | null>(products[0] || null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Simulate live timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle send message
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: LiveMessage = {
      id: `msg-${Date.now()}`,
      author: 'Vous',
      message: newMessage,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, message].slice(-20)); // Keep last 20 messages
    setNewMessage('');
  };

  // Handle like
  const handleLike = () => {
    setLikes((prev) => prev + 1);
    const likeMessage: LiveMessage = {
      id: `like-${Date.now()}`,
      author: 'Utilisateur',
      message: '❤️',
      timestamp: Date.now(),
      isLike: true,
    };
    setMessages((prev) => [...prev, likeMessage].slice(-20));
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
      isDarkMode ? 'bg-black/80' : 'bg-black/50'
    }`}>
      <div className={`w-full max-w-4xl rounded-lg overflow-hidden ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-red-500">EN DIRECT</span>
            </div>
            <h2 className={`font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 hover:bg-gray-300 dark:hover:bg-gray-700 rounded ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
          {/* Video Stream Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Placeholder */}
            <div className={`relative aspect-video rounded-lg overflow-hidden ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-4xl mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    📹
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Streaming vidéo en direct
                  </p>
                </div>
              </div>

              {/* Live Info Overlay */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="flex items-center gap-1 bg-black/60 px-3 py-1 rounded-full">
                  <Users className="w-4 h-4 text-white" />
                  <span className="text-sm font-semibold text-white">{viewerCount}</span>
                </div>
                <div className="flex items-center gap-1 bg-black/60 px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4 text-white" />
                  <span className="text-sm font-semibold text-white">{formatTime(timeElapsed)}</span>
                </div>
              </div>

              {/* Host Info */}
              <div className="absolute bottom-4 left-4">
                <p className="text-sm font-semibold text-white">Animateur: {host}</p>
              </div>

              {/* Like Animation */}
              <div className="absolute bottom-4 right-4">
                <button
                  onClick={handleLike}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2"
                >
                  <Heart className="w-5 h-5 fill-current" />
                  {likes}
                </button>
              </div>
            </div>

            {/* Featured Product */}
            {selectedProduct && (
              <Card className={`p-4 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`}>
                <div className="flex items-center gap-4">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {selectedProduct.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        {selectedProduct.price.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                      </span>
                      <span className={`text-sm line-through ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {selectedProduct.originalPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                      </span>
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                        -{selectedProduct.discount}%
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Code: <span className="text-yellow-500">{selectedProduct.code}</span>
                      </span>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Stock: {selectedProduct.quantity}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => onAddToCart(selectedProduct)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold flex items-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Ajouter
                  </Button>
                </div>
              </Card>
            )}

            {/* Products Carousel */}
            {products.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedProduct?.id === product.id
                        ? 'border-yellow-500'
                        : isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}
                  >
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat Sidebar */}
          <div className={`rounded-lg border flex flex-col ${
            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            {/* Chat Header */}
            <div className={`p-3 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <p className={`font-bold flex items-center gap-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                <MessageCircle className="w-4 h-4" />
                Chat en direct
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-64">
              {messages.length === 0 ? (
                <p className={`text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Aucun message pour le moment
                </p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`text-sm ${msg.isLike ? 'text-center' : ''}`}>
                    {msg.isLike ? (
                      <span className="text-lg">❤️</span>
                    ) : (
                      <>
                        <span className={`font-semibold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                          {msg.author}:
                        </span>
                        <span className={`ml-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {msg.message}
                        </span>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className={`p-3 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Votre message..."
                  className={`flex-1 px-2 py-1 rounded text-sm outline-none ${
                    isDarkMode
                      ? 'bg-gray-600 text-gray-100 placeholder-gray-400'
                      : 'bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded text-sm font-semibold"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
