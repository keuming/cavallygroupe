import { Bell, X, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications, type Notification } from '@/hooks/useNotifications';
import { useDarkMode } from '@/hooks/useDarkMode';

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();
  const { isDarkMode } = useDarkMode();

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return '📦';
      case 'promotion':
        return '🎉';
      case 'cart':
        return '🛒';
      case 'system':
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return isDarkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200';
      case 'promotion':
        return isDarkMode ? 'bg-yellow-900 border-yellow-700' : 'bg-yellow-50 border-yellow-200';
      case 'cart':
        return isDarkMode ? 'bg-purple-900 border-purple-700' : 'bg-purple-50 border-purple-200';
      case 'system':
      default:
        return isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}j`;
    return new Date(timestamp).toLocaleDateString('fr-FR');
  };

  return (
    <div className={`absolute right-0 mt-2 w-96 rounded-lg shadow-xl border z-50 flex flex-col ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b flex items-center justify-between ${
        isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-yellow-500" />
          <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className={`text-xs ${isDarkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Check className="w-3 h-3 mr-1" />
            Tout lire
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1 max-h-80">
        {notifications.length === 0 ? (
          <div className={`px-4 py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <p className="text-sm">Aucune notification</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`px-4 py-3 border-b cursor-pointer transition-colors hover:opacity-75 ${
                notif.read
                  ? isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                  : isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-yellow-50 border-yellow-100'
              }`}
              onClick={() => markAsRead(notif.id)}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">{getNotificationIcon(notif.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`font-medium text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {notif.title}
                    </h4>
                    <span className={`text-xs whitespace-nowrap ml-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {formatTime(notif.timestamp)}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {notif.message}
                  </p>
                  {notif.actionUrl && (
                    <a
                      href={notif.actionUrl}
                      className="text-xs text-yellow-600 hover:text-yellow-700 mt-2 inline-block underline"
                    >
                      Voir plus →
                    </a>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notif.id);
                  }}
                  className={`flex-shrink-0 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className={`px-4 py-3 border-t flex-shrink-0 ${
        isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
      }`}>
        <a href="/cart" className="w-full inline-block mb-2">
          <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-sm py-2">
            🛒 Aller au panier
          </Button>
        </a>
        {notifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className={`text-xs w-full ${isDarkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Effacer tout
          </Button>
        )}
      </div>
    </div>
  );
}
