"use client";

import { useState, useEffect } from "react";
import { Recipe, PantryItem, Timer } from "@/types/recipe";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Clock,
  Users,
  ChefHat,
  Printer,
  ShoppingCart,
  Timer as TimerIcon,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Lightbulb,
  ArrowLeft,
  Package,
  CheckCircle,
  AlertCircle,
  Copy,
  Download,
  Share,
  Scale,
  List,
  PlayCircle,
} from "lucide-react";
import { scaleQuantity, extractTimeFromInstruction } from "@/lib/recipe-utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getPantryItems,
  addPantryItem,
  removePantryItem,
  checkIngredientAvailability,
} from "@/lib/pantry-storage";
import { generateIngredientSubstitution, generateRecipe } from "@/lib/llm";
import { toast } from "sonner";
import { PantryManager } from "@/components/pantry-manager";
import { KitchenTimer } from "@/components/kitchen-timer";
import { CookingMode } from "@/components/cooking-mode";

interface RecipeDisplayProps {
  recipe: Recipe;
  onStartOver: () => void;
}

export function RecipeDisplay({
  recipe: initialRecipe,
  onStartOver,
}: RecipeDisplayProps) {
  const [recipe, setRecipe] = useState<Recipe>(initialRecipe);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(
    new Set()
  );
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [timers, setTimers] = useState<Timer[]>([]);
  const [showPantryManager, setShowPantryManager] = useState(false);
  const [showCookingMode, setShowCookingMode] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [substitutionLoading, setSubstitutionLoading] = useState<number | null>(
    null
  );

  useEffect(() => {
    setPantryItems(getPantryItems());
  }, []);

  const scaleRecipe = (newScale: number) => {
    if (newScale <= 0) return;

    const scaledRecipe = {
      ...initialRecipe,
      servings: Math.round(initialRecipe.servings * newScale),
      ingredients: initialRecipe.ingredients.map((ingredient) => ({
        ...ingredient,
        quantity: scaleQuantity(ingredient.quantity, newScale),
      })),
    };

    setRecipe(scaledRecipe);
    setScaleFactor(newScale);
    setCheckedIngredients(new Set());
  };

  const handleIngredientCheck = (index: number, checked: boolean) => {
    const newChecked = new Set(checkedIngredients);
    if (checked) {
      newChecked.add(index);
    } else {
      newChecked.delete(index);
    }
    setCheckedIngredients(newChecked);
  };

  const getMissingIngredients = () => {
    return recipe.ingredients.filter(
      (_, index) =>
        !checkedIngredients.has(index) &&
        !checkIngredientAvailability(_.name, pantryItems)
    );
  };

  const getRecipeMetrics = () => {
    const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
    const checkedCount = checkedIngredients.size;
    const totalIngredients = recipe.ingredients.length;
    const progressPercent = Math.round((checkedCount / totalIngredients) * 100);

    return {
      totalTime,
      progressPercent,
      checkedCount,
      totalIngredients,
    };
  };

  const { totalTime, progressPercent, checkedCount, totalIngredients } =
    getRecipeMetrics();

  const generateShoppingList = () => {
    const missingIngredients = getMissingIngredients();

    if (missingIngredients.length === 0) {
      toast.success("You have all ingredients!");
      return;
    }

    setShowShoppingList(true);
  };

  const copyShoppingList = () => {
    const missingIngredients = getMissingIngredients();
    const shoppingList = missingIngredients
      .map((ing) => `${ing.quantity} ${ing.name}`)
      .join("\n");

    navigator.clipboard.writeText(shoppingList);
    toast.success("Shopping list copied to clipboard!");
  };

  const downloadShoppingList = () => {
    const missingIngredients = getMissingIngredients();
    const shoppingList = missingIngredients
      .map((ing) => `${ing.quantity} ${ing.name}`)
      .join("\n");

    const blob = new Blob(
      [`Shopping List for ${recipe.recipeName}\n\n${shoppingList}`],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${recipe.recipeName
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}_shopping_list.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Shopping list downloaded!");
  };

  const shareShoppingList = async () => {
    const missingIngredients = getMissingIngredients();
    const shoppingList = missingIngredients
      .map((ing) => `${ing.quantity} ${ing.name}`)
      .join("\n");

    const shareText = `Shopping List for ${recipe.recipeName}:\n\n${shoppingList}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Shopping List - ${recipe.recipeName}`,
          text: shareText,
        });
        toast.success("Shopping list shared!");
      } catch (error) {
        // Fallback to clipboard if sharing fails
        navigator.clipboard.writeText(shareText);
        toast.success("Shopping list copied to clipboard!");
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(shareText);
      toast.success("Shopping list copied to clipboard!");
    }
  };

  const shareRecipe = async () => {
    const recipeText = `${recipe.recipeName}\n\n${
      recipe.description
    }\n\nPrep: ${recipe.prepTimeMinutes} min | Cook: ${
      recipe.cookTimeMinutes
    } min | Serves: ${recipe.servings}\n\nIngredients:\n${recipe.ingredients
      .map((ing) => `• ${ing.quantity} ${ing.name}`)
      .join("\n")}\n\nInstructions:\n${recipe.instructions
      .map((inst) => `${inst.step}. ${inst.description}`)
      .join("\n")}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.recipeName,
          text: recipeText,
        });
        toast.success("Recipe shared successfully!");
      } catch (error) {
        // Fallback to clipboard if sharing fails
        navigator.clipboard.writeText(recipeText);
        toast.success("Recipe copied to clipboard!");
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(recipeText);
      toast.success("Recipe copied to clipboard!");
    }
  };

  const handlePrintRecipe = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${recipe.recipeName}</title>
          <style>
            body { font-family: serif; line-height: 1.6; margin: 40px; }
            h1 { color: #d97706; border-bottom: 2px solid #d97706; padding-bottom: 10px; }
            h2 { color: #374151; margin-top: 30px; }
            .recipe-info { display: flex; gap: 20px; margin: 20px 0; }
            .recipe-info span { background: #f3f4f6; padding: 5px 10px; border-radius: 5px; }
            ul, ol { padding-left: 20px; }
            li { margin: 8px 0; }
            .tips { background: #fef3cd; padding: 15px; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>${recipe.recipeName}</h1>
          <p><em>${recipe.description}</em></p>
          
          <div class="recipe-info">
            <span><strong>Prep:</strong> ${recipe.prepTimeMinutes} min</span>
            <span><strong>Cook:</strong> ${recipe.cookTimeMinutes} min</span>
            <span><strong>Serves:</strong> ${recipe.servings}</span>
          </div>

          <h2>Ingredients</h2>
          <ul>
            ${recipe.ingredients
              .map((ing) => `<li>${ing.quantity} ${ing.name}</li>`)
              .join("")}
          </ul>

          <h2>Instructions</h2>
          <ol>
            ${recipe.instructions
              .map((inst) => `<li>${inst.description}</li>`)
              .join("")}
          </ol>

          ${
            recipe.chefTips.length > 0
              ? `
            <div class="tips">
              <h2>Chef's Tips</h2>
              <ul>
                ${recipe.chefTips.map((tip) => `<li>${tip}</li>`).join("")}
              </ul>
            </div>
          `
              : ""
          }
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const addTimer = (instruction: string, index: number) => {
    const timeInMinutes = extractTimeFromInstruction(instruction);
    if (!timeInMinutes) return;

    const newTimer: Timer = {
      id: crypto.randomUUID(),
      label: `Step ${index + 1}`,
      duration: timeInMinutes * 60,
      remaining: timeInMinutes * 60,
      isActive: false,
    };

    setTimers((prev) => [...prev, newTimer]);
    toast.success(`Timer added: ${timeInMinutes} minutes`);
  };

  const handleSubstitution = async (ingredientIndex: number) => {
    setSubstitutionLoading(ingredientIndex);
    try {
      const ingredient = recipe.ingredients[ingredientIndex];
      const restriction = " suitable for m y dietary needs"; // Could be enhanced to use actual restrictions
      const substitution = await generateIngredientSubstitution(
        ingredient.name,
        restriction
      );
      toast.success(`Substitution suggestion: ${substitution}`);
    } catch (error) {
      toast.error("Failed to get substitution suggestion");
    } finally {
      setSubstitutionLoading(null);
    }
  };

  const availableIngredients = recipe.ingredients.filter(
    (_, index) =>
      checkedIngredients.has(index) ||
      checkIngredientAvailability(_.name, pantryItems)
  ).length;

  const missingIngredients = getMissingIngredients();

  if (showCookingMode) {
    return (
      <CookingMode
        recipe={recipe}
        onExit={() => setShowCookingMode(false)}
        timers={timers}
        setTimers={setTimers}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-6">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={onStartOver}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Form</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        {/* Recipe Hero */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-2xl">
                <ChefHat className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                {recipe.recipeName}
              </CardTitle>
              <CardDescription className="text-base sm:text-lg max-w-2xl mx-auto">
                {recipe.description}
              </CardDescription>
            </div>

            {/* Recipe Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="text-center space-y-1">
                <div className="p-2 bg-background/50 rounded-lg">
                  <Clock className="w-5 h-5 mx-auto text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="font-semibold">{totalTime} min</p>
              </div>
              <div className="text-center space-y-1">
                <div className="p-2 bg-background/50 rounded-lg">
                  <Users className="w-5 h-5 mx-auto text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Servings</p>
                <p className="font-semibold">{recipe.servings}</p>
              </div>
              <div className="text-center space-y-1">
                <div className="p-2 bg-background/50 rounded-lg">
                  <List className="w-5 h-5 mx-auto text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Ingredients</p>
                <p className="font-semibold">{recipe.ingredients.length}</p>
              </div>
              <div className="text-center space-y-1">
                <div className="p-2 bg-background/50 rounded-lg">
                  <Scale className="w-5 h-5 mx-auto text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Difficulty</p>
                <p className="font-semibold">
                  {totalTime < 30
                    ? "Easy"
                    : totalTime < 60
                    ? "Medium"
                    : "Advanced"}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button
                onClick={() => setShowCookingMode(true)}
                className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                size="lg"
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                Start Cooking
              </Button>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={handlePrintRecipe}
                  className="flex-1 sm:flex-none"
                  size="default"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  onClick={shareRecipe}
                  className="flex-1 sm:flex-none"
                  size="default"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="ingredients" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ingredients" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Ingredients</span>
            <span className="sm:hidden">Items</span>
            <Badge variant="secondary" className="ml-1">
              {checkedCount}/{totalIngredients}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="instructions" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Instructions</span>
            <span className="sm:hidden">Steps</span>
          </TabsTrigger>
          <TabsTrigger value="tips" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">Tips & Tools</span>
            <span className="sm:hidden">Tips</span>
          </TabsTrigger>
        </TabsList>

        {/* Ingredients Tab */}
        <TabsContent value="ingredients" className="space-y-6 mt-6">
          {/* Scaling Controls */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Recipe Scaling
              </CardTitle>
              <CardDescription>
                Adjust the recipe to serve more or fewer people
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => scaleRecipe(Math.max(0.5, scaleFactor - 0.5))}
                  disabled={scaleFactor <= 0.5}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="text-center min-w-[120px]">
                  <p className="text-2xl font-bold">{recipe.servings}</p>
                  <p className="text-sm text-muted-foreground">
                    servings ({scaleFactor}x)
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => scaleRecipe(Math.min(5, scaleFactor + 0.5))}
                  disabled={scaleFactor >= 5}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ingredients List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Ingredients</CardTitle>
                  <CardDescription>
                    Check off items as you gather them
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={generateShoppingList}
                  size="sm"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Shopping List
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] h-full overflow-y-auto">
                {recipe.ingredients.map((ingredient, index) => {
                  const isChecked = checkedIngredients.has(index);
                  const isAvailable = checkIngredientAvailability(
                    ingredient.name,
                    pantryItems
                  );

                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        isChecked
                          ? "bg-success/10 border-success/20"
                          : isAvailable
                          ? "bg-primary/5 border-primary/20"
                          : "bg-background border-border"
                      }`}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleIngredientCheck(index, checked as boolean)
                        }
                        className="flex-shrink-0"
                      />
                      <div className="flex-1">
                        <p
                          className={`font-medium ${
                            isChecked
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        >
                          {ingredient.quantity} {ingredient.name}
                        </p>
                        {isAvailable && !isChecked && (
                          <p className="text-xs text-primary font-medium">
                            Available in pantry
                          </p>
                        )}
                      </div>
                      {isChecked && (
                        <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Progress Indicator */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Progress</p>
                  <p className="text-sm text-muted-foreground">
                    {checkedCount} of {totalIngredients} ingredients
                  </p>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instructions Tab */}
        <TabsContent value="instructions" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cooking Instructions</CardTitle>
              <CardDescription>
                Follow these steps to create your dish
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recipe.instructions.map((instruction, index) => {
                  const timeRequired = extractTimeFromInstruction(
                    instruction.description
                  );

                  return (
                    <div
                      key={instruction.step}
                      className="flex gap-4 p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                          {instruction.step}
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="leading-relaxed">
                          {instruction.description}
                        </p>
                        {timeRequired && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>~{timeRequired} minutes</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tips Tab */}
        <TabsContent value="tips" className="space-y-6 mt-6">
          {/* Chef's Tips */}
          {recipe.chefTips.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Chef's Tips
                </CardTitle>
                <CardDescription>
                  Professional tips to make your dish even better
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recipe.chefTips.map((tip, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-3 bg-primary/5 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Kitchen Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kitchen Tools</CardTitle>
              <CardDescription>
                Recommended tools for this recipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  "Large Pan",
                  "Cutting Board",
                  "Sharp Knife",
                  "Measuring Cups",
                  "Mixing Bowl",
                  "Wooden Spoon",
                ].map((tool, index) => (
                  <div
                    key={index}
                    className="p-3 bg-muted/50 rounded-lg text-center"
                  >
                    <p className="text-sm font-medium">{tool}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs and Modals */}
      {showCookingMode && (
        <CookingMode
          recipe={recipe}
          onExit={() => setShowCookingMode(false)}
          timers={timers}
          setTimers={setTimers}
        />
      )}

      {/* Shopping List Dialog */}
      <Dialog open={showShoppingList} onOpenChange={setShowShoppingList}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Shopping List
            </DialogTitle>
            <DialogDescription>
              Items you need to buy for this recipe
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {missingIngredients.length > 0 ? (
              <>
                <div className="bg-muted/50 p-4 max-h-64 overflow-y-auto rounded-lg border">
                  <ul className="space-y-2">
                    {missingIngredients.map((ingredient, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        <span className="font-medium">
                          {ingredient.quantity}
                        </span>
                        <span>{ingredient.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-2">
                  <Button onClick={copyShoppingList} className="w-full">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={downloadShoppingList}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" onClick={shareShoppingList}>
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                <p className="text-lg font-medium text-foreground">
                  You're all set!
                </p>
                <p className="text-muted-foreground">
                  You have all the ingredients needed.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Pantry Manager Dialog */}
      <Dialog open={showPantryManager} onOpenChange={setShowPantryManager}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>My Pantry Manager</DialogTitle>
            <DialogDescription>
              Manage your pantry items to get better recipe suggestions and
              shopping lists.
            </DialogDescription>
          </DialogHeader>
          <PantryManager pantryItems={pantryItems} onUpdate={setPantryItems} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
