"use client";

import { useState } from "react";
import { RecipeForm } from "@/components/recipe-form";
import { RecipeDisplay } from "@/components/recipe-display";
import { generateRecipe } from "@/lib/llm";
import { Recipe, RecipeRequest, RecipeRequestFormData } from "@/types/recipe";
import { ChefHat, Sparkles, Utensils, Clock } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRecipeRequest = async (request: RecipeRequestFormData) => {
    // Convert form data to the expected RecipeRequest format
    const recipeRequest: RecipeRequest = {
      mainDish: request.mainDish,
      dietaryRestrictions: request.dietaryRestrictions,
      availableIngredients: request.availableIngredients,
      maxCookingTime: request.maxCookingTime,
      servingSize: request.servingSize,
    };
    setIsLoading(true);
    setError(null);

    try {
      const generatedRecipe = await generateRecipe(recipeRequest);
      setRecipe(generatedRecipe);
      toast.success("Recipe generated successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate recipe";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setRecipe(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent via-background to-accent">
      {/* Header */}

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {!recipe ? (
          <div className="space-y-8 sm:space-y-12">
            {/* Hero Section */}

            {/* Recipe Form */}
            <section>
              <RecipeForm
                onSubmit={handleRecipeRequest}
                isLoading={isLoading}
              />
            </section>

            {/* Error Display */}
            {error && (
              <section className="max-w-2xl mx-auto">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center gap-3 text-destructive">
                    <div className="w-2 h-2 bg-destructive rounded-full flex-shrink-0" />
                    <span className="font-medium">Error generating recipe</span>
                  </div>
                  <p className="mt-2 text-destructive text-sm">{error}</p>
                </div>
              </section>
            )}
          </div>
        ) : (
          <RecipeDisplay recipe={recipe} onStartOver={handleStartOver} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border/10 mt-12 sm:mt-16 lg:mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Powered by AI • Made with care for home cooks everywhere
            </p>
            <p className="text-xs text-muted-foreground">
              © 2024 Meal. Cooking made simple and intelligent.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
