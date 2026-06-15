import { useState, useCallback } from "react";

export interface SchoolSupplyList {
  id: string;
  schoolName: string;
  level: "maternelle-petite" | "maternelle-moyenne" | "maternelle-grande" | "primaire" | "collège" | "lycée" | "autre";
  items: SupplyItem[];
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  accessCode?: string;
}

export interface SupplyItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
}

const STORAGE_KEY = "school_supply_lists";

export function useSchoolDashboard() {
  const [lists, setLists] = useState<SchoolSupplyList[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const saveLists = useCallback((newLists: SchoolSupplyList[]) => {
    setLists(newLists);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLists));
  }, []);

  const createList = useCallback(
    (schoolName: string, level: SchoolSupplyList["level"]) => {
      const newList: SchoolSupplyList = {
        id: `list-${Date.now()}`,
        schoolName,
        level,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublished: false,
        accessCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      };
      saveLists([...lists, newList]);
      return newList;
    },
    [lists, saveLists]
  );

  const updateList = useCallback(
    (id: string, updates: Partial<SchoolSupplyList>) => {
      const updated = lists.map((list) =>
        list.id === id
          ? { ...list, ...updates, updatedAt: new Date() }
          : list
      );
      saveLists(updated);
    },
    [lists, saveLists]
  );

  const deleteList = useCallback(
    (id: string) => {
      saveLists(lists.filter((list) => list.id !== id));
    },
    [lists, saveLists]
  );

  const addItem = useCallback(
    (listId: string, item: Omit<SupplyItem, "id">) => {
      const updated = lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: [
                ...list.items,
                { ...item, id: `item-${Date.now()}` },
              ],
              updatedAt: new Date(),
            }
          : list
      );
      saveLists(updated);
    },
    [lists, saveLists]
  );

  const removeItem = useCallback(
    (listId: string, itemId: string) => {
      const updated = lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: list.items.filter((item) => item.id !== itemId),
              updatedAt: new Date(),
            }
          : list
      );
      saveLists(updated);
    },
    [lists, saveLists]
  );

  const publishList = useCallback(
    (id: string) => {
      updateList(id, { isPublished: true });
    },
    [updateList]
  );

  const getListByAccessCode = useCallback(
    (code: string) => {
      return lists.find((list) => list.accessCode === code && list.isPublished);
    },
    [lists]
  );

  const getListsByLevel = useCallback(
    (level: SchoolSupplyList["level"]) => {
      return lists.filter((list) => list.level === level);
    },
    [lists]
  );

  const calculateTotal = useCallback((listId: string) => {
    const list = lists.find((l) => l.id === listId);
    if (!list) return 0;
    return list.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  }, [lists]);

  return {
    lists,
    createList,
    updateList,
    deleteList,
    addItem,
    removeItem,
    publishList,
    getListByAccessCode,
    getListsByLevel,
    calculateTotal,
  };
}
