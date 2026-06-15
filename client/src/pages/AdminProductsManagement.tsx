import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit2, Trash2, Search, X, Loader2, Eye, Package, TrendingUp, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ErrorAlert } from "@/components/ErrorState";
import { LoadingSpinner } from "@/components/LoadingOverlay";
import { useToast, ToastContainer } from "@/components/Toast";

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  stock: number;
  image?: string;
}

interface FormData {
  title: string;
  author: string;
  publisher: string; // Éditeur du manuel
  description: string;
  price: string;
  categoryId: string;
  stock: string;
  coverImageUrl: string;
  isbn: string;
}

export default function AdminProductsManagement() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    author: "",
    publisher: "", // Éditeur
    description: "",
    price: "",
    categoryId: "",
    stock: "",
    coverImageUrl: "",
    isbn: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Vérifier l'authentification et les permissions
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground mb-4">
              Vous n'avez pas accès à cette page. Seuls les administrateurs peuvent gérer les produits.
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Récupérer les produits
  const { data: productsData, isLoading: productsLoading } = trpc.products.list.useQuery({
    limit: 100,
  });

  const { data: categories } = trpc.categories.list.useQuery();

  // Filtrer les produits
  const filteredProducts = productsData?.filter((p: any) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (p.title || p.name || "").toLowerCase().includes(searchLower) ||
      (p.author || "").toLowerCase().includes(searchLower) ||
      (p.isbn || "").toLowerCase().includes(searchLower)
    );
  }) || [];

  // Calculer les statistiques
  const stats = {
    total: productsData?.length || 0,
    lowStock: productsData?.filter((p: any) => p.stock > 0 && p.stock <= 10).length || 0,
    outOfStock: productsData?.filter((p: any) => p.stock === 0).length || 0,
    totalValue: productsData?.reduce((sum: number, p: any) => sum + (p.price * p.stock), 0) || 0,
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        title: product.name || "",
        author: (product as any).author || "",
        publisher: (product as any).publisher || "",
        description: product.description || "",
        price: product.price.toString(),
        categoryId: product.categoryId.toString(),
        stock: product.stock.toString(),
        coverImageUrl: (product as any).coverImageUrl || product.image || "",
        isbn: (product as any).isbn || "",
      });
    } else {
      setEditingProduct(null);
      setFormData({
        title: "",
        author: "",
        publisher: "",
        description: "",
        price: "",
        categoryId: "",
        stock: "",
        coverImageUrl: "",
        isbn: "",
      });
    }
    setError(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setFormData({
      title: "",
      author: "",
      publisher: "",
      description: "",
      price: "",
      categoryId: "",
      stock: "",
      coverImageUrl: "",
      isbn: "",
    });
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const createMutation = trpc.productsCrud.create.useMutation();
  const updateMutation = trpc.productsCrud.update.useMutation();
  const deleteMutation = trpc.productsCrud.delete.useMutation();
  const utils = trpc.useUtils();

  const handleSaveProduct = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Validation
      if (!formData.title.trim()) {
        setError("Le nom du produit est requis");
        setIsLoading(false);
        return;
      }
      if (!formData.author.trim()) {
        setError("L'auteur est requis");
        setIsLoading(false);
        return;
      }
      if (!formData.publisher.trim()) {
        setError("L'éditeur est requis");
        setIsLoading(false);
        return;
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        setError("Le prix doit être un nombre positif");
        setIsLoading(false);
        return;
      }
      if (!formData.categoryId) {
        setError("La catégorie est requise");
        setIsLoading(false);
        return;
      }
      if (!formData.stock || parseInt(formData.stock) < 0) {
        setError("Le stock doit être un nombre positif");
        setIsLoading(false);
        return;
      }

      if (editingProduct) {
        // Mise à jour
        await updateMutation.mutateAsync({
          id: editingProduct.id,
          title: formData.title.trim(),
          author: formData.author.trim(),
          publisher: formData.publisher.trim(),
          description: formData.description.trim(),
          price: formData.price,
          categoryId: parseInt(formData.categoryId),
          stock: parseInt(formData.stock),
          coverImageUrl: formData.coverImageUrl.trim() || undefined,
          isbn: formData.isbn.trim() || undefined,
        });
        success("Produit mis à jour avec succès");
      } else {
        // Création
        await createMutation.mutateAsync({
          title: formData.title.trim(),
          author: formData.author.trim(),
          publisher: formData.publisher.trim(),
          description: formData.description.trim(),
          price: formData.price,
          categoryId: parseInt(formData.categoryId),
          stock: parseInt(formData.stock),
          coverImageUrl: formData.coverImageUrl.trim() || undefined,
          isbn: formData.isbn.trim() || undefined,
        });
        success("Produit créé avec succès");
      }

      // Invalider le cache des produits
      await utils.products.list.invalidate();
      handleCloseDialog();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur s'est produite";
      setError(message);
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit?")) {
      try {
        await deleteMutation.mutateAsync({ id: productId });
        success("Produit supprimé avec succès");
        await utils.products.list.invalidate();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la suppression";
        showError(message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Gestion du Catalogue</h1>
          <p className="text-gray-600 text-lg">
            Gérez l'inventaire et les détails de vos produits
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-500 bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Produits</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <Package className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500 bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Stock Faible</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.lowStock}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-yellow-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500 bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Rupture Stock</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">{stats.outOfStock}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500 bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Valeur Stock</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{(stats.totalValue / 1000000).toFixed(1)}M</p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barre d'outils */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par titre, auteur ou ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-slate-300 focus:border-[#005f8a] focus:ring-blue-600"
            />
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2 bg-[#005f8a] hover:bg-[#004a6b] text-white font-semibold">
            <Plus className="h-4 w-4" />
            Ajouter Produit
          </Button>
        </div>

        {/* Tableau des produits */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
            <CardTitle className="text-xl font-bold text-gray-900">
              Produits ({filteredProducts.length}/{stats.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun produit trouvé
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-bold">Titre</TableHead>
                      <TableHead className="font-bold">Auteur</TableHead>
                      <TableHead className="font-bold">Catégorie</TableHead>
                      <TableHead className="text-right font-bold">Prix</TableHead>
                      <TableHead className="text-center font-bold">Stock</TableHead>
                      <TableHead className="text-center font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product: any) => (
                      <TableRow key={product.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-medium max-w-xs truncate">{product.title || (product as any).name || "Sans titre"}</TableCell>
                        <TableCell className="text-sm text-gray-600">{(product as any).author || "N/A"}</TableCell>
                        <TableCell>
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {categories?.find((c: any) => c.id === product.categoryId)?.name || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-[#005f8a]">
                          {(product.price || 0).toLocaleString("fr-FR")} FCFA
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                              product.stock > 10
                                ? "bg-green-100 text-green-800"
                                : product.stock > 0
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.stock}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(product)}
                              className="hover:bg-blue-50"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de création/édition */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {editingProduct ? "Modifier le produit" : "Créer un nouveau produit"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <ErrorAlert
                message={error}
                onDismiss={() => setError(null)}
              />
            )}

            <div>
              <label className="text-sm font-bold text-gray-900 mb-2 block">Titre du produit *</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="Ex: Mathématiques - Classe 6ème"
                className="border-slate-300 focus:border-[#005f8a] focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">Auteur *</label>
                <Input
                  name="author"
                  value={formData.author}
                  onChange={handleFormChange}
                  placeholder="Ex: Jean Dupont"
                  className="border-slate-300 focus:border-[#005f8a] focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">Éditeur *</label>
                <Input
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleFormChange}
                  placeholder="Ex: Hachette, Nathan, Bordas"
                  className="border-slate-300 focus:border-[#005f8a] focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-900 mb-2 block">Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Description détaillée du produit"
                rows={3}
                className="border-slate-300 focus:border-[#005f8a] focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">Catégorie *</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-[#005f8a] focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories?.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">Prix (FCFA) *</label>
                <Input
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleFormChange}
                  placeholder="0"
                  min="0"
                  className="border-slate-300 focus:border-[#005f8a] focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">Stock *</label>
                <Input
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleFormChange}
                  placeholder="0"
                  min="0"
                  className="border-slate-300 focus:border-[#005f8a] focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">ISBN</label>
                <Input
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleFormChange}
                  placeholder="978-3-16-148410-0"
                  className="border-slate-300 focus:border-[#005f8a] focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-900 mb-2 block">URL de l'image de couverture</label>
              <Input
                name="coverImageUrl"
                type="url"
                value={formData.coverImageUrl}
                onChange={handleFormChange}
                placeholder="https://..."
                className="border-slate-300 focus:border-[#005f8a] focus:ring-blue-600"
              />
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={handleCloseDialog} disabled={isLoading} className="border-slate-300">
              Annuler
            </Button>
            <Button onClick={handleSaveProduct} disabled={isLoading} className="bg-[#005f8a] hover:bg-[#004a6b] text-white font-semibold">
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingProduct ? "Mettre à jour" : "Créer le produit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
