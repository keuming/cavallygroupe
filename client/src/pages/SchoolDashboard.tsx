import React, { useState } from "react";
import { Plus, Trash2, Share2, Download, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSchoolDashboard } from "@/hooks/useSchoolDashboard";
import { useDarkMode } from "@/hooks/useDarkMode";

const LEVELS = [
  { id: "maternelle-petite", label: "Maternelle - Petite Section" },
  { id: "maternelle-moyenne", label: "Maternelle - Moyenne Section" },
  { id: "maternelle-grande", label: "Maternelle - Grande Section" },
  { id: "primaire", label: "Primaire" },
  { id: "collège", label: "Premier Cycle (Collège)" },
  { id: "lycée", label: "Secondaire (Lycée)" },
  { id: "autre", label: "Autres Niveaux" },
];

export function SchoolDashboard() {
  const { isDarkMode } = useDarkMode();
  const {
    lists,
    createList,
    updateList,
    deleteList,
    addItem,
    removeItem,
    publishList,
    calculateTotal,
  } = useSchoolDashboard();

  const [schoolName, setSchoolName] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("primaire");
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemPrice, setItemPrice] = useState(0);

  const selectedList = lists.find((l) => l.id === selectedListId);

  const handleCreateList = () => {
    if (!schoolName.trim()) {
      alert("Veuillez entrer le nom de l'établissement");
      return;
    }
    const newList = createList(schoolName, selectedLevel as any);
    setSelectedListId(newList.id);
    setSchoolName("");
  };

  const handleAddItem = () => {
    if (!selectedListId || !itemName.trim()) {
      alert("Veuillez sélectionner une liste et entrer un nom d'article");
      return;
    }
    addItem(selectedListId, {
      name: itemName,
      quantity: itemQuantity,
      price: itemPrice,
      category: "Fournitures",
    });
    setItemName("");
    setItemQuantity(1);
    setItemPrice(0);
  };

  const handlePublish = (listId: string) => {
    publishList(listId);
    alert("Liste publiée! Les parents peuvent maintenant y accéder.");
  };

  const handleDownload = (listId: string) => {
    const list = lists.find((l) => l.id === listId);
    if (!list) return;

    const csv = [
      ["Établissement", list.schoolName],
      ["Niveau", LEVELS.find((l) => l.id === list.level)?.label || list.level],
      ["Date", new Date(list.updatedAt).toLocaleDateString("fr-FR")],
      [],
      ["Article", "Quantité", "Prix Unitaire", "Total"],
      ...list.items.map((item) => [
        item.name,
        item.quantity.toString(),
        item.price.toString(),
        (item.quantity * item.price).toString(),
      ]),
      [],
      ["TOTAL", "", "", calculateTotal(listId).toString()],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `liste-fournitures-${list.schoolName}.csv`;
    a.click();
  };

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? "bg-gray-900" : "bg-yellow-50"}`}>
      <div className="max-w-6xl mx-auto">
        <h1 className={`text-3xl font-bold mb-8 ${isDarkMode ? "text-yellow-400" : "text-yellow-900"}`}>
          Dashboard Établissements Scolaires
        </h1>

        {/* Création de nouvelle liste */}
        <Card className={`mb-8 ${isDarkMode ? "bg-gray-800 border-gray-700" : ""}`}>
          <CardHeader>
            <CardTitle>Créer une Nouvelle Liste</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : ""}`}>
                  Nom de l'établissement
                </label>
                <Input
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Ex: École Primaire ABC"
                  className={isDarkMode ? "bg-gray-700 border-gray-600" : ""}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : ""}`}>
                  Niveau d'étude
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "border-yellow-200"
                  }`}
                >
                  {LEVELS.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleCreateList}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer Liste
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des établissements */}
          <div className="lg:col-span-1">
            <Card className={isDarkMode ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle>Mes Listes ({lists.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {lists.length === 0 ? (
                  <p className={`text-sm text-center py-4 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                    Aucune liste créée
                  </p>
                ) : (
                  lists.map((list) => (
                    <button
                      key={list.id}
                      onClick={() => setSelectedListId(list.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedListId === list.id
                          ? isDarkMode
                            ? "bg-yellow-600 text-white"
                            : "bg-yellow-500 text-white"
                          : isDarkMode
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      <div className="font-medium">{list.schoolName}</div>
                      <div className="text-xs opacity-75">
                        {LEVELS.find((l) => l.id === list.level)?.label}
                      </div>
                      <div className="text-xs opacity-75">
                        {list.items.length} articles
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Détails et édition */}
          {selectedList && (
            <div className="lg:col-span-2 space-y-4">
              {/* En-tête de la liste */}
              <Card className={isDarkMode ? "bg-gray-800 border-gray-700" : ""}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{selectedList.schoolName}</CardTitle>
                      <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {LEVELS.find((l) => l.id === selectedList.level)?.label}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleDownload(selectedList.id)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handlePublish(selectedList.id)}
                        size="sm"
                        className={`${
                          selectedList.isPublished
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-orange-600 hover:bg-orange-700"
                        } text-white`}
                      >
                        {selectedList.isPublished ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        onClick={() => deleteList(selectedList.id)}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Ajouter un article */}
              <Card className={isDarkMode ? "bg-gray-800 border-gray-700" : ""}>
                <CardHeader>
                  <CardTitle className="text-lg">Ajouter un Article</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="Nom de l'article"
                    className={isDarkMode ? "bg-gray-700 border-gray-600" : ""}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      min="1"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      placeholder="Quantité"
                      className={isDarkMode ? "bg-gray-700 border-gray-600" : ""}
                    />
                    <Input
                      type="number"
                      min="0"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="Prix (FCFA)"
                      className={isDarkMode ? "bg-gray-700 border-gray-600" : ""}
                    />
                  </div>
                  <Button
                    onClick={handleAddItem}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </CardContent>
              </Card>

              {/* Liste des articles */}
              <Card className={isDarkMode ? "bg-gray-800 border-gray-700" : ""}>
                <CardHeader>
                  <CardTitle className="text-lg">Articles ({selectedList.items.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedList.items.length === 0 ? (
                    <p className={`text-sm text-center py-4 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                      Aucun article
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedList.items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex justify-between items-center p-3 rounded-lg ${
                            isDarkMode ? "bg-gray-700" : "bg-gray-50"
                          }`}
                        >
                          <div className="flex-1">
                            <p className={`font-medium ${isDarkMode ? "text-gray-300" : ""}`}>
                              {item.name}
                            </p>
                            <p className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-600"}`}>
                              {item.quantity} × {item.price} FCFA = {item.quantity * item.price} FCFA
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(selectedList.id, item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <div
                        className={`mt-4 p-4 rounded-lg border-t-2 ${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600"
                            : "bg-yellow-50 border-yellow-200"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`font-semibold ${isDarkMode ? "text-gray-300" : ""}`}>
                            Total:
                          </span>
                          <span
                            className={`text-2xl font-bold ${
                              isDarkMode ? "text-yellow-400" : "text-yellow-600"
                            }`}
                          >
                            {calculateTotal(selectedList.id).toLocaleString()} FCFA
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Code d'accès */}
              {selectedList.isPublished && (
                <Card className={`${isDarkMode ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200"}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${isDarkMode ? "text-green-400" : "text-green-700"}`}>
                          Code d'accès pour les parents:
                        </p>
                        <p className={`text-2xl font-bold ${isDarkMode ? "text-green-300" : "text-green-600"}`}>
                          {selectedList.accessCode}
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedList.accessCode || "");
                          alert("Code copié!");
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Copier
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
