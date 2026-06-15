import { useState, useEffect, useCallback } from 'react';

export interface LiveShoppingEvent {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  status: 'upcoming' | 'live' | 'ended';
  viewerCount: number;
  products: {
    id: string;
    name: string;
    price: number;
    discount: number;
    image: string;
  }[];
  hostName: string;
  hostImage: string;
  discountCode?: string;
  discountPercentage?: number;
}

export function useLiveShoppingEvents() {
  const [events, setEvents] = useState<LiveShoppingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLiveEvent, setCurrentLiveEvent] = useState<LiveShoppingEvent | null>(null);

  // Mock data - en production, cela viendrait d'une API
  const mockEvents: LiveShoppingEvent[] = [
    {
      id: '1',
      title: 'Vente Flash - Manuels Scolaires',
      description: 'Découvrez nos manuels scolaires avec jusqu\'à 50% de réduction',
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // Dans 2 heures
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
      status: 'upcoming',
      viewerCount: 0,
      products: [
        {
          id: '1',
          name: 'Mathématiques 6ème',
          price: 15000,
          discount: 30,
          image: 'https://via.placeholder.com/200x300?text=Math+6eme',
        },
        {
          id: '2',
          name: 'Français 5ème',
          price: 12000,
          discount: 25,
          image: 'https://via.placeholder.com/200x300?text=Francais+5eme',
        },
        {
          id: '3',
          name: 'Anglais 4ème',
          price: 14000,
          discount: 35,
          image: 'https://via.placeholder.com/200x300?text=Anglais+4eme',
        },
      ],
      hostName: 'Cavally Livres',
      hostImage: 'https://via.placeholder.com/50x50?text=Cavally',
      discountCode: 'FLASH50',
      discountPercentage: 50,
    },
    {
      id: '2',
      title: 'Livres Littéraires en Promotion',
      description: 'Les meilleures œuvres littéraires à prix réduit',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Demain
      endTime: new Date(Date.now() + 26 * 60 * 60 * 1000),
      status: 'upcoming',
      viewerCount: 0,
      products: [
        {
          id: '4',
          name: 'Les Misérables',
          price: 8000,
          discount: 20,
          image: 'https://via.placeholder.com/200x300?text=Les+Miserables',
        },
        {
          id: '5',
          name: 'Notre-Dame de Paris',
          price: 7500,
          discount: 15,
          image: 'https://via.placeholder.com/200x300?text=Notre+Dame',
        },
      ],
      hostName: 'Cavally Livres',
      hostImage: 'https://via.placeholder.com/50x50?text=Cavally',
      discountCode: 'LITTER30',
      discountPercentage: 30,
    },
    {
      id: '3',
      title: 'EN DIRECT - Manuels Universitaires',
      description: 'Rejoignez-nous pour une vente en direct de manuels universitaires',
      startTime: new Date(Date.now() - 30 * 60 * 1000), // Commencé il y a 30 min
      endTime: new Date(Date.now() + 90 * 60 * 1000), // Se termine dans 90 min
      status: 'live',
      viewerCount: 234,
      products: [
        {
          id: '6',
          name: 'Calcul Intégral et Différentiel',
          price: 25000,
          discount: 40,
          image: 'https://via.placeholder.com/200x300?text=Calcul',
        },
        {
          id: '7',
          name: 'Physique Générale',
          price: 22000,
          discount: 35,
          image: 'https://via.placeholder.com/200x300?text=Physique',
        },
        {
          id: '8',
          name: 'Chimie Organique',
          price: 20000,
          discount: 30,
          image: 'https://via.placeholder.com/200x300?text=Chimie',
        },
      ],
      hostName: 'Dr. Kouadio',
      hostImage: 'https://via.placeholder.com/50x50?text=Kouadio',
      discountCode: 'UNIV40',
      discountPercentage: 40,
    },
  ];

  // Initialiser les événements
  useEffect(() => {
    setLoading(true);
    // Simuler un délai de chargement
    const timer = setTimeout(() => {
      setEvents(mockEvents);
      
      // Trouver l'événement en direct
      const liveEvent = mockEvents.find((e) => e.status === 'live');
      if (liveEvent) {
        setCurrentLiveEvent(liveEvent);
      }
      
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Mettre à jour le statut des événements
  useEffect(() => {
    const interval = setInterval(() => {
      setEvents((prevEvents) =>
        prevEvents.map((event) => {
          const now = new Date();
          let status: 'upcoming' | 'live' | 'ended' = 'upcoming';

          if (now >= event.startTime && now <= event.endTime) {
            status = 'live';
          } else if (now > event.endTime) {
            status = 'ended';
          }

          return { ...event, status };
        })
      );
    }, 60000); // Mettre à jour chaque minute

    return () => clearInterval(interval);
  }, []);

  // Obtenir les événements à venir
  const getUpcomingEvents = useCallback(() => {
    return events.filter((e) => e.status === 'upcoming').sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }, [events]);

  // Obtenir les événements en direct
  const getLiveEvents = useCallback(() => {
    return events.filter((e) => e.status === 'live');
  }, [events]);

  // Obtenir les événements terminés
  const getEndedEvents = useCallback(() => {
    return events.filter((e) => e.status === 'ended').sort((a, b) => b.endTime.getTime() - a.endTime.getTime());
  }, [events]);

  // Rejoindre un événement
  const joinEvent = useCallback((eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (event && event.status === 'live') {
      setCurrentLiveEvent(event);
      // Simuler l'augmentation du nombre de spectateurs
      setEvents((prevEvents) =>
        prevEvents.map((e) =>
          e.id === eventId ? { ...e, viewerCount: e.viewerCount + 1 } : e
        )
      );
    }
  }, [events]);

  // Quitter un événement
  const leaveEvent = useCallback((eventId: string) => {
    if (currentLiveEvent?.id === eventId) {
      setCurrentLiveEvent(null);
    }
    // Simuler la diminution du nombre de spectateurs
    setEvents((prevEvents) =>
      prevEvents.map((e) =>
        e.id === eventId && e.viewerCount > 0
          ? { ...e, viewerCount: e.viewerCount - 1 }
          : e
      )
    );
  }, [currentLiveEvent]);

  // Formater le temps restant
  const getTimeRemaining = useCallback((endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();

    if (diff <= 0) return 'Terminé';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, []);

  return {
    events,
    loading,
    currentLiveEvent,
    getUpcomingEvents,
    getLiveEvents,
    getEndedEvents,
    joinEvent,
    leaveEvent,
    getTimeRemaining,
  };
}
