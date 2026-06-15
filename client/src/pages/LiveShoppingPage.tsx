import { useState } from 'react';
import { Calendar, Clock, Users, Zap, ShoppingCart, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLiveShoppingEvents } from '@/hooks/useLiveShoppingEvents';
import { useDarkMode } from '@/hooks/useDarkMode';
import { LiveShoppingStream } from '@/components/LiveShoppingStream';

export function LiveShoppingPage() {
  const { isDarkMode } = useDarkMode();
  const { events, loading, currentLiveEvent, getUpcomingEvents, getLiveEvents, joinEvent, leaveEvent, getTimeRemaining } = useLiveShoppingEvents();
  const [selectedTab, setSelectedTab] = useState<'live' | 'upcoming' | 'ended'>('live');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const liveEvents = getLiveEvents();
  const upcomingEvents = getUpcomingEvents();

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Chargement des événements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
      {/* En Direct */}
      {currentLiveEvent && (
        <div className={`border-b-4 border-red-500 ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-500 font-bold text-sm">EN DIRECT</span>
            </div>
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
              <div className="text-center text-white">
                <Zap className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">{currentLiveEvent.title}</h2>
                <p className="mb-4">Streaming en direct</p>
                <Button
                  onClick={() => leaveEvent(currentLiveEvent.id)}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Quitter
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenu Principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Live Shopping
          </h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Découvrez nos ventes en direct avec des réductions exclusives et des produits en promotion
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-300 dark:border-gray-600">
          <button
            onClick={() => setSelectedTab('live')}
            className={`pb-4 px-4 font-semibold transition-colors ${
              selectedTab === 'live'
                ? 'border-b-2 border-yellow-500 text-yellow-500'
                : isDarkMode
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              En Direct ({liveEvents.length})
            </div>
          </button>
          <button
            onClick={() => setSelectedTab('upcoming')}
            className={`pb-4 px-4 font-semibold transition-colors ${
              selectedTab === 'upcoming'
                ? 'border-b-2 border-yellow-500 text-yellow-500'
                : isDarkMode
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              À Venir ({upcomingEvents.length})
            </div>
          </button>
          <button
            onClick={() => setSelectedTab('ended')}
            className={`pb-4 px-4 font-semibold transition-colors ${
              selectedTab === 'ended'
                ? 'border-b-2 border-yellow-500 text-yellow-500'
                : isDarkMode
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Terminés
            </div>
          </button>
        </div>

        {/* Contenu des Tabs */}
        {selectedTab === 'live' && (
          <div>
            {liveEvents.length === 0 ? (
              <div className={`text-center py-12 ${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg`}>
                <Play className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Aucun événement en direct pour le moment
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isSelected={selectedEvent === event.id}
                    onSelect={() => {
                      setSelectedEvent(event.id);
                      joinEvent(event.id);
                    }}
                    isDarkMode={isDarkMode}
                    getTimeRemaining={getTimeRemaining}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'upcoming' && (
          <div>
            {upcomingEvents.length === 0 ? (
              <div className={`text-center py-12 ${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg`}>
                <Calendar className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Aucun événement à venir
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <UpcomingEventCard
                    key={event.id}
                    event={event}
                    isDarkMode={isDarkMode}
                    getTimeRemaining={getTimeRemaining}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'ended' && (
          <div className={`text-center py-12 ${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg`}>
            <Clock className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Les événements terminés apparaîtront ici
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface EventCardProps {
  event: any;
  isSelected: boolean;
  onSelect: () => void;
  isDarkMode: boolean;
  getTimeRemaining: (date: Date) => string;
}

function EventCard({ event, isSelected, onSelect, isDarkMode, getTimeRemaining }: EventCardProps) {
  return (
    <div
      className={`rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-yellow-500 shadow-lg'
          : isDarkMode
          ? 'border-gray-600 bg-gray-700'
          : 'border-gray-200 bg-white'
      }`}
      onClick={onSelect}
    >
      {/* En Direct Badge */}
      {event.status === 'live' && (
        <div className="bg-red-500 text-white px-3 py-1 text-xs font-bold flex items-center gap-1">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          EN DIRECT
        </div>
      )}

      {/* Image Produit */}
      <div className={`aspect-video bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center`}>
        <Zap className="w-12 h-12 text-white" />
      </div>

      {/* Contenu */}
      <div className="p-4">
        <h3 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {event.title}
        </h3>

        {/* Hôte */}
        <div className="flex items-center gap-2 mb-3">
          <img
            src={event.hostImage}
            alt={event.hostName}
            className="w-6 h-6 rounded-full"
          />
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {event.hostName}
          </span>
        </div>

        {/* Infos */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-yellow-500" />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              {event.viewerCount} spectateurs
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              {getTimeRemaining(event.endTime)} restant
            </span>
          </div>
          {event.discountPercentage && (
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-red-500" />
              <span className="text-red-500 font-bold">
                Jusqu'à {event.discountPercentage}% de réduction
              </span>
            </div>
          )}
        </div>

        {/* Bouton */}
        <Button
          onClick={onSelect}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
        >
          <Play className="w-4 h-4 mr-2" />
          Rejoindre
        </Button>
      </div>
    </div>
  );
}

interface UpcomingEventCardProps {
  event: any;
  isDarkMode: boolean;
  getTimeRemaining: (date: Date) => string;
}

function UpcomingEventCard({ event, isDarkMode, getTimeRemaining }: UpcomingEventCardProps) {
  return (
    <div className={`rounded-lg p-6 border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {event.title}
          </h3>
          <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {event.description}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-yellow-500" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {event.startTime.toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {event.startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Produits */}
          <div className="mb-4">
            <p className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Produits en promotion:
            </p>
            <div className="flex gap-2 flex-wrap">
              {event.products.slice(0, 3).map((product: any) => (
                <span
                  key={product.id}
                  className={`text-xs px-2 py-1 rounded ${
                    isDarkMode
                      ? 'bg-gray-600 text-gray-200'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {product.name}
                </span>
              ))}
              {event.products.length > 3 && (
                <span className={`text-xs px-2 py-1 rounded ${
                  isDarkMode
                    ? 'bg-gray-600 text-gray-200'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  +{event.products.length - 3} autres
                </span>
              )}
            </div>
          </div>
        </div>

        <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold ml-4">
          <Bell className="w-4 h-4 mr-2" />
          Me notifier
        </Button>
      </div>
    </div>
  );
}

import { Bell } from 'lucide-react';
