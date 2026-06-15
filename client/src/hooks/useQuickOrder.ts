import { useState, useCallback } from "react";

export interface QuickOrderItem {
  productId?: number;
  name: string;
  quantity: number;
  price?: number;
  matched?: boolean;
}

export interface QuickOrderList {
  id: string;
  name: string;
  items: QuickOrderItem[];
  totalPrice: number;
  createdAt: Date;
  uploadedFile?: {
    name: string;
    type: "pdf" | "excel" | "image" | "manual";
    size: number;
  };
}

export function useQuickOrder() {
  const [lists, setLists] = useState<QuickOrderList[]>([]);
  const [currentList, setCurrentList] = useState<QuickOrderList | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Créer une nouvelle liste
  const createList = useCallback((name: string) => {
    const newList: QuickOrderList = {
      id: `list-${Date.now()}`,
      name,
      items: [],
      totalPrice: 0,
      createdAt: new Date(),
    };
    setCurrentList(newList);
    setError(null);
    return newList;
  }, []);

  // Ajouter un article manuellement
  const addItem = useCallback((item: QuickOrderItem) => {
    if (!currentList) return;

    const updatedItems = [...currentList.items, item];
    const totalPrice = updatedItems.reduce(
      (sum, i) => sum + (i.price || 0) * i.quantity,
      0
    );

    const updatedList = {
      ...currentList,
      items: updatedItems,
      totalPrice,
    };

    setCurrentList(updatedList);
    setError(null);
  }, [currentList]);

  // Supprimer un article
  const removeItem = useCallback(
    (index: number) => {
      if (!currentList) return;

      const updatedItems = currentList.items.filter((_, i) => i !== index);
      const totalPrice = updatedItems.reduce(
        (sum, i) => sum + (i.price || 0) * i.quantity,
        0
      );

      const updatedList = {
        ...currentList,
        items: updatedItems,
        totalPrice,
      };

      setCurrentList(updatedList);
    },
    [currentList]
  );

  // Mettre à jour la quantité d'un article
  const updateItemQuantity = useCallback(
    (index: number, quantity: number) => {
      if (!currentList || quantity < 1) return;

      const updatedItems = [...currentList.items];
      updatedItems[index].quantity = quantity;

      const totalPrice = updatedItems.reduce(
        (sum, i) => sum + (i.price || 0) * i.quantity,
        0
      );

      const updatedList = {
        ...currentList,
        items: updatedItems,
        totalPrice,
      };

      setCurrentList(updatedList);
    },
    [currentList]
  );

  // Traiter l'upload de fichier
  const processFileUpload = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      setError(null);

      try {
        const fileType = file.type;
        let items: QuickOrderItem[] = [];

        // Déterminer le type de fichier
        if (fileType === "application/pdf") {
          items = await processPDF(file);
        } else if (
          fileType === "application/vnd.ms-excel" ||
          fileType ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ) {
          items = await processExcel(file);
        } else if (fileType.startsWith("image/")) {
          items = await processImage(file);
        } else {
          throw new Error(
            "Format de fichier non supporté. Utilisez PDF, Excel, JPG ou PNG."
          );
        }

        if (!currentList) {
          createList(file.name);
        }

        // Ajouter les articles extraits
        items.forEach((item) => {
          addItem(item);
        });

        // Mettre à jour les informations du fichier uploadé
        if (currentList) {
          setCurrentList({
            ...currentList,
            uploadedFile: {
              name: file.name,
              type: fileType.startsWith("image/")
                ? "image"
                : fileType === "application/pdf"
                  ? "pdf"
                  : "excel",
              size: file.size,
            },
          });
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erreur lors du traitement du fichier"
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [currentList, createList, addItem]
  );

  // Traiter PDF (placeholder - nécessite une bibliothèque PDF)
  const processPDF = async (file: File): Promise<QuickOrderItem[]> => {
    // Dans une implémentation réelle, utiliser pdfjs ou similaire
    return [
      {
        name: "Article extrait du PDF",
        quantity: 1,
        matched: false,
      },
    ];
  };

  // Traiter Excel (placeholder - nécessite une bibliothèque Excel)
  const processExcel = async (file: File): Promise<QuickOrderItem[]> => {
    // Dans une implémentation réelle, utiliser xlsx ou similaire
    return [
      {
        name: "Article extrait du fichier Excel",
        quantity: 1,
        matched: false,
      },
    ];
  };

  // Traiter Image avec OCR
  const processImage = async (file: File): Promise<QuickOrderItem[]> => {
    // Dans une implémentation réelle, utiliser Tesseract.js pour l'OCR
    return [
      {
        name: "Article extrait de l'image",
        quantity: 1,
        matched: false,
      },
    ];
  };

  // Sauvegarder la liste
  const saveList = useCallback(() => {
    if (!currentList || currentList.items.length === 0) {
      setError("La liste doit contenir au moins un article");
      return;
    }

    setLists([...lists, currentList]);
    localStorage.setItem(
      `quickOrder-${currentList.id}`,
      JSON.stringify(currentList)
    );
    setError(null);
    return currentList;
  }, [currentList, lists]);

  // Charger une liste sauvegardée
  const loadList = useCallback((id: string) => {
    const saved = localStorage.getItem(`quickOrder-${id}`);
    if (saved) {
      const list = JSON.parse(saved) as QuickOrderList;
      setCurrentList(list);
      setError(null);
      return list;
    }
    setError("Liste non trouvée");
    return null;
  }, []);

  // Supprimer une liste sauvegardée
  const deleteList = useCallback((id: string) => {
    setLists(lists.filter((l) => l.id !== id));
    localStorage.removeItem(`quickOrder-${id}`);
    if (currentList?.id === id) {
      setCurrentList(null);
    }
  }, [lists, currentList]);

  // Réinitialiser
  const reset = useCallback(() => {
    setCurrentList(null);
    setError(null);
    setIsProcessing(false);
  }, []);

  return {
    lists,
    currentList,
    isProcessing,
    error,
    createList,
    addItem,
    removeItem,
    updateItemQuantity,
    processFileUpload,
    saveList,
    loadList,
    deleteList,
    reset,
  };
}
