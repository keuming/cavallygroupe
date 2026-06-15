import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSchoolDashboard } from "./useSchoolDashboard";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useSchoolDashboard", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should initialize with empty lists", () => {
    const { result } = renderHook(() => useSchoolDashboard());
    expect(result.current.lists).toEqual([]);
  });

  it("should create a new list", () => {
    const { result } = renderHook(() => useSchoolDashboard());

    act(() => {
      result.current.createList("École Primaire ABC", "primaire");
    });

    expect(result.current.lists).toHaveLength(1);
    expect(result.current.lists[0].schoolName).toBe("École Primaire ABC");
    expect(result.current.lists[0].level).toBe("primaire");
    expect(result.current.lists[0].items).toEqual([]);
    expect(result.current.lists[0].isPublished).toBe(false);
  });

  it("should add an item to a list", () => {
    const { result } = renderHook(() => useSchoolDashboard());

    let listId: string;

    act(() => {
      const list = result.current.createList("École", "primaire");
      listId = list.id;
    });

    act(() => {
      result.current.addItem(listId!, {
        name: "Cahier",
        quantity: 5,
        price: 1000,
        category: "Fournitures",
      });
    });

    expect(result.current.lists[0].items).toHaveLength(1);
    expect(result.current.lists[0].items[0].name).toBe("Cahier");
    expect(result.current.lists[0].items[0].quantity).toBe(5);
    expect(result.current.lists[0].items[0].price).toBe(1000);
  });

  it("should remove an item from a list", () => {
    const { result } = renderHook(() => useSchoolDashboard());

    let listId: string;
    let itemId: string;

    act(() => {
      const list = result.current.createList("École", "primaire");
      listId = list.id;
    });

    act(() => {
      result.current.addItem(listId!, {
        name: "Cahier",
        quantity: 5,
        price: 1000,
        category: "Fournitures",
      });
    });

    itemId = result.current.lists[0].items[0].id;

    act(() => {
      result.current.removeItem(listId!, itemId!);
    });

    expect(result.current.lists[0].items).toHaveLength(0);
  });

  it("should calculate total price correctly", () => {
    const { result } = renderHook(() => useSchoolDashboard());

    let listId: string;

    act(() => {
      const list = result.current.createList("École", "primaire");
      listId = list.id;
    });

    act(() => {
      result.current.addItem(listId!, {
        name: "Cahier",
        quantity: 5,
        price: 1000,
        category: "Fournitures",
      });
      result.current.addItem(listId!, {
        name: "Stylo",
        quantity: 10,
        price: 500,
        category: "Fournitures",
      });
    });

    const total = result.current.calculateTotal(listId!);
    expect(total).toBe(5000 + 5000); // (5 * 1000) + (10 * 500)
  });

  it("should publish a list", () => {
    const { result } = renderHook(() => useSchoolDashboard());

    let listId: string;

    act(() => {
      const list = result.current.createList("École", "primaire");
      listId = list.id;
    });

    expect(result.current.lists[0].isPublished).toBe(false);

    act(() => {
      result.current.publishList(listId!);
    });

    expect(result.current.lists[0].isPublished).toBe(true);
  });

  it("should delete a list", () => {
    const { result } = renderHook(() => useSchoolDashboard());

    let listId: string;

    act(() => {
      const list = result.current.createList("École", "primaire");
      listId = list.id;
    });

    expect(result.current.lists).toHaveLength(1);

    act(() => {
      result.current.deleteList(listId!);
    });

    expect(result.current.lists).toHaveLength(0);
  });

  it("should get list by access code", () => {
    const { result } = renderHook(() => useSchoolDashboard());

    let listId: string;
    let accessCode: string;

    act(() => {
      const list = result.current.createList("École", "primaire");
      listId = list.id;
      accessCode = list.accessCode!;
    });

    act(() => {
      result.current.publishList(listId!);
    });

    const foundList = result.current.getListByAccessCode(accessCode);
    expect(foundList).toBeDefined();
    expect(foundList?.schoolName).toBe("École");
  });

  it("should get lists by level", () => {
    const { result } = renderHook(() => useSchoolDashboard());

    act(() => {
      result.current.createList("École Primaire", "primaire");
      result.current.createList("Collège", "collège");
      result.current.createList("Lycée", "lycée");
      result.current.createList("École Primaire 2", "primaire");
    });

    const primaryLists = result.current.getListsByLevel("primaire");
    expect(primaryLists).toHaveLength(2);
    expect(primaryLists.every((l) => l.level === "primaire")).toBe(true);
  });

  it("should persist lists to localStorage", () => {
    const { result } = renderHook(() => useSchoolDashboard());

    act(() => {
      result.current.createList("École", "primaire");
    });

    const stored = localStorage.getItem("school_supply_lists");
    expect(stored).toBeDefined();
    expect(JSON.parse(stored!)).toHaveLength(1);
  });

  it("should load lists from localStorage on initialization", () => {
    const testList = {
      id: "test-1",
      schoolName: "Test School",
      level: "primaire" as const,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublished: false,
      accessCode: "TEST123",
    };

    localStorage.setItem("school_supply_lists", JSON.stringify([testList]));

    const { result } = renderHook(() => useSchoolDashboard());
    expect(result.current.lists).toHaveLength(1);
    expect(result.current.lists[0].schoolName).toBe("Test School");
  });

  it("should update list details", () => {
    const { result } = renderHook(() => useSchoolDashboard());

    let listId: string;

    act(() => {
      const list = result.current.createList("École", "primaire");
      listId = list.id;
    });

    act(() => {
      result.current.updateList(listId!, { schoolName: "Nouvelle École" });
    });

    expect(result.current.lists[0].schoolName).toBe("Nouvelle École");
  });

  it("should generate unique access codes", () => {
    const { result } = renderHook(() => useSchoolDashboard());

    let list1: any, list2: any;

    act(() => {
      list1 = result.current.createList("École 1", "primaire");
      list2 = result.current.createList("École 2", "primaire");
    });

    expect(list1.accessCode).not.toBe(list2.accessCode);
  });
});
