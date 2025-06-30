"use client";

import { useState } from "react";
import { PantryItem } from "@/types/recipe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Package } from "lucide-react";
import {
  addPantryItem,
  removePantryItem,
  savePantryItems,
} from "@/lib/pantry-storage";
import { toast } from "sonner";

interface PantryManagerProps {
  pantryItems: PantryItem[];
  onUpdate: (items: PantryItem[]) => void;
}

const CATEGORIES = [
  "Protein",
  "Dairy",
  "Grains",
  "Vegetables",
  "Fruits",
  "Spices",
  "Oils & Vinegar",
  "Canned Goods",
  "Frozen",
  "Baking",
  "Other",
];

export function PantryManager({ pantryItems, onUpdate }: PantryManagerProps) {
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const handleAddItem = () => {
    if (!newItemName.trim() || !newItemCategory) {
      toast.error("Please enter both name and category");
      return;
    }

    const newItem = addPantryItem({
      name: newItemName.trim(),
      category: newItemCategory,
    });

    onUpdate([...pantryItems, newItem]);
    setNewItemName("");
    setNewItemCategory("");
    toast.success(`Added ${newItem.name} to pantry`);
  };

  const handleRemoveItem = (id: string) => {
    removePantryItem(id);
    const updatedItems = pantryItems.filter((item) => item.id !== id);
    onUpdate(updatedItems);
    toast.success("Item removed from pantry");
  };

  const filteredItems =
    selectedCategory === "All"
      ? pantryItems
      : pantryItems.filter((item) => item.category === selectedCategory);

  const categoryCounts = CATEGORIES.reduce((acc, category) => {
    acc[category] = pantryItems.filter(
      (item) => item.category === category
    ).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Add New Item */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Add New Item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                placeholder="e.g., Olive Oil, Chicken Breast..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddItem()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemCategory">Category</Label>
              <Select
                value={newItemCategory}
                onValueChange={setNewItemCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={handleAddItem}
            className="w-full"
            disabled={!newItemName.trim() || !newItemCategory}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add to Pantry
          </Button>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <Label
          htmlFor="categoryFilter"
          className="text-sm font-medium flex-shrink-0"
        >
          Filter by category:
        </Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category} ({categoryCounts[category] || 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pantry Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            Your Pantry ({filteredItems.length} items)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <Package className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
              <p className="text-sm sm:text-base">No items in this category</p>
              <p className="text-xs sm:text-sm">
                Add ingredients you have on hand to get better recipe
                suggestions
              </p>
            </div>
          ) : (
            <div className="grid gap-2 sm:gap-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 sm:p-3 border hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <span className="font-medium text-sm sm:text-base truncate">
                      {item.name}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-xs flex-shrink-0"
                    >
                      {item.category}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
