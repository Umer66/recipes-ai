import { z } from "zod";

export interface Recipe {
  recipeName: string;
  description: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  ingredients: Ingredient[];
  instructions: Instruction[];
  chefTips: string[];
}

export interface Ingredient {
  quantity: string;
  name: string;
}

export interface Instruction {
  step: number;
  description: string;
}

export interface RecipeRequest {
  mainDish: string;
  dietaryRestrictions: string[];
  availableIngredients: string;
  maxCookingTime: number;
  servingSize: number;
}

export interface PantryItem {
  id: string;
  name: string;
  category: string;
}

export interface Timer {
  id: string;
  label: string;
  duration: number;
  remaining: number;
  isActive: boolean;
}

// Zod Schema for Recipe Request Validation
export const RecipeRequestSchema = z.object({
  mainDish: z
    .string()
    .min(2, "Please specify what you'd like to cook (at least 2 characters)")
    .max(100, "Dish name must be less than 100 characters")
    .regex(
      /^[a-zA-Z\s\-',&()]+$/,
      "Dish name can only contain letters, spaces, hyphens, apostrophes, commas, ampersands, and parentheses"
    ),

  dietaryRestrictions: z
    .array(z.string())
    .max(5, "Please select no more than 5 dietary restrictions"),

  availableIngredients: z
    .string()
    .max(500, "Ingredients list must be less than 500 characters"),

  maxCookingTime: z
    .number()
    .min(15, "Cooking time must be at least 15 minutes")
    .max(480, "Cooking time cannot exceed 8 hours (480 minutes)")
    .int("Cooking time must be a whole number"),

  servingSize: z
    .number()
    .min(1, "Must serve at least 1 person")
    .max(20, "Cannot serve more than 20 people")
    .int("Serving size must be a whole number"),
});

// Type inference from Zod schema - this will match the RecipeRequest interface
export type RecipeRequestFormData = z.infer<typeof RecipeRequestSchema>;

// Validation schema for individual ingredients
export const IngredientSchema = z.object({
  quantity: z
    .string()
    .min(1, "Quantity is required")
    .max(50, "Quantity description too long"),
  name: z
    .string()
    .min(1, "Ingredient name is required")
    .max(100, "Ingredient name too long"),
});

// Validation schema for cooking instructions
export const InstructionSchema = z.object({
  step: z.number().int().positive("Step number must be positive"),
  description: z
    .string()
    .min(10, "Instruction must be at least 10 characters")
    .max(500, "Instruction too long"),
});

// Full recipe validation schema
export const RecipeSchema = z.object({
  recipeName: z
    .string()
    .min(2, "Recipe name must be at least 2 characters")
    .max(100, "Recipe name too long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description too long"),
  prepTimeMinutes: z
    .number()
    .min(0, "Prep time cannot be negative")
    .max(240, "Prep time cannot exceed 4 hours"),
  cookTimeMinutes: z
    .number()
    .min(0, "Cook time cannot be negative")
    .max(480, "Cook time cannot exceed 8 hours"),
  servings: z
    .number()
    .min(1, "Must serve at least 1 person")
    .max(50, "Cannot serve more than 50 people"),
  ingredients: z
    .array(IngredientSchema)
    .min(1, "Recipe must have at least 1 ingredient")
    .max(30, "Recipe cannot have more than 30 ingredients"),
  instructions: z
    .array(InstructionSchema)
    .min(1, "Recipe must have at least 1 instruction")
    .max(20, "Recipe cannot have more than 20 steps"),
  chefTips: z
    .array(z.string().max(200, "Each tip must be less than 200 characters"))
    .max(10, "Cannot have more than 10 tips"),
});

// Available dietary restrictions for validation
export const DIETARY_RESTRICTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Keto",
  "Paleo",
  "Low-Carb",
  "High-Protein",
  "Nut-Free",
  "Soy-Free",
] as const;

export type DietaryRestriction = (typeof DIETARY_RESTRICTIONS)[number];

// Schema for pantry items
export const PantryItemSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
  name: z
    .string()
    .min(1, "Item name is required")
    .max(100, "Item name too long"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(50, "Category name too long"),
});

// Timer validation schema
export const TimerSchema = z.object({
  id: z.string().uuid("Invalid timer ID"),
  label: z
    .string()
    .min(1, "Timer label is required")
    .max(50, "Timer label too long"),
  duration: z
    .number()
    .positive("Duration must be positive")
    .max(7200, "Timer cannot exceed 2 hours"),
  remaining: z.number().min(0, "Remaining time cannot be negative"),
  isActive: z.boolean(),
});

// Form field validation helpers
export const createFieldError = (message: string) => ({
  type: "manual" as const,
  message,
});

// Validation utilities
export const validateCookingTime = (time: number): boolean => {
  return time >= 15 && time <= 480 && Number.isInteger(time);
};

export const validateServingSize = (size: number): boolean => {
  return size >= 1 && size <= 20 && Number.isInteger(size);
};

export const sanitizeIngredientList = (ingredients: string): string => {
  return ingredients
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .join(", ");
};
