import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Upload,
  Plus,
  Trash2,
  Save,
  FileText,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { useQuickOrder, type QuickOrderItem } from "@/hooks/useQuickOrder";

export function QuickOrderForm() {
  const {
    currentList,
    isProcessing,
    error,
    createList,
    addItem,
    removeItem,
    updateItemQuantity,
    processFileUpload,
    saveList,
    reset,
  } = useQuickOrder();

  const [mode, setMode] = useState<"upload" | "manual" | null>(null);
  const [listName, setListName] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemPrice, setItemPrice] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateList = () => {
    if (!listName.trim()) {
      alert("Veuillez entrer un nom pour la liste");
      return;
    }
    createList(listName);
    setListName("");
  };

  const handleAddItem = () => {
    if (!itemName.trim() || itemQuantity < 1) {
      alert("Veuillez remplir tous les champs correctement");
      return;
    }

    const newItem: QuickOrderItem = {
      name: itemName,
      quantity: itemQuantity,
      price: itemPrice,
      matched: false,
    };

    addItem(newItem);
    setItemName("");
    setItemQuantity(1);
    setItemPrice(0);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = [
      "application/pdf",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Format non supporté. Utilisez PDF, Excel, JPG ou PNG."
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Le fichier est trop volumineux (max 10 MB)");
      return;
    }

    if (!currentList) {
      createList(file.name);
    }

    await processFileUpload(file);
  };

  const handleSaveList = () => {
    const saved = saveList();
    if (saved) {
      alert(`Liste "${saved.name}" sauvegardée avec succès!`);
      reset();
    }
  };

  if (!currentList) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-900">
        <CardHeader className="bg-yellow-50 dark:bg-gray-800 border-b border-yellow-200 dark:border-gray-700">
          <CardTitle className="text-yellow-900 dark:text-yellow-400">
            Commande Rapide - Créer une Nouvelle Liste
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nom de la liste
              </label>
              <Input
                placeholder="Ex: Liste de fournitures - Classe 6ème"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                className="border-yellow-200 focus:border-yellow-500"
              />
            </div>

            <Button
              onClick={handleCreateList}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Créer une Nouvelle Liste
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* En-tête de la liste */}
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader className="bg-yellow-50 dark:bg-gray-800 border-b border-yellow-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-yellow-900 dark:text-yellow-400">
                {currentList.name}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {currentList.items.length} article(s) - Total: {currentList.totalPrice.toLocaleString()} FCFA
              </p>
            </div>
            <div className="space-x-2">
              <Button
                onClick={handleSaveList}
                disabled={currentList.items.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
              <Button
                onClick={reset}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Annuler
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Sélection du mode */}
      {mode === null && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            className="cursor-pointer hover:border-yellow-500 transition-colors"
            onClick={() => setMode("upload")}
          >
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <Upload className="w-8 h-8 text-yellow-600 mx-auto" />
                <h3 className="font-semibold">Importer une Liste</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  PDF, Excel, JPG ou PNG
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:border-yellow-500 transition-colors"
            onClick={() => setMode("manual")}
          >
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <Plus className="w-8 h-8 text-yellow-600 mx-auto" />
                <h3 className="font-semibold">Saisie Manuelle</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ajouter les articles un par un
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mode Upload */}
      {mode === "upload" && (
        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle>Importer une Liste de Fournitures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-yellow-300 dark:border-yellow-700 rounded-lg p-8 text-center cursor-pointer hover:border-yellow-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.xls,.xlsx,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="hidden"
              />

              <div className="space-y-3">
                <div className="flex justify-center gap-4">
                  <FileText className="w-8 h-8 text-yellow-600" />
                  <ImageIcon className="w-8 h-8 text-yellow-600" />
                </div>
                <div>
                  <p className="font-semibold">Cliquez pour importer</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ou glissez-déposez votre fichier
                  </p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Formats acceptés: PDF, Excel, JPG, PNG (max 10 MB)
                </p>
              </div>
            </div>

            {isProcessing && (
              <div className="text-center text-yellow-600 dark:text-yellow-400">
                Traitement du fichier en cours...
              </div>
            )}

            {currentList.uploadedFile && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-300">
                  ✓ Fichier importé: {currentList.uploadedFile.name}
                </p>
              </div>
            )}

            <Button
              onClick={() => setMode(null)}
              variant="outline"
              className="w-full"
            >
              Retour
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Mode Saisie Manuelle */}
      {mode === "manual" && (
        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle>Ajouter des Articles Manuellement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nom de l'article
                </label>
                <Input
                  placeholder="Ex: Mathématiques 6ème"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Quantité
                </label>
                <Input
                  type="number"
                  min="1"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Prix unitaire (FCFA)
              </label>
              <Input
                type="number"
                min="0"
                value={itemPrice}
                onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <Button
              onClick={handleAddItem}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter l'Article
            </Button>

            <Button
              onClick={() => setMode(null)}
              variant="outline"
              className="w-full"
            >
              Retour
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Liste des articles */}
      {currentList.items.length > 0 && (
        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle>Articles de la Liste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentList.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.price ? `${item.price.toLocaleString()} FCFA × ${item.quantity}` : `Quantité: ${item.quantity}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItemQuantity(index, parseInt(e.target.value) || 1)
                      }
                      className="w-16"
                    />
                    <Button
                      onClick={() => removeItem(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Boutons d'action */}
      {mode !== null && (
        <div className="flex gap-2">
          <Button
            onClick={() => setMode(null)}
            variant="outline"
            className="flex-1"
          >
            Retour aux Options
          </Button>
        </div>
      )}
    </div>
  );
}
