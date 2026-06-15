import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import ImageWithFallback from "@/components/ImageWithFallback";
import { ProductGallery } from "@/components/ProductGallery";
import SocialShareButtons from "@/components/SocialShareButtons";
import { useState } from "react";
import { Star, ShoppingCart, ArrowLeft, Send, BookOpen, User, Calendar, Tag, AlertCircle, Check, Loader } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useToast, ToastContainer } from "@/components/Toast";

export default function ProductDetail() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [match, params] = useRoute("/product/:id");
  const productId = params?.id ? parseInt(params.id) : null;
  const { toasts, removeToast, success, error, warning } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: product } = trpc.products.getById.useQuery(
    { id: productId! },
    { enabled: !!productId }
  );

  const { data: reviews } = trpc.reviews.getByProduct.useQuery(
    { productId: productId! },
    { enabled: !!productId }
  );

  const { data: averageRating } = trpc.reviews.getAverageRating.useQuery(
    { productId: productId! },
    { enabled: !!productId }
  );

  const { data: galleryImages } = trpc.products.gallery.getImages.useQuery(
    { productId: productId! },
    { enabled: !!productId }
  );

  const { data: categories } = trpc.categories.list.useQuery();

  const addToCartMutation = trpc.cart.add.useMutation();
  const createReviewMutation = trpc.reviews.create.useMutation();

  if (!productId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 p-8">
        <div className="container mx-auto">
          <Button
            variant="outline"
            onClick={() => navigate("/products")}
            className="mb-6 border-blue-200 hover:bg-[#f0f7fb]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div className="text-center text-gray-500">ID de produit invalide</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/products")}
              className="text-[#005f8a] hover:text-[#004a6a] hover:bg-blue-50"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour au catalogue
            </Button>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="mb-4 text-gray-400">
              <BookOpen className="w-16 h-16 mx-auto opacity-50" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Produit non trouvé</h2>
            <p className="text-gray-600 mb-6">Le produit que vous recherchez n'existe pas ou a été supprimé.</p>
            <Button onClick={() => navigate("/products")} className="bg-[#005f8a] hover:bg-[#004a6b] text-white">
              Retourner au catalogue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    const utils = trpc.useUtils();
    addToCartMutation.mutate(
      { productId: product.id, quantity },
      {
        onSuccess: () => {
          success(`${product.title} ajouté au panier (x${quantity}) ✓`);
          setQuantity(1);
          // Invalider le cache du panier pour mettre à jour le badge
          utils.cart.list.invalidate();
        },
        onError: () => {
          error("Erreur lors de l'ajout au panier");
        },
      }
    );
  };

  const handleSubmitReview = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (!reviewTitle.trim() || !reviewContent.trim()) {
      warning("Veuillez remplir tous les champs");
      return;
    }

    createReviewMutation.mutate(
      {
        productId: product.id,
        rating: reviewRating,
        title: reviewTitle,
        content: reviewContent,
      },
      {
        onSuccess: () => {
          success("Avis publié avec succès! ✓");
          setReviewTitle("");
          setReviewContent("");
          setReviewRating(5);
          setShowReviewForm(false);
        },
        onError: (err) => {
          error((err as any).message || "Erreur lors de la publication de l'avis");
        },
      }
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const categoryName = categories?.find(c => c.id === product.categoryId)?.name || "Catégorie inconnue";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/products")}
            className="text-[#005f8a] hover:text-[#004a6a] hover:bg-blue-50"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour au catalogue
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        {/* Détails du produit */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          {/* Image Gallery */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              {galleryImages && galleryImages.length > 0 ? (
                <ProductGallery images={galleryImages} productTitle={product.title} />
              ) : (
                <ImageWithFallback
                  src={product.coverImageUrl || ""}
                  alt={product.title}
                  className="w-full h-auto rounded-lg"
                />
              )}
            </div>
          </div>

          {/* Informations */}
          <div className="lg:col-span-2">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-600 mb-6 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hover:text-[#005f8a] cursor-pointer" onClick={() => navigate("/products")}>
                Catalogue
              </span>
              <span>/</span>
              <span className="text-[#005f8a] font-medium">{categoryName}</span>
            </div>

            {/* Titre et auteur */}
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {product.title}
            </h1>
            <p className="text-xl text-gray-600 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-[#005f8a]" />
              par <span className="font-semibold">{product.author}</span>
            </p>

            {/* Note moyenne */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-200">
              <div className="flex items-center gap-2">
                {renderStars(Math.round(averageRating || 0))}
                <span className="font-semibold text-gray-900">
                  {averageRating ? averageRating.toFixed(1) : "N/A"}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                ({reviews?.length || 0} avis)
              </span>
            </div>

            {/* Prix et stock */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-slate-50 rounded-lg border border-blue-200">
              <div className="text-5xl font-bold text-[#005f8a] mb-4">
                {Number(product.price).toLocaleString()} FCFA
              </div>
              <div className="flex items-center gap-3">
                {product.stock > 0 ? (
                  <>
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-semibold">
                      En stock ({product.stock} exemplaires disponibles)
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-600 font-semibold">
                      Rupture de stock
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-8">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed text-base">
                  {product.description}
                </p>
              </div>
            )}

            {/* Détails supplémentaires */}
            <div className="grid grid-cols-2 gap-4 mb-8 p-6 bg-slate-50 rounded-lg">
              {product.isbn && (
                <div>
                  <p className="text-sm text-gray-600 font-medium">ISBN</p>
                  <p className="text-gray-900 font-mono">{product.isbn}</p>
                </div>
              )}
              {product.publisher && (
                <div>
                  <p className="text-sm text-gray-600 font-medium">Éditeur</p>
                  <p className="text-gray-900">{product.publisher}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 font-medium">Catégorie</p>
                <p className="text-gray-900">{categoryName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Référence</p>
                <p className="text-gray-900 font-mono">#{product.id}</p>
              </div>
            </div>

            {/* Sélection de quantité et ajout au panier */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center gap-3 bg-white border border-slate-300 rounded-lg p-3">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Quantité:
                </label>
                <Input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 border-0 text-center focus:ring-2 focus:ring-[#005f8a]"
                />
              </div>
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addToCartMutation.isPending}
                className="flex-1 bg-[#005f8a] hover:bg-[#004a6b] text-white text-lg py-6 rounded-lg font-semibold"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {addToCartMutation.isPending ? "Ajout..." : "Ajouter au panier"}
              </Button>
            </div>

            {/* Boutons de partage social */}
            <div className="border-t border-slate-200 pt-6">
              <p className="text-sm font-medium text-gray-700 mb-4">Partager ce produit</p>
              <SocialShareButtons
                title={product.title}
                author={product.author}
                url={`/product/${product.id}`}
                description={product.description || undefined}
                size="md"
                showLabel={true}
              />
            </div>
          </div>
        </div>

        {/* Section des avis */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Avis clients</h2>

          {/* Bouton pour ajouter un avis */}
          {isAuthenticated && (
            <Button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-[#005f8a] hover:bg-[#004a6b] text-white mb-6 font-semibold"
            >
              <Send className="w-4 h-4 mr-2" />
              {showReviewForm ? "Annuler" : "Laisser un avis"}
            </Button>
          )}

          {/* Formulaire d'avis */}
          {showReviewForm && isAuthenticated && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      Votre note
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= reviewRating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Titre de votre avis
                    </label>
                    <Input
                      placeholder="Ex: Excellent manuel, très complet"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="border-slate-300 focus:border-[#005f8a] focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Votre avis détaillé
                    </label>
                    <textarea
                      placeholder="Partagez votre expérience avec ce produit..."
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-[#005f8a] focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <Button
                    onClick={handleSubmitReview}
                    disabled={createReviewMutation.isPending}
                    className="w-full bg-[#005f8a] hover:bg-[#004a6b] text-white font-semibold"
                  >
                    {createReviewMutation.isPending ? "Publication..." : "Publier l'avis"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!isAuthenticated && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <a
                  href={getLoginUrl()}
                  className="text-[#005f8a] hover:text-[#004a6b] font-bold"
                >
                  Connectez-vous
                </a>
                {" "}pour laisser un avis
              </p>
            </div>
          )}

          {/* Liste des avis */}
          <div className="space-y-4">
            {reviews && reviews.length > 0 ? (
              reviews.map((review) => (
                <Card key={review.id} className="border-slate-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg">
                          {review.title}
                        </h4>
                        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <User className="w-4 h-4" />
                          Utilisateur #{review.userId}
                        </p>
                      </div>
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-gray-700 text-base leading-relaxed mb-3">
                      {review.content}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(review.createdAt).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-600 text-center py-12 text-lg">
                Aucun avis pour le moment. Soyez le premier à laisser un avis!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
