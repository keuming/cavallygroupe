import { useLocation, useParams } from 'wouter';
import { ChevronRight, ShoppingCart, Heart } from 'lucide-react';
import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';

// Mapping des classes avec leurs noms complets
const EDUCATION_CLASSES = {
  // Maternelle
  'toute-petite-section': { category: 'Maternelle', name: 'Toute Petite Section', icon: '🎨' },
  'petite-section': { category: 'Maternelle', name: 'Petite Section', icon: '🎨' },
  'moyenne-section': { category: 'Maternelle', name: 'Moyenne Section', icon: '🎨' },
  'grande-section': { category: 'Maternelle', name: 'Grande Section', icon: '🎨' },
  
  // Primaire
  'cp1': { category: 'Primaire', name: 'CP1', icon: '📚' },
  'cp2': { category: 'Primaire', name: 'CP2', icon: '📚' },
  'ce1': { category: 'Primaire', name: 'CE1', icon: '📚' },
  'ce2': { category: 'Primaire', name: 'CE2', icon: '📚' },
  'cm1': { category: 'Primaire', name: 'CM1', icon: '📚' },
  'cm2': { category: 'Primaire', name: 'CM2', icon: '📚' },
  
  // Premier Cycle
  '6eme': { category: 'Premier Cycle', name: 'Classe de 6ème', icon: '🎓' },
  '5eme': { category: 'Premier Cycle', name: 'Classe de 5ème', icon: '🎓' },
  '4eme': { category: 'Premier Cycle', name: 'Classe de 4ème', icon: '🎓' },
  '3eme': { category: 'Premier Cycle', name: 'Classe de 3ème', icon: '🎓' },
  
  // Second Cycle
  'seconde-a': { category: 'Second Cycle', name: 'Classe de Seconde A', icon: '📖' },
  'seconde-c': { category: 'Second Cycle', name: 'Classe de Seconde C', icon: '📖' },
  'premiere-a': { category: 'Second Cycle', name: 'Classe de Première A', icon: '📖' },
  'premiere-c': { category: 'Second Cycle', name: 'Classe de Première C', icon: '📖' },
  'premiere-d': { category: 'Second Cycle', name: 'Classe de Première D', icon: '📖' },
  'terminale-a': { category: 'Second Cycle', name: 'Classe de Terminale A', icon: '📖' },
  'terminale-c': { category: 'Second Cycle', name: 'Classe de Terminale C', icon: '📖' },
  'terminale-d': { category: 'Second Cycle', name: 'Classe de Terminale D', icon: '📖' },
  
  // Second Cycle Technique
  'seconde-g': { category: 'Second Cycle Technique', name: 'Classe de Seconde G', icon: '⚙️' },
  'premiere-g': { category: 'Second Cycle Technique', name: 'Classe de Première G', icon: '⚙️' },
  'terminale-g': { category: 'Second Cycle Technique', name: 'Classe de Terminale G', icon: '⚙️' },
};

export function EducationClass() {
  const params = useParams();
  const [, navigate] = useLocation();
  const classId = params?.classId as string;
  const categoryId = params?.categoryId as string;
  const classInfo = EDUCATION_CLASSES[classId as keyof typeof EDUCATION_CLASSES];
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Récupérer tous les produits
  const { data: products = [] } = trpc.products.list.useQuery({});

  // Filtrer les produits par classe
  const filteredProducts = useMemo(() => {
    return products.filter((product: any) => 
      product.educationClass === classId || product.category === classInfo?.category
    );
  }, [products, classId, classInfo]);

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  if (!classInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Classe non trouvée</h1>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-sm">
          <button onClick={() => navigate('/')} className="text-yellow-600 hover:text-yellow-700">
            Accueil
          </button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <button onClick={() => navigate('/')} className="text-yellow-600 hover:text-yellow-700">
            Manuels Scolaires
          </button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700 font-medium">{classInfo.category}</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700 font-medium">{classInfo.name}</span>
        </div>
      </div>

      {/* En-tête de la classe */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{classInfo.icon}</span>
            <div>
              <p className="text-sm font-medium opacity-90">{classInfo.category}</p>
              <h1 className="text-4xl font-bold">{classInfo.name}</h1>
            </div>
          </div>
          <p className="text-yellow-800">
            Découvrez tous les manuels scolaires pour {classInfo.name.toLowerCase()}
          </p>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              Aucun produit disponible pour cette classe pour le moment.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              Voir tous les produits
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} disponible{filteredProducts.length > 1 ? 's' : ''}
              </p>
            </div>

            {/* Grille de produits */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product: any) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {/* Image du produit */}
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-4xl">📚</span>
                      </div>
                    )}
                    
                    {/* Bouton favori */}
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:shadow-lg transition-shadow"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.has(product.id)
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-400'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Contenu du produit */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    {product.author && (
                      <p className="text-sm text-gray-600 mb-3">{product.author}</p>
                    )}

                    {/* Prix */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-yellow-600">
                          {product.price?.toLocaleString()} FCFA
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            {product.originalPrice?.toLocaleString()} FCFA
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock */}
                    <p className="text-sm text-gray-500 mb-4">
                      Stock: {product.stock || 0}
                    </p>

                    {/* Bouton d'ajout au panier */}
                    <button className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg transition-colors">
                      <ShoppingCart className="w-4 h-4" />
                      <span>Ajouter au panier</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
