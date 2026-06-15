import { useState, useMemo } from 'react';
import { Download, Share2, Eye, Trash2, Plus, Copy, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useDarkMode } from '@/hooks/useDarkMode';
import { cn } from '@/lib/utils';

interface SupplyList {
  id: string;
  name: string;
  level: string;
  sublevel: string;
  items: SupplyItem[];
  createdAt: Date;
  updatedAt: Date;
  shareCode: string;
  views: number;
  shares: number;
  orders: OrderTracking[];
}

interface SupplyItem {
  id: string;
  name: string;
  quantity: number;
  estimatedPrice: number;
  ordered: boolean;
}

interface OrderTracking {
  id: string;
  parentName: string;
  parentEmail: string;
  orderDate: Date;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  items: SupplyItem[];
  totalPrice: number;
}

export default function AdvancedSupplyListManagement() {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [lists, setLists] = useState<SupplyList[]>([]);
  const [selectedList, setSelectedList] = useState<SupplyList | null>(null);
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListLevel, setNewListLevel] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showOrderTracking, setShowOrderTracking] = useState(false);

  // Générer un code d'accès unique
  const generateShareCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  // Créer une nouvelle liste
  const handleCreateList = () => {
    if (!newListName || !newListLevel) return;

    const newList: SupplyList = {
      id: Date.now().toString(),
      name: newListName,
      level: newListLevel,
      sublevel: '',
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      shareCode: generateShareCode(),
      views: 0,
      shares: 0,
      orders: [],
    };

    setLists([...lists, newList]);
    setNewListName('');
    setNewListLevel('');
    setShowNewListForm(false);
  };

  // Copier le code d'accès
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Télécharger la liste en CSV
  const handleDownloadList = (list: SupplyList) => {
    const csv = [
      ['Article', 'Quantité', 'Prix estimé', 'Total'],
      ...list.items.map((item) => [
        item.name,
        item.quantity,
        item.estimatedPrice,
        item.quantity * item.estimatedPrice,
      ]),
      ['', '', 'TOTAL', list.items.reduce((sum, item) => sum + item.quantity * item.estimatedPrice, 0)],
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${list.name}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Supprimer une liste
  const handleDeleteList = (id: string) => {
    setLists(lists.filter((list) => list.id !== id));
    if (selectedList?.id === id) {
      setSelectedList(null);
    }
  };

  // Statistiques
  const stats = useMemo(() => {
    return {
      totalLists: lists.length,
      totalViews: lists.reduce((sum, list) => sum + list.views, 0),
      totalShares: lists.reduce((sum, list) => sum + list.shares, 0),
      totalOrders: lists.reduce((sum, list) => sum + list.orders.length, 0),
    };
  }, [lists]);

  return (
    <div className={cn('min-h-screen', isDarkMode ? 'bg-gray-900' : 'bg-gray-50')}>
      {/* En-tête */}
      <div
        className={cn(
          'border-b',
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className={cn('text-3xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
            Gestion des Listes de Fournitures
          </h1>
          <p className={cn('text-sm mt-2', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
            Créez, partagez et suivez les commandes des parents d'élèves
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className={cn('text-sm font-medium', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
                  Listes créées
                </p>
                <p className={cn('text-3xl font-bold mt-2', isDarkMode ? 'text-white' : 'text-gray-900')}>
                  {stats.totalLists}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardContent className="pt-6">
              <div className="text-center">
                <Eye className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className={cn('text-sm font-medium', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
                  Consultations
                </p>
                <p className={cn('text-3xl font-bold mt-2', isDarkMode ? 'text-white' : 'text-gray-900')}>
                  {stats.totalViews}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardContent className="pt-6">
              <div className="text-center">
                <Share2 className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <p className={cn('text-sm font-medium', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
                  Partages
                </p>
                <p className={cn('text-3xl font-bold mt-2', isDarkMode ? 'text-white' : 'text-gray-900')}>
                  {stats.totalShares}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className={cn('text-sm font-medium', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
                  Commandes
                </p>
                <p className={cn('text-3xl font-bold mt-2', isDarkMode ? 'text-white' : 'text-gray-900')}>
                  {stats.totalOrders}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bouton créer nouvelle liste */}
        <div className="mb-8">
          <Button
            onClick={() => setShowNewListForm(!showNewListForm)}
            className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Créer une nouvelle liste
          </Button>
        </div>

        {/* Formulaire de création */}
        {showNewListForm && (
          <Card className={cn('mb-8', isDarkMode ? 'bg-gray-800 border-gray-700' : '')}>
            <CardHeader>
              <CardTitle>Créer une nouvelle liste</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className={cn('block text-sm font-medium mb-2', isDarkMode ? 'text-gray-300' : 'text-gray-700')}>
                  Nom de la liste
                </label>
                <Input
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Ex: Fournitures 6ème A"
                  className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                />
              </div>
              <div>
                <label className={cn('block text-sm font-medium mb-2', isDarkMode ? 'text-gray-300' : 'text-gray-700')}>
                  Niveau d'étude
                </label>
                <select
                  value={newListLevel}
                  onChange={(e) => setNewListLevel(e.target.value)}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg border',
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  )}
                >
                  <option value="">Sélectionnez un niveau</option>
                  <option value="maternelle">Maternelle</option>
                  <option value="primaire">Primaire</option>
                  <option value="college">Collège</option>
                  <option value="lycee">Lycée</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateList}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Créer
                </Button>
                <Button
                  onClick={() => setShowNewListForm(false)}
                  variant="outline"
                  className={isDarkMode ? 'border-gray-600 text-gray-300' : ''}
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Liste des listes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne gauche : Liste des listes */}
          <div className="lg:col-span-1">
            <h2 className={cn('text-xl font-bold mb-4', isDarkMode ? 'text-white' : 'text-gray-900')}>
              Mes listes
            </h2>
            <div className="space-y-2">
              {lists.map((list) => (
                <Card
                  key={list.id}
                  className={cn(
                    'cursor-pointer transition-all',
                    selectedList?.id === list.id
                      ? isDarkMode
                        ? 'bg-blue-900 border-blue-700'
                        : 'bg-blue-100 border-blue-300'
                      : isDarkMode
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                      : 'bg-white hover:bg-gray-50'
                  )}
                  onClick={() => setSelectedList(list)}
                >
                  <CardContent className="p-4">
                    <h3 className={cn('font-semibold', isDarkMode ? 'text-white' : 'text-gray-900')}>
                      {list.name}
                    </h3>
                    <p className={cn('text-xs mt-1', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
                      {list.level} • {list.items.length} articles
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadList(list);
                        }}
                        className="p-1 rounded hover:bg-opacity-80 bg-blue-500 text-white"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteList(list.id);
                        }}
                        className="p-1 rounded hover:bg-opacity-80 bg-red-500 text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Colonne droite : Détails de la liste sélectionnée */}
          {selectedList && (
            <div className="lg:col-span-2">
              <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardHeader>
                  <CardTitle>{selectedList.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Code d'accès */}
                  <div>
                    <h3 className={cn('font-semibold mb-2', isDarkMode ? 'text-white' : 'text-gray-900')}>
                      Code d'accès pour les parents
                    </h3>
                    <div className="flex gap-2">
                      <Input
                        value={selectedList.shareCode}
                        readOnly
                        className={cn(
                          'font-mono font-bold',
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100'
                        )}
                      />
                      <Button
                        onClick={() => handleCopyCode(selectedList.shareCode)}
                        className={cn(
                          'transition-all',
                          copiedCode === selectedList.shareCode
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-blue-500 hover:bg-blue-600'
                        )}
                      >
                        {copiedCode === selectedList.shareCode ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Statistiques de la liste */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className={cn('p-4 rounded-lg', isDarkMode ? 'bg-gray-700' : 'bg-gray-100')}>
                      <p className={cn('text-xs', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
                        Consultations
                      </p>
                      <p className={cn('text-2xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
                        {selectedList.views}
                      </p>
                    </div>
                    <div className={cn('p-4 rounded-lg', isDarkMode ? 'bg-gray-700' : 'bg-gray-100')}>
                      <p className={cn('text-xs', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
                        Partages
                      </p>
                      <p className={cn('text-2xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
                        {selectedList.shares}
                      </p>
                    </div>
                    <div className={cn('p-4 rounded-lg', isDarkMode ? 'bg-gray-700' : 'bg-gray-100')}>
                      <p className={cn('text-xs', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
                        Commandes
                      </p>
                      <p className={cn('text-2xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
                        {selectedList.orders.length}
                      </p>
                    </div>
                  </div>

                  {/* Suivi des commandes */}
                  {selectedList.orders.length > 0 && (
                    <div>
                      <h3 className={cn('font-semibold mb-4', isDarkMode ? 'text-white' : 'text-gray-900')}>
                        Commandes des parents
                      </h3>
                      <div className="space-y-2">
                        {selectedList.orders.map((order) => (
                          <div
                            key={order.id}
                            className={cn(
                              'p-4 rounded-lg border',
                              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className={cn('font-semibold', isDarkMode ? 'text-white' : 'text-gray-900')}>
                                  {order.parentName}
                                </p>
                                <p className={cn('text-xs', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
                                  {order.parentEmail}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className={cn('font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
                                  {order.totalPrice} FCFA
                                </p>
                                <span
                                  className={cn(
                                    'text-xs px-2 py-1 rounded',
                                    order.status === 'delivered'
                                      ? 'bg-green-500 text-white'
                                      : order.status === 'shipped'
                                      ? 'bg-blue-500 text-white'
                                      : order.status === 'confirmed'
                                      ? 'bg-yellow-500 text-white'
                                      : 'bg-gray-500 text-white'
                                  )}
                                >
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
