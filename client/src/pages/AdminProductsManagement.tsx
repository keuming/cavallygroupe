import { useState, useRef } from "react";
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
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Loader2,
  Package,
  TrendingUp,
  AlertTriangle,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ErrorAlert } from "@/components/ErrorState";
import { LoadingSpinner } from "@/components/LoadingOverlay";
import { useToast, ToastContainer } from "@/components/Toast";

interface Product {
  id: number;
  title?: string;
  name?: string;
  author?: string;
  publisher?: string;
  description?: string;
  price: number;
  categoryId: number;
  stock: number;
  coverImageUrl?: string;
  image?: string;
  isbn?: string;
  educationLevelId?: number;
  educationClassId?: number;
}

interface FormData {
  title: string;
  author: string;
  publisher: string;
  description: string;
  price: string;
  categoryId: string;
  stock: string;
  coverImageUrl: string;
  isbn: string;
  educationLevelId: string;
  educationClassId: string;
}

const EMPTY_FORM: FormData = {
  title: "",
  author: "",
  publisher: "",
  description: "",
  price: "",
  categoryId: "",
  stock: "",
  coverImageUrl: "",
  isbn: "",
  educationLevelId: "",
  educationClassId: "",
};

export default function AdminProductsManagement() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  // États pour l'upload d'image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "reading" | "uploading" | "done" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Ref stable pour conserver le preview même pendant les re-renders du Dialog
  const imagePreviewRef = useRef<string | null>(null);
  const imageFileRef = useRef<File | null>(null);

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground mb-4">
              Accès réservé aux administrateurs.
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: productsData, isLoading: productsLoading } = trpc.products.list.useQuery({ limit: 100 });
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: educationLevels } = trpc.education.getLevels.useQuery();
  const { data: educationClasses } = trpc.education.getClasses.useQuery(
    { levelId: parseInt(formData.educationLevelId) },
    { enabled: !!formData.educationLevelId }
  );

  const getUploadUrlMutation = trpc.products.getUploadUrl.useMutation();
  const createMutation = trpc.productsCrud.create.useMutation();
  const updateMutation = trpc.productsCrud.update.useMutation();
  const deleteMutation = trpc.productsCrud.delete.useMutation();
  const utils = trpc.useUtils();

  const filteredProducts = productsData?.filter((p: any) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (p.title || p.name || "").toLowerCase().includes(searchLower) ||
      (p.author || "").toLowerCase().includes(searchLower) ||
      (p.isbn || "").toLowerCase().includes(searchLower)
    );
  }) || [];

  const stats = {
    total: productsData?.length || 0,
    lowStock: productsData?.filter((p: any) => p.stock > 0 && p.stock <= 10).length || 0,
    outOfStock: productsData?.filter((p: any) => p.stock === 0).length || 0,
    totalValue: productsData?.reduce((sum: number, p: any) => sum + (parseFloat(p.price) * p.stock), 0) || 0,
  };

  // Gestion de la sélection d'image
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Seules les images sont acceptées (JPG, PNG, WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5 MB");
      return;
    }

    setError(null);
    setUploadStatus("reading");
    setUploadProgress(0);

    // Lire le fichier et définir preview + file en même temps dans le callback
    const reader = new FileReader();
    reader.onloadstart = () => setUploadProgress(10);
    reader.onprogress = (ev) => {
      if (ev.lengthComputable) {
        setUploadProgress(Math.round((ev.loaded / ev.total) * 40) + 10);
      }
    };
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      // Stocker dans le ref D'ABORD (stable, pas affecté par les re-renders)
      imagePreviewRef.current = dataUrl;
      imageFileRef.current = file;
      // Puis mettre à jour le state pour déclencher le re-render
      setImageFile(file);
      setImagePreview(dataUrl);
      setUploadProgress(50);
      setUploadStatus("idle");
    };
    reader.onerror = () => {
      setError("Erreur lors de la lecture du fichier");
      setUploadStatus("error");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    imagePreviewRef.current = null;
    imageFileRef.current = null;
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
    setUploadStatus("idle");
    setFormData((prev) => ({ ...prev, coverImageUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Upload vers S3 via presigned URL avec progression réelle
  const uploadImageToS3 = async (file: File): Promise<string> => {
    setIsUploadingImage(true);
    setUploadStatus("uploading");
    setUploadProgress(50);

    try {
      const { uploadUrl, publicUrl } = await getUploadUrlMutation.mutateAsync({
        fileName: file.name,
        fileType: file.type,
      });

      setUploadProgress(60);

      // Utiliser XMLHttpRequest pour avoir la progression réelle
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (ev) => {
          if (ev.lengthComputable) {
            // Progression de 60% à 95%
            const pct = Math.round((ev.loaded / ev.total) * 35) + 60;
            setUploadProgress(pct);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadProgress(100);
            setUploadStatus("done");
            resolve();
          } else {
            reject(new Error(`Upload S3 échoué: ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Erreur réseau lors de l'upload")));
        xhr.addEventListener("abort", () => reject(new Error("Upload annulé")));

        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      return publicUrl;
    } catch (err) {
      setUploadStatus("error");
      setUploadProgress(0);
      throw err;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        title: product.title || product.name || "",
        author: product.author || "",
        publisher: product.publisher || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        categoryId: product.categoryId?.toString() || "",
        stock: product.stock?.toString() || "",
        coverImageUrl: product.coverImageUrl || product.image || "",
        isbn: product.isbn || "",
        educationLevelId: product.educationLevelId?.toString() || "",
        educationClassId: product.educationClassId?.toString() || "",
      });
      if (product.coverImageUrl || product.image) {
        setImagePreview(product.coverImageUrl || product.image || null);
      }
    } else {
      setEditingProduct(null);
      setFormData(EMPTY_FORM);
      setImagePreview(null);
    }
    setImageFile(null);
    setError(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
    imagePreviewRef.current = null;
    imageFileRef.current = null;
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
    setUploadStatus("idle");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Reset classe si le niveau change
    if (name === "educationLevelId") {
      setFormData((prev) => ({ ...prev, educationLevelId: value, educationClassId: "" }));
    }
  };

  const handleSaveProduct = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Validations
      if (!formData.title.trim()) { setError("Le titre est requis"); return; }
      if (!formData.author.trim()) { setError("L'auteur est requis"); return; }
      if (!formData.publisher.trim()) { setError("L'éditeur est requis"); return; }
      if (!formData.price || parseFloat(formData.price) <= 0) { setError("Prix invalide"); return; }
      if (!formData.categoryId) { setError("La catégorie est requise"); return; }
      if (formData.stock === "" || parseInt(formData.stock) < 0) { setError("Stock invalide"); return; }

      // Upload image si un fichier est sélectionné
      let finalImageUrl = formData.coverImageUrl.trim() || undefined;
      if (imageFile) {
        try {
          finalImageUrl = await uploadImageToS3(imageFile);
        } catch (uploadErr) {
          setError("Erreur lors de l'upload de l'image. Vérifiez la configuration S3.");
          return;
        }
      }

      // Normaliser le prix (remplacer virgule par point)
      const normalizedPrice = formData.price.replace(",", ".");

      const payload = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        publisher: formData.publisher.trim(),
        description: formData.description.trim(),
        price: normalizedPrice,
        categoryId: parseInt(formData.categoryId),
        stock: parseInt(formData.stock),
        coverImageUrl: finalImageUrl,
        isbn: formData.isbn.trim() || undefined,
        educationLevelId: formData.educationLevelId ? parseInt(formData.educationLevelId) : undefined,
        educationClassId: formData.educationClassId ? parseInt(formData.educationClassId) : undefined,
      };

      if (editingProduct) {
        await updateMutation.mutateAsync({ id: editingProduct.id, ...payload });
        success("Produit mis à jour avec succès ✓");
      } else {
        await createMutation.mutateAsync(payload);
        success("Produit créé avec succès ✓");
      }

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
    if (confirm("Supprimer ce produit définitivement ?")) {
      try {
        await deleteMutation.mutateAsync({ id: productId });
        success("Produit supprimé");
        await utils.products.list.invalidate();
      } catch (err) {
        showError(err instanceof Error ? err.message : "Erreur lors de la suppression");
      }
    }
  };

  const s3Configured = !!(
    import.meta.env.VITE_S3_CONFIGURED !== "false"
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Gestion du Catalogue</h1>
          <p className="text-gray-600 text-lg">Gérez l'inventaire et les détails de vos produits</p>
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
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {(stats.totalValue / 1000000).toFixed(1)}M FCFA
                  </p>
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
              className="pl-10"
            />
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2 bg-[#005f8a] hover:bg-[#004a6b] text-white">
            <Plus className="h-4 w-4" />
            Ajouter un produit
          </Button>
        </div>

        {/* Tableau */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
            <CardTitle className="text-xl font-bold text-gray-900">
              Produits ({filteredProducts.length}/{stats.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="flex justify-center py-8"><LoadingSpinner /></div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun produit trouvé
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-bold w-16">Image</TableHead>
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
                        <TableCell>
                          {product.coverImageUrl ? (
                            <img
                              src={product.coverImageUrl}
                              alt={product.title}
                              className="w-10 h-14 object-cover rounded shadow-sm"
                            />
                          ) : (
                            <div className="w-10 h-14 bg-slate-100 rounded flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-slate-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium max-w-xs truncate">
                          {product.title || product.name || "Sans titre"}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{product.author || "N/A"}</TableCell>
                        <TableCell>
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {categories?.find((c: any) => c.id === product.categoryId)?.name || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-[#005f8a]">
                          {parseFloat(product.price || 0).toLocaleString("fr-FR")} FCFA
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                            product.stock > 10 ? "bg-green-100 text-green-800"
                            : product.stock > 0 ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                          }`}>
                            {product.stock}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-2 justify-center">
                            <Button variant="outline" size="sm" onClick={() => handleOpenDialog(product)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}>
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

      {/* Dialog Création / Édition */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          // Ne fermer le dialog que si l'utilisateur clique explicitement Annuler
          // Ignorer les fermetures déclenchées par le file picker natif
          if (!open && !imageFileRef.current) {
            handleCloseDialog();
          } else if (!open && imageFileRef.current) {
            // Le file picker vient de se fermer — ne pas fermer le Dialog
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {editingProduct ? "Modifier le produit" : "Ajouter un produit"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

            {/* Upload image */}
            <div>
              <label className="text-sm font-bold text-gray-900 mb-2 block">
                Image de couverture
              </label>

              {/* Zone principale : preview OU dropzone */}
              {(imagePreview || imagePreviewRef.current) ? (
                <div className="space-y-3">
                  <div className="relative inline-block">
                    <img
                      src={imagePreview || imagePreviewRef.current || ""}
                      alt="Prévisualisation"
                      className="h-40 w-32 object-cover rounded-lg border border-slate-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Barre de progression (visible pendant upload S3) */}
                  {isUploadingImage && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>
                          {uploadStatus === "uploading" ? "Upload vers S3 en cours..." : "Traitement..."}
                        </span>
                        <span className="font-bold text-[#005f8a]">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-300 ease-out"
                          style={{
                            width: `${uploadProgress}%`,
                            background: uploadProgress === 100
                              ? "#16a34a"
                              : "linear-gradient(90deg, #005f8a, #0284c7)",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Confirmation upload terminé */}
                  {uploadStatus === "done" && !isUploadingImage && (
                    <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <span>✓</span> Image uploadée sur S3 avec succès
                    </p>
                  )}

                  {/* Nom du fichier */}
                  {imageFile && !isUploadingImage && uploadStatus !== "done" && (
                    <p className="text-xs text-gray-500 truncate max-w-xs">
                      📎 {imageFile.name} ({(imageFile.size / 1024).toFixed(0)} KB)
                    </p>
                  )}

                  {/* Changer l'image */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-[#005f8a] hover:underline"
                  >
                    Changer l'image
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Zone de dépôt */}
                  {uploadStatus === "reading" ? (
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50">
                      <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
                      <p className="text-sm font-medium text-blue-700">Chargement de l'image...</p>
                      <div className="w-full bg-blue-200 rounded-full h-1.5 mt-3 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#005f8a] hover:bg-blue-50 transition-colors"
                    >
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">Cliquer pour choisir une image</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP — max 5 MB</p>
                    </div>
                  )}

                  {/* URL directe */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Ou saisir une URL directement :</p>
                    <Input
                      name="coverImageUrl"
                      type="url"
                      value={formData.coverImageUrl}
                      onChange={handleFormChange}
                      placeholder="https://exemple.com/image.jpg"
                      className="text-sm"
                    />
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {/* Titre */}
            <div>
              <label className="text-sm font-bold text-gray-900 mb-2 block">Titre *</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="Ex: Mathématiques — Classe de 6ème"
              />
            </div>

            {/* Auteur / Éditeur */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">Auteur *</label>
                <Input
                  name="author"
                  value={formData.author}
                  onChange={handleFormChange}
                  placeholder="Ex: Jean Dupont"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">Éditeur *</label>
                <Input
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleFormChange}
                  placeholder="Ex: Hachette, Nathan"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-bold text-gray-900 mb-2 block">Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Description du produit"
                rows={3}
              />
            </div>

            {/* Catégorie / Prix */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">Catégorie *</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-[#005f8a] focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="">Sélectionner...</option>
                  {categories?.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">Prix (FCFA) *</label>
                <Input
                  name="price"
                  type="text"
                  inputMode="decimal"
                  value={formData.price}
                  onChange={handleFormChange}
                  placeholder="Ex: 2500"
                />
              </div>
            </div>

            {/* Stock / ISBN */}
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
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">ISBN</label>
                <Input
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleFormChange}
                  placeholder="978-3-16-148410-0"
                />
              </div>
            </div>

            {/* Niveau / Classe d'éducation */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">Niveau scolaire</label>
                <select
                  name="educationLevelId"
                  value={formData.educationLevelId}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">Tous niveaux</option>
                  {educationLevels?.map((level: any) => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">Classe</label>
                <select
                  name="educationClassId"
                  value={formData.educationClassId}
                  onChange={handleFormChange}
                  disabled={!formData.educationLevelId}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white disabled:opacity-50"
                >
                  <option value="">Toutes classes</option>
                  {educationClasses?.map((cls: any) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 mt-4">
            <Button variant="outline" onClick={handleCloseDialog} disabled={isLoading || isUploadingImage}>
              Annuler
            </Button>
            <Button
              onClick={handleSaveProduct}
              disabled={isLoading || isUploadingImage}
              className="bg-[#005f8a] hover:bg-[#004a6b] text-white"
            >
              {(isLoading || isUploadingImage) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isUploadingImage ? "Upload en cours..." : isLoading ? "Enregistrement..." : editingProduct ? "Mettre à jour" : "Créer le produit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
