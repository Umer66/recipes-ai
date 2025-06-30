import { PantryItem } from "@/types/recipe";

const PANTRY_KEY = "culinary-assistant-pantry";

export function getPantryItems(): PantryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(PANTRY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function savePantryItems(items: PantryItem[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(PANTRY_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save pantry items:", error);
  }
}

export function addPantryItem(item: Omit<PantryItem, "id">): PantryItem {
  const newItem: PantryItem = {
    ...item,
    id: crypto.randomUUID(),
  };

  const items = getPantryItems();
  items.push(newItem);
  savePantryItems(items);

  return newItem;
}

export function removePantryItem(id: string): void {
  const items = getPantryItems();
  const filtered = items.filter((item) => item.id !== id);
  savePantryItems(filtered);
}

export function checkIngredientAvailability(
  ingredientName: string,
  pantryItems: PantryItem[]
): boolean {
  const normalized = ingredientName.toLowerCase();
  return pantryItems.some(
    (item) =>
      item.name.toLowerCase().includes(normalized) ||
      normalized.includes(item.name.toLowerCase())
  );
}
